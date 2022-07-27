<template>
  <form class="search-bar container-fluid" :id="uniqueId" @submit.prevent="submit" :class="{ 'search-bar--focused': focused, 'search-bar--animated': animated }">
    <div class="d-flex align-items-center">
      <div class="input-group" :class="{ ['input-group-' + size]: true }">
        <input
          v-model="query"
          class="form-control search-bar__input"
          :placeholder="$t('search.placeholder')"
          @blur="onBlur"
          @input="onInput"
          @focus="onFocus">
        <div class="input-group-append">
          <template  v-if="!tips">
            <router-link :to="{ name: 'docs', params: { slug: 'all-search-with-operators' } }" class="search-bar__tips-addon input-group-text px-2" :class="{ 'search-bar__tips-addon--active': showTips }" :title="$t('search.tips')" v-b-tooltip.bottomleft>
              <fa icon="question-circle" fixed-width />
            </router-link>
          </template>
          <b-dropdown :text="$t('search.field.' + field)" variant="outline-light" class="search-bar__field" right :class="{ 'search-bar__field--selected': field !== 'all' }">
            <b-dropdown-item v-for="key in fieldOptions" :key="key" @click="field = key">
              {{ $t('search.field.' + key) }}
            </b-dropdown-item>
          </b-dropdown>
          <button type="submit" class="btn btn-dark search-bar__submit">
            {{ $t('search.buttonLabel') }}
          </button>
        </div>
        <selectable-dropdown
          class="search-bar__suggestions dropdown-menu"
          ref="suggestions"
          @input="selectTerm"
          @click.native="submit"
          @deactivate="hideSuggestions"
          :hide="!suggestions.length"
          :items="suggestions">
          <template v-slot:item-label="{ item }">
            <div class="d-flex">
              <div class="flex-grow-1 text-truncate">
                <span v-html="injectTermInQuery(item.key)"></span>
              </div>
            </div>
          </template>
        </selectable-dropdown>
      </div>
      <div class="px-0" v-if="settings">
        <shortkeys-modal class="d-none d-md-inline"></shortkeys-modal>
        <b-btn class="text-dark" variant="transparent" size="md" :title="$t('userHistory.saveSearch')"
              v-b-tooltip.hover.bottomleft @click="$refs['user-history-save-search-form'].show()">
          <fa icon="save"/>
          <b-modal body-class="p-0"
               hide-footer
               ref="user-history-save-search-form"
               size="md"
               :title="$t('userHistory.saveSearch')">
            <user-history-save-search-form :indices="indices"
                                           :uri="uri"
                                           @submit="$refs['user-history-save-search-form'].hide()"/>
          </b-modal>
        </b-btn>
      </div>
    </div>
  </form>
</template>

<script>
import { castArray, concat, escapeRegExp, each, get, last, orderBy, some, throttle, uniqueId } from 'lodash'
import bodybuilder from 'bodybuilder'
import lucene from 'lucene'

import elasticsearch from '@/api/elasticsearch'
import ShortkeysModal from '@/components/ShortkeysModal'
import UserHistorySaveSearchForm from '@/components/UserHistorySaveSearchForm'
import settings from '@/utils/settings'

function escapeLuceneChars (str) {
  const escapable = [' ', '+', '-', '&&', '||', '!', '(', ')', '{', '}', '[', ']', '^', '~', '?', ':', '\\', '/']
  return some(escapable, char => str.indexOf(char) > -1) ? JSON.stringify(str) : str
}

/**
 * The general search form.
 */
