<template>
  <form class="search-bar py-3 container-fluid" :id="uniqueId" @submit.prevent="submit">
    <div class="d-flex align-items-center">
      <div class="input-group">
        <input v-model="query" :placeholder="$t('search.placeholder')" class="form-control search-bar__input" @blur="hideSuggestionsAfterDelay" @keyup="typingTerms" @focus="typingTerms" />
        <div class="input-group-append">
          <a v-if="!tips" class="search-bar__tips-addon input-group-text px-2" :class="{ 'search-bar__tips-addon--active': showTips }" :href="operatorLinks" target="_blank" title="Tips to improve searching" v-b-tooltip.bottomleft>
            <fa icon="question-circle" />
          </a>
          <b-dropdown :text="$t('search.field.' + field)" variant="outline-light" class="search-bar__field" right>
            <b-dropdown-item v-for="key in fieldOptions" :key="key" @click="field = key">
              {{ $t('search.field.' + key) }}
            </b-dropdown-item>
          </b-dropdown>
          <button type="submit" class="btn btn-dark search-bar__submit">
            {{ $t('search.buttonlabel') }}
          </button>
        </div>
        <div class="search-bar__suggestions dropdown-menu" :class="{ show: !!suggestions.length }">
          <a class="dropdown-item search-bar__suggestions__item px-3 d-flex" v-for="{ key, doc_count } in suggestions" :key="key" @click="selectTerm(key)">
            <div class="flex-grow-1 text-truncate">
              <span v-html="injectTermInQuery(key)"></span>
            </div>
            <div>
              <span class="badge badge-pill badge-light">{{ doc_count }}</span>
            </div>
          </a>
        </div>
      </div>
      <div class="px-0 pl-2" v-if="settings">
        <search-settings placement="bottomleft" :container="uniqueId" />
      </div>
    </div>
    <slide-up-down :active="showTips" v-if="tips">
      <a class="search-bar__tips" :href="operatorLinks" target="_blank">
        <span>
          <span class="mr-1">
            <fa icon="book" class="mr-1" />
            Tips to improve searching
          </span>
          <span class="text-muted text-truncate">
            (AND, OR, ...)
          </span>
        </span>
      </a>
    </slide-up-down>
  </form>
</template>

<script>
import uniqueId from 'lodash/uniqueId'
import bodybuilder from 'bodybuilder'
import get from 'lodash/get'
import last from 'lodash/last'
import map from 'lodash/map'
import some from 'lodash/some'
import throttle from 'lodash/throttle'
import lucene from 'lucene'

import SearchSettings from './SearchSettings'
import esClient from '@/api/esClient'
import settings from '@/utils/settings'

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function escapeLucenneChars(str) {
  const escapable = [" ", "+", "-", "&&", "||", "!", "(", ")", "{", "}", "[", "]", "^", "~", "?", ":", "\\", "/"]
  return some(escapable, char => str.indexOf(char) > -1) ? JSON.stringify(str) : str
}

