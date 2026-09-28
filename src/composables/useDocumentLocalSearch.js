import { computed, ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'

/**
 * The find-in-document state machine shared by every document tab: the term and
 * its debounce, the match list, the active occurrence and the page it sits on.
 *
 * @param {Object} options
 * @param {function(string): Promise<Array<{ page: number }>>} options.findMatches - How this tab finds its matches.
 * @param {number} [options.debounce=300] - Delay before a settled term is searched.
 * @return {Object} The search state.
 */
export function useDocumentLocalSearch({ findMatches, debounce = 300 } = {}) {
  const term = ref('')
  const debouncedTerm = ref('')
  const appliedTerm = ref('')
  const matches = ref([])
  const activeIndex = ref(0)
  const isSearching = ref(false)
  const isDebouncing = ref(false)

  const occurrences = computed(() => matches.value.length)
  const activePage = computed(() => matches.value[activeIndex.value - 1]?.page)
  const isLoading = computed(() => isSearching.value || isDebouncing.value)

  let lastSearch = 0

  function clearMatches() {
    matches.value = []
    activeIndex.value = 0
    appliedTerm.value = ''
  }

  // A search still in flight describes the term, the mode or the document being
  // left, so it must not resolve into the state that replaced it. Its loader has
  // to come down here too: superseded, it no longer reaches its own `finally`.
  function clear() {
    lastSearch++
    clearMatches()
    isSearching.value = false
  }

  async function search(value) {
    const query = value.trim()
    if (!query) {
      clear()
      return
    }
    const id = ++lastSearch
    isSearching.value = true
    try {
      const found = await findMatches(query)
      // A newer term was searched while this one was in flight: its results
      // describe the term on screen, this one's do not.
      if (id !== lastSearch) {
        return
      }
      matches.value = found ?? []
      activeIndex.value = Number(!!matches.value.length)
      // The term the matches were found for, so whatever marks them describes
      // the same string they were counted against, even if the user typed on.
      appliedTerm.value = matches.value.length ? query : ''
    }
    catch {
      if (id === lastSearch) {
        clearMatches()
      }
    }
    finally {
      if (id === lastSearch) {
        isSearching.value = false
      }
    }
  }

  function settle(value) {
    debouncedTerm.value = value
    isDebouncing.value = false
    return search(value)
  }

  const settleDebounced = useDebounceFn(settle, debounce)

  watch(term, (value) => {
    // Emptying the field is not a search: the marks have to go at once, and the
    // debounce would otherwise leave them up for another window.
    if (!value.trim()) {
      settleDebounced.cancel()
      settle(value)
      return
    }
    isDebouncing.value = true
    settleDebounced(value)
  })

  // A tab whose matches come from somewhere else now (another render mode,
  // another document) needs the term it already holds searched again. The
  // debounce it may be sitting in would otherwise search that term a second
  // time and send the reader back to the first occurrence.
  function refresh() {
    settleDebounced.cancel()
    return settle(term.value)
  }

  return {
    term,
    debouncedTerm,
    appliedTerm,
    activeIndex,
    matches,
    occurrences,
    activePage,
    isLoading,
    clear,
    refresh
  }
}