export default {
  name: 'SearchBar',
  props: {
    /**
     * Show search suggestions.
     */
    tips: {
      type: Boolean
    },
    /**
     * Animate the focus on the search input.
     */
    animated: {
      type: Boolean
    },
    /**
     * Display the shortcuts button.
     */
    settings: {
      type: Boolean
    },
    /**
     * Search field configuration dictionary.
     */
    fieldOptions: {
      type: Array,
      default () {
        return settings.searchFields.map(field => field.key)
      }
    },
    /**
     * Search input size
     * @values sm, md, lg
     */
    size: {
      type: String,
      default: 'md'
    }
  },
  components: {
    ShortkeysModal,
    UserHistorySaveSearchForm
  },
  data () {
    return {
      field: this.$store.state.search.field,
      focused: false,
      operatorLinks: settings.documentationLinks.operators.default,
      query: this.$store.state.search.query,
      showTips: false,
      suggestions: []
    }
  },
  mounted () {
    this.$store.subscribe(mutation => {
      if (mutation.type === 'search/query') {
        this.$set(this, 'query', mutation.payload)
      }
      if (mutation.type === 'search/reset') {
        this.$set(this, 'field', this.$store.state.search.field)
      }
    })
  },
  methods: {
    submit () {
      this.hideSuggestions()
      // Change the route after update the store with the new query
      this.$store.commit('search/field', this.field)
      this.$store.commit('search/query', this.query)
      this.$store.commit('search/from', 0)
      this.$router.push({ name: 'search', query: this.$store.getters['search/toRouteQueryWithStamp']() })
    },
    async suggestTerms (candidates) {
      const query = this.query
      const index = this.$store.state.search.indices.join(',')
      const candidate = last(candidates)
      const fields = castArray(candidate.field === '<implicit>' ? settings.suggestedImplicitFields : candidate.field)
      const include = `.*${escapeRegExp(candidate.term).toLowerCase()}.*`
      const body = bodybuilder().size(0)
      each(fields, field => {
        body.aggregation('terms', field, { include }, field)
      })
      const preference = 'search-bar-suggestions'
      const response = await elasticsearch.search({ index, body: body.build(), preference })
      let suggestions = []
      each(fields, field => {
        suggestions = concat(suggestions, get(response, `aggregations.${field}.buckets`, []))
      })
      suggestions = orderBy(suggestions, ['doc_count'], ['desc'])
      // Return an object to check later if the promise result is still applicable
      return { query, suggestions }
    },
    termCandidates (ast = null) {
      try {
        // List of terms to return
        let terms = []
        // Parse the query by default
        ast = ast === null ? lucene.parse(this.query) : ast
        // Use recursive call for branches
        if (ast.left) terms = terms.concat(this.termCandidates(ast.left))
        if (ast.right) terms = terms.concat(this.termCandidates(ast.right))
        // Only <implicit> and tag fields are can be read
        if (settings.suggestedFields.indexOf(ast.field) > -1) terms.push(ast)
        // Return all the terms
        return terms
      } catch (_) {
        return []
      }
    },
    replaceLastTermCandidate (term, ast = null, highlight = true) {
      // Parse the query by default
      ast = ast === null ? lucene.parse(this.query) : ast
      // Use recursive call for branches
      if (ast.right) this.replaceLastTermCandidate(term, ast.right, highlight)
      else if (ast.left) this.replaceLastTermCandidate(term, ast.left, highlight)
      // Only <implicit> and tag fields are can be read
      else if (settings.suggestedFields.indexOf(ast.field) > -1 && ast.term === last(this.termCandidates()).term) {
        ast.term = ast.quoted ? term : escapeLuceneChars(term)
        ast.term = highlight ? `<strong>${ast.term}</strong>` : ast.term
      }
      return ast
    },
    injectTermInQuery (term, ast = null, highlight = true) {
      try {
        ast = this.replaceLastTermCandidate(term, ast, highlight)
        return lucene.toString(ast)
      } catch (_) {
        return this.query
      }
    },
    selectTerm (term) {
      this.$set(this, 'query', term ? this.injectTermInQuery(term.key, null, false) : this.query)
    },
    searchTerms: throttle(async function () {
      try {
        if (this.suggestionsAllowed) {
          const { suggestions, query } = await this.suggestTerms(this.termCandidates())
          // Avoid setting suggestions if user lost the focus on the input
          if (this.focused) {
            // Is the query still valid
            this.$set(this, 'suggestions', query === this.query ? suggestions : [])
            this.$refs.suggestions.activeItemIndexes = []
          }
        } else {
          this.$set(this, 'suggestions', [])
        }
      } catch (_) {
        this.hideSuggestions()
      }
    }, 200),
    hideSuggestions () {
      this.$set(this, 'suggestions', [])
    },
    hideSuggestionsAfterDelay () {
      setTimeout(() => {
        this.$nextTick(this.hideSuggestions)
      }, 200)
    },
    onBlur () {
      this.focused = false
      this.hideSuggestionsAfterDelay()
    },
    onInput () {
      this.searchTerms()
    },
    onFocus () {
      this.focused = true
      this.searchTerms()
    }
  },
  computed: {
    indices () {
      return this.$store.state.search.indices
    },
    uniqueId () {
      return uniqueId('search-bar-')
    },
    suggestionsAllowed () {
      const terms = this.termCandidates().map(t => t.term)
      const lastTerm = last(terms) || ''
      return ['all', settings.suggestedImplicitFields].indexOf(this.field) > -1 && lastTerm.length > 4
    },
    uri () {
      return window.location.hash.substr(2)
    }
  },
  watch: {
    query (value) {
      this.$set(this, 'showTips', value !== '')
    }
  }
}
</script>

