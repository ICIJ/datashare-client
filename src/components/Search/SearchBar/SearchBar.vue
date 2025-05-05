<template>
  <div :id="uniqueId" class="search-bar" :class="{ 'search-bar--focused': focused }">
    <div class="d-flex align-items-center">
      <search-bar-input
        ref="searchInput"
        v-model="query"
        class="search-bar__input w-100"
        :autofocus="autofocus"
        :compact="compact"
        :placeholder="localizedPlaceholder"
        :show-submit="showSubmit"
        :size="size"
        @blur="onBlur"
        @focus="onFocus"
        @input="onInput"
        @clear="onClear"
        @submit="onSubmit"
      >
        <template #addons>
          <search-bar-input-dropdown-for-field
            v-if="!hideFieldDropdown"
            v-model="field"
            :disabled="!!indices"
            :offset="6"
            @changed="focusOnSearchInput"
          />
          <search-bar-input-dropdown-for-projects
            v-if="!hideProjectsDropdown"
            v-model="selectedProjects"
            :disabled="!!indices"
            :no-caret="!!indices"
            :offset="6"
            multiple
            @changed="focusOnSearchInput"
          />
        </template>
        <template #suggestions>
          <selectable-dropdown
            ref="suggestions"
            class="search-bar__suggestions dropdown-menu shadow-lg bg-action-subtle border-action-subtle"
            :hide="hiddenSuggestions"
            :items="suggestions"
            :active-items="activeSuggestions"
            @update:modelValue="selectTerm"
            @click="submit"
          >
            <template #item-label="{ item }">
              <div class="d-flex">
                <div class="flex-grow-1 text-truncate">
                  {{ item.key }}
                </div>
              </div>
            </template>
          </selectable-dropdown>
        </template>
      </search-bar-input>
    </div>
  </div>
</template>

<script>
import { castArray, escapeRegExp, get, iteratee, last, orderBy, some, throttle, uniqueId } from 'lodash'
import bodybuilder from 'bodybuilder'
import lucene from 'lucene'
import { mapStores } from 'pinia'
import { useI18n } from 'vue-i18n'

import { useMobileDetect } from '@/composables/useMobileDetect'
import SearchBarInput from '@/components/Search/SearchBar/SearchBarInput'
import SearchBarInputDropdownForField from '@/components/Search/SearchBar/SearchBarInputDropdownForField'
import SearchBarInputDropdownForProjects from '@/components/Search/SearchBar/SearchBarInputDropdownForProjects'
import settings from '@/utils/settings'
import { useSearchStore } from '@/store/modules'

function escapeLuceneChars(str) {
  const escapable = [' ', '+', '-', '&&', '||', '!', '(', ')', '{', '}', '[', ']', '^', '~', '?', ':', '\\', '/']
  return some(escapable, (char) => str.indexOf(char) > -1) ? JSON.stringify(str) : str
}

/**
 * The general search form.
 */
