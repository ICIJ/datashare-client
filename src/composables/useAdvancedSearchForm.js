import { reactive, computed } from 'vue'

import { getInitialForm, toQueryShape } from '@/utils/luceneQuery'
import settings from '@/utils/settings'

/**
 * Field options offered in the "Search in fields" radio group. Mirrors the
 * search bar's field dropdown (settings.searchFields) so the selected value
 * is a valid search store `field` key, and reuses the same `search.field.*`
 * translations.
 */
export const ADVANCED_SEARCH_FIELDS = settings.searchFields.map(({ key }) => ({
  value: key,
  label: `search.field.${key}`
}))

// Re-exported so form-shape consumers keep a single import point even
// though the helpers live with the query generator/parser they mirror.
export { getInitialForm, toQueryShape }

/**
 * Owns the advanced-search modal's form state, the all-vs-individual-fields
 * mutual-exclusion rules, and the reset key used to remount inputs on
 * Reset. The form shape itself is defined in `@/utils/luceneQuery`, next to
 * the generate/parse pair that produces and consumes it.
 */
export function useAdvancedSearchForm() {
  const form = reactive(getInitialForm())

  /**
   * The form is considered empty when no input would contribute to a
   * Lucene query. The Search button stays disabled in that state to
   * prevent a no-op search.
   */
  const isFormEmpty = computed(() => {
    return [
      form.anyWords,
      form.allWords,
      form.exactPhrase,
      form.noneWords,
      form.singleWildcardStart,
      form.singleWildcardEnd,
      form.multiWildcardStart,
      form.multiWildcardEnd,
      form.fuzzyTerm,
      form.proximityPhrase
    ].every(v => v.trim() === '')
  })

  /**
   * Select the single search field. The value is one of the
   * `ADVANCED_SEARCH_FIELDS` keys ('all' for an unscoped search) and is
   * applied to the search store's `field` at submit time.
   */
  function setField(value) {
    form.field = value
  }

  function reset() {
    Object.assign(form, getInitialForm())
  }

  return {
    form,
    fields: ADVANCED_SEARCH_FIELDS,
    isFormEmpty,
    setField,
    reset,
    toQueryShape
  }
}
