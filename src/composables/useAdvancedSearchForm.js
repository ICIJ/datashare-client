import { reactive, computed } from 'vue'

import IPhHash from '~icons/ph/hash'
import IPhFileText from '~icons/ph/file-text'
import IPhUserList from '~icons/ph/user-list'
import IPhUserSquare from '~icons/ph/user-square'
import IPhTextColumns from '~icons/ph/text-columns'
import IPhTreeStructure from '~icons/ph/tree-structure'
import IPhChatsTeardrop from '~icons/ph/chats-teardrop'

/**
 * Searchable fields offered in the "Search in fields" checkbox group.
 * Values are the real Elasticsearch field paths used elsewhere in the
 * codebase (see src/utils/settings.js, DocumentThread, DisplayEmail).
 */
export const ADVANCED_SEARCH_FIELDS = [
  { value: 'tags', label: 'searchAdvancedModal.fields.tags', icon: IPhHash },
  { value: 'path', label: 'searchAdvancedModal.fields.name', icon: IPhFileText },
  { value: 'metadata.tika_metadata_dc_creator', label: 'searchAdvancedModal.fields.author', icon: IPhUserList },
  { value: 'metadata.tika_metadata_message_to', label: 'searchAdvancedModal.fields.recipients', icon: IPhUserSquare },
  { value: 'content', label: 'searchAdvancedModal.fields.content', icon: IPhTextColumns },
  { value: 'dirname', label: 'searchAdvancedModal.fields.path', icon: IPhTreeStructure },
  { value: 'metadata.tika_metadata_message_raw_header_thread_index', label: 'searchAdvancedModal.fields.threadId', icon: IPhChatsTeardrop }
]

/**
 * Default form shape. Word inputs hold strings (whitespace splitting is
 * deferred to submit time), distances default to 1 — distance 0 is the
 * disabled state and the slider's `min` enforces that floor.
 */
export function getInitialForm() {
  return {
    anyWords: '',
    allWords: '',
    exactPhrase: '',
    noneWords: '',
    singleWildcardStart: '',
    singleWildcardEnd: '',
    multiWildcardStart: '',
    multiWildcardEnd: '',
    fuzzyTerm: '',
    fuzzyDistance: 1,
    proximityPhrase: '',
    proximityDistance: 1,
    fieldAll: true,
    selectedFields: []
  }
}

/**
 * Convert the form's string-typed word inputs into the array shape
 * `useAdvancedSearchQuery.generateQuery` expects. Splits on whitespace
 * for word lists and keeps the exact phrase as a single quoted entry.
 */
export function toQueryShape(f) {
  const words = s => s.trim().split(/\s+/).filter(Boolean)
  return {
    ...f,
    anyWords: words(f.anyWords),
    allWords: words(f.allWords),
    noneWords: words(f.noneWords),
    exactPhrase: f.exactPhrase.trim() ? [f.exactPhrase.trim()] : []
  }
}

/**
 * Owns the advanced-search modal's form state, the empty-form
 * derivation, the all-vs-individual-fields mutual-exclusion rules,
 * and the reset key used to remount inputs on Reset.
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
   * "All fields" and individual field checkboxes are mutually exclusive:
   * - Selecting "All" clears every individual field.
   * - Selecting any individual field deselects "All".
   * - Deselecting the last individual field re-selects "All".
   * - "All" cannot be unticked directly (the user must pick an
   *   individual field to leave the "all" state), which avoids landing
   *   in an empty state.
   */
  function setFieldAll(value) {
    if (value) {
      form.fieldAll = true
      form.selectedFields = []
    }
  }

  function setSelectedFields(values) {
    form.selectedFields = values
    form.fieldAll = values.length === 0
  }

  function reset() {
    Object.assign(form, getInitialForm())
  }

  return {
    form,
    fields: ADVANCED_SEARCH_FIELDS,
    isFormEmpty,
    setFieldAll,
    setSelectedFields,
    reset,
    toQueryShape
  }
}
