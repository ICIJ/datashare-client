<template>
  <form class="search-bar container-fluid" :id="uniqueId" @submit.prevent="submit" :class="{ 'search-bar--focused': focused, 'search-bar--animated': animated }">
    <div class="d-flex align-items-center">
      <search-bar-input
        v-model="query"
        class="search-bar__input"
        :placeholder="placeholder"
        :size="size"
        @blur="onBlur"
        @input="onInput"
        @focus="onFocus"
      >
        <template #fields>
          <search-bar-input-dropdown
            v-model="field"
            class="search-bar__field-options"
            :fieldOptions="fieldOptions"
            :fieldOptionsPath="fieldOptionsPath"
          />
        </template>
        <template #suggestions>
            <selectable-dropdown
            class="search-bar__suggestions dropdown-menu"
            ref="suggestions"
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
        </template>
      </search-bar-input>
      <div class="px-0" v-if="settings">
        <shortkeys-modal class="d-none d-md-inline"></shortkeys-modal>
        <b-btn v-b-tooltip.hover.bottomleft
               :title="$t('userHistory.saveSearch')"
               class="text-dark"
               size="md"
               variant="transparent"
               @click="$refs['user-history-save-search-form'].show()">
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
import SearchBarInput from '@/components/SearchBarInput'
import SearchBarInputDropdown from '@/components/SearchBarInputDropdown'
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
     * Animate the focus on the search input.
     */
    animated: {
      type: Boolean
    },
    /**
     * Placeholder in the search bar.
     */
    placeholder: {
      type: String,
      default: function () { this.$t('search.placeholder') }
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
     * Field option translation path
     */
    fieldOptionsPath: {
      type: Array,
      default: () => ['search', 'field']
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
    SearchBarInput,
    ShortkeysModal,
    UserHistorySaveSearchForm,
    SearchBarInputDropdown
  },
  data () {
    return {
      field: this.$store.state.search.field,
      focused: false,
      operatorLinks: settings.documentationLinks.operators.default,
      query: this.$store.state.search.query,
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
  }
}
</script>

<style lang="scss" scoped>
  .search-bar {

    &--focused.search-bar--animated {
      :deep(.input-group) {
        filter: drop-shadow(0 0.3em .6em rgba(black, .2));
        transition: transform 0.2s;
        transform: translateY(-0.25em);
      }
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
  }
</style>