export default {
  name: 'SearchBar',
  props: {
    tips: {
      type: Boolean
    },
    settings: {
      type: Boolean
    },
    fieldOptions: {
      type: Array,
      default () {
        return settings.searchFields.map(field => field.key)
      }
    }
  },
  components: {
    SearchSettings
  },
  data () {
    return {
      showTips: false,
      query: this.$store.state.search.query,
      field: this.$store.state.search.field,
      operatorLinks: settings.documentationLinks.operators.default,
      suggestions: []
    }
  },
  mounted () {
    this.$store.subscribe((mutation) => {
      if (mutation.type === 'search/query') {
        this.query = mutation.payload
      }
    })
  },
  methods: {
    submit () {
      // Change the route after update the store with the new query
      this.$store.commit('search/field', this.field)
      this.$store.commit('search/query', this.query)
      this.$store.commit('search/from', 0)
      this.$router.push({ name: 'search', query: this.$store.getters['search/toRouteQueryWithStamp'] })
      // And emit an event for those listening...
      this.$emit('submit', this.query)
    },
    async suggestTerms (candidates) {
      const index = this.$store.state.search.index
      const candidate = last(candidates)
      const field = candidate.field === '<implicit>' ? settings.suggestedImplicitField : candidate.field
      const include = `.*${escapeRegExp(candidate.term).toLowerCase()}.*`
      const body = bodybuilder().size(0).aggregation('terms', field, { include }).build()
      const response = await esClient.search({ index, body })
      return get(response, `aggregations.agg_terms_${field}.buckets`, [])
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
      } catch {
        return []
      }
    },
    replaceLastTermCandidate(term, ast = null, highlight = true) {
      // Parse the query by default
      ast = ast === null ? lucene.parse(this.query) : ast
      // Use recursive call for branches
      if (ast.right) this.replaceLastTermCandidate(term, ast.right, highlight)
      else if (ast.left) this.replaceLastTermCandidate(term, ast.left, highlight)
      // Only <implicit> and tag fields are can be read
      else if (settings.suggestedFields.indexOf(ast.field) > -1 && ast.term === last(this.termCandidates()).term) {
        ast.term = ast.quoted ? term : escapeLucenneChars(term)
        ast.term = highlight ? `<strong>${ast.term}</strong>` : ast.term
      }
      return ast
    },
    injectTermInQuery(term, ast = null, highlight = true) {
      try {
        ast = this.replaceLastTermCandidate(term, ast, highlight)
        return lucene.toString(ast)
      } catch {
        return this.query
      }
    },
    typingTerms: throttle(async function () {
      try {
        this.suggestions = this.suggestionsAllowed ? await this.suggestTerms(this.termCandidates()) : []
      } catch {
        this.hideSuggestions()
      }
    }, 200),
    selectTerm(term) {
      this.query = this.injectTermInQuery(term, null, false)
      this.hideSuggestions()
      this.submit()
    },
    hideSuggestions () {
      this.suggestions = []
    },
    hideSuggestionsAfterDelay () {
      setTimeout(() => {
        this.$nextTick(this.hideSuggestions)
      }, 200)
    }
  },
  computed: {
    uniqueId () {
      return uniqueId('search-bar-')
    },
    suggestionsAllowed () {
      const terms = this.termCandidates().map(t => t.term)
      const lastTerm = last(terms) || ''
      return ['all', settings.suggestedImplicitField].indexOf(this.field) > -1 && lastTerm.length > 1
    }
  },
  watch: {
    query (value) {
      this.showTips = value !== ''
    }
  }
}
</script>

<style lang="scss">
  .search-bar {

    .input-group {
      white-space: nowrap;
      flex-wrap: nowrap;
    }

    &__input.form-control {
      border-right: 0;

      &:focus ~ .input-group-append .search-bar__field .btn,
      &:focus ~ .input-group-append .search-bar__tips-addon {
        border-top-color: $input-focus-border-color;
        border-bottom-color: $input-focus-border-color;
      }

      &:focus {
        box-shadow: none;
      }
    }

    &__field {
      border-left: dashed 1px  $input-border-color;

      .btn {
        color: $text-muted;
        border: 1px solid $input-border-color;
        border-left: 0;
        box-shadow: $input-box-shadow;
      }
    }

    &__tips-addon.input-group-text {
      color: $text-muted;
      border-left: 0;
      border-right: 0;
      box-shadow: $input-box-shadow;
      background: white;
      transition: $input-transition, color .15s ease-in-out;
      color: transparent;
      pointer-events: none;
    }

    &__tips-addon--active.input-group-text {
      color: $link-color;
      pointer-events: all;
    }

    &__field.show .btn.dropdown-toggle,
    &__field .btn.dropdown-toggle:hover,
    &__field .btn.dropdown-toggle:active {
      background: transparent;
      box-shadow: $input-box-shadow;
      border:1px solid $input-border-color;
      border-left: 0;
    }

    &__suggestions {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      margin-top: $dropdown-spacer;
      box-shadow: $dropdown-box-shadow;

      & &__item.dropdown-item {
        cursor: pointer;

        &:active, &:focus {
          color: white;
        }
      }
    }

    &__tips {
      display: block;
      padding: $spacer / 2 0 0;
      font-size: 0.9rem;
      z-index: 100;
      border-radius: 0 0 $input-border-radius $input-border-radius;
    }

    & .input-group > .input-group-append > &__submit.btn {
      border-top-right-radius: $input-border-radius;
      border-bottom-right-radius: $input-border-radius;
    }
  }
</style>