<style lang="scss" scoped>
  .search-bar {

    .input-group {
      filter: drop-shadow(0 0.3em .6em rgba(black, 0));
      flex-wrap: nowrap;
      transition: transform 0.2s;
      white-space: nowrap;
    }

    &--focused.search-bar--animated {
      .input-group {
        filter: drop-shadow(0 0.3em .6em rgba(black, .2));
        transform: translateY(-0.25em);
      }
    }

    .input-group-md &__input.form-control,
    .input-group-lg &__input.form-control {
      border-radius: 1.5em 0 0 1.5em;
    }

    &__input.form-control {
      border-right: 0;

      &:focus + .input-group-append .search-bar__field &:deep(.btn),
      &:focus + .input-group-append .search-bar__tips-addon {
        border-bottom-color: $input-focus-border-color;
        border-top-color: $input-focus-border-color;
      }

      &:focus {
        box-shadow: none;
      }
    }

    &__field {
      background: $input-bg;
      border-left: dashed 1px  $input-border-color;
      font-size: inherit;

      &--selected:after {
        bottom: 1px;
        border: 2px solid $tertiary;
        content: "";
        left: 0;
        position: absolute;
        right: 1px;
        top: 1px;
      }

      &:deep(.btn) {
        border: 1px solid $input-border-color;
        border-left: 0;
        box-shadow: $input-box-shadow;
        color: $text-muted;

        .input-group-lg & {
          font-size: 1.25rem;
        }
      }
    }

    &__tips-addon.input-group-text {
      background: white;
      border-left: 0;
      border-right: 0;
      box-shadow: $input-box-shadow;
      color: transparent;
      pointer-events: none;
      transition: $input-transition, color .15s ease-in-out;
    }

    &__tips-addon--active.input-group-text {
      color: $link-color;
      pointer-events: all;
    }

    &__field.show .btn.dropdown-toggle,
    &__field .btn.dropdown-toggle:hover,
    &__field .btn.dropdown-toggle:active {
      background: transparent;
      border: 1px solid $input-border-color;
      border-left: 0;
      box-shadow: $input-box-shadow;
    }

    & &__suggestions.dropdown-menu {
      left: 0;
      position: absolute !important;
      right: 0;
      top: 100%;
    }

    &__suggestions {
      box-shadow: $dropdown-box-shadow;
      margin-top: $dropdown-spacer;

      & .dropdown-item {
        cursor: pointer;

        &:active, &:focus, &.active {
          color: white;
        }
      }
    }

    &__tips {
      border-radius: 0 0 $input-border-radius $input-border-radius;
      display: block;
      font-size: 0.9rem;
      padding: $spacer * 0.5 0 0;
      z-index: 100;
    }

    & .input-group > .input-group-append > &__submit.btn {
      border-bottom-right-radius: 1.5em;
      border-top-right-radius: 1.5em;
    }
  }
</style>