export default {
  name: 'SearchBar',
  components: {
    SearchBarInput,
    SearchBarInputDropdownForField,
    SearchBarInputDropdownForProjects
  },
  inject: {
    searchStoreSuffix: {
      default: null
    }
  },
  props: {
    /**
     * Placeholder in the search bar.
     */
    placeholder: {
      type: String,
      default: null
    },
    /**
     * Display the shortcuts button.
     */
    settings: {
      type: Boolean
    },
    /**
     * Hide the field dropdown
     */
    hideFieldDropdown: {
      type: Boolean
    },
    /**
     * Hide the projects dropdown
     */
    hideProjectsDropdown: {
      type: Boolean
    },
    /**
     * Search input size
     * @values sm, md, lg
     */
    size: {
      type: String,
      default: 'md'
    },
    /**
     * Force the search bar to search into given indices
     */
    indices: {
      type: Array,
      default: null
    },
    /**
     * Display the submit button
     */
    showSubmit: {
      type: Boolean,
      default: false
    },
    /**
     * Hide addons
     */
    compact: {
      type: Boolean,
      default: false
    }
  },
  emits: ['submit'],
  setup() {
    const { isMobile } = useMobileDetect()
    const { t } = useI18n()
    const autofocus = !isMobile
    return { autofocus, isMobile, t }
  },
  data() {
    return {
      field: null,
      pristine: true,
      focused: false,
      query: null,
      suggestions: [],
      activeSuggestions: []
    }
  },
  computed: {
    ...mapStores(useSearchStore),
    selectedProjects: {
      get() {
        const indices = this.indices ?? this.searchStore.indices
        return indices.filter((index) => !!this.$core.findProject(index)).map((name) => ({ name }))
      },
      set(projects) {
        const indices = projects.map(iteratee('name'))
        this.searchStore.setIndices(indices)
      }
    },
    formIndices() {
      return this.selectedProjects.map(iteratee('name'))
    },
    uniqueId() {
      return uniqueId('search-bar-')
    },
    suggestionsAllowed() {
      const terms = this.termCandidates().map((t) => t.term)
      const lastTerm = last(terms) || ''
      return ['all', settings.suggestedImplicitFields].indexOf(this.field) > -1 && lastTerm.length > 4
    },
    localizedPlaceholder() {
      return this.placeholder ?? this.t('search.placeholder')
    },
    hiddenSuggestions() {
      return !this.suggestions.length || this.pristine
    }
  },
  watch: {
    'searchStore.q': {
      immediate: true,
      handler(value) {
        this.query = value
      }
    },
    'searchStore.field': {
      immediate: true,
      handler(value) {
        this.field = value
      }
    }
  },
  methods: {
    submit() {
      this.hideSuggestions()
      // Change the route after update the store with the new query
      this.searchStore.setIndices(this.formIndices)
      this.searchStore.setField(this.field)
      this.searchStore.setQuery(this.query)
      this.searchStore.setFrom(0)
      const query = this.searchStore.toRouteQueryWithStamp
      this.$router.push({ name: 'search', query })
    },
    async suggestTerms(candidates) {
      const query = this.query
      const index = this.formIndices.join(',')
      const candidate = last(candidates)
      const fields = castArray(candidate.field === '<implicit>' ? settings.suggestedImplicitFields : candidate.field)
      const include = `.*${escapeRegExp(candidate.term).toLowerCase()}.*`
      const body = bodybuilder().size(0)
      fields.forEach((field) => body.aggregation('terms', field, { include }, field))
      const preference = 'search-bar-suggestions'
      const response = await this.$core.api.elasticsearch.search({ index, body: body.build(), preference })
      const suggestionsPerField = fields.map((f) => get(response, `aggregations.${f}.buckets`, []))
      const suggestions = orderBy(suggestionsPerField.flat(), ['doc_count'], ['desc'])
      // Return an object to check later if the promise result is still applicable
      return { query, suggestions }
    },
    termCandidates(ast = null) {
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
    replaceLastTermCandidate(term, ast = null) {
      // Parse the query by default
      ast = ast === null ? lucene.parse(this.query) : ast
      // Use recursive call for branches
      if (ast.right) this.replaceLastTermCandidate(term, ast.right)
      else if (ast.left) this.replaceLastTermCandidate(term, ast.left)
      else if (ast.term === this.termCandidates().pop().term) {
        ast.term = ast.quoted ? term : escapeLuceneChars(term)
      }
      return ast
    },
    injectTermInQuery(term, ast = null) {
      try {
        ast = this.replaceLastTermCandidate(term, ast)
        return lucene.toString(ast)
      } catch (_) {
        return this.query
      }
    },
    selectTerm(term) {
      if (term) {
        this.query = this.injectTermInQuery(term.key, null)
      }
    },
    searchTerms: throttle(async function () {
      try {
        if (this.suggestionsAllowed) {
          const { suggestions, query } = await this.suggestTerms(this.termCandidates())
          // Avoid setting suggestions if user lost the focus on the input
          if (this.focused) {
            // Is the query still valid
            this.suggestions = query === this.query ? suggestions : []
            this.activeSuggestions = []
          }
        } else {
          this.suggestions = []
        }
      } catch (_) {
        this.hideSuggestions()
      }
    }, 200),
    hideSuggestions() {
      this.suggestions = []
    },
    hideSuggestionsAfterDelay() {
      setTimeout(() => {
        this.$nextTick(this.hideSuggestions)
      }, 200)
    },
    onBlur() {
      this.focused = false
      this.hideSuggestionsAfterDelay()
    },
    onSubmit() {
      this.hideSuggestions()
      this.submit()
    },
    onInput() {
      this.pristine = false
      this.searchTerms()
    },
    onFocus() {
      this.focused = true
      this.searchTerms()
    },
    onClear() {
      if (this.searchStore.q) {
        this.onSubmit()
      }
    },
    async focusOnSearchInput() {
      await this.$nextTick()
      this.$refs.searchInput.focus()
    }
  }
}
</script>

<style lang="scss" scoped>
.search-bar {
  &:deep(.search-bar-input__input) {
    height: auto;
  }

  &--focused:deep(.input-group-append .dropdown-toggle) {
    border-top-color: $primary;
    border-bottom-color: $primary;
  }

  &:deep(.dropdown-toggle) {
    border: 0;
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

      &:active,
      &:focus,
      &.active {
        color: white;
      }
    }
  }
}
</style>
