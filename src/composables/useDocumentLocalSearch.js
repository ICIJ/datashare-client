import { computed, ref, watch } from 'vue'
import { refDebounced } from '@vueuse/core'

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
  const debouncedTerm = refDebounced(term, debounce)
  const matches = ref([])
  const activeIndex = ref(0)
  const isSearching = ref(false)

  const occurrences = computed(() => matches.value.length)
  const activePage = computed(() => matches.value[activeIndex.value - 1]?.page)
  const isDebouncing = computed(() => debouncedTerm.value !== term.value)
  const isLoading = computed(() => isSearching.value || isDebouncing.value)

  let lastSearch = 0

  function clearMatches() {
    matches.value = []
    activeIndex.value = 0
  }

  async function search(value) {
    const query = value.trim()
    if (!query) {
      clearMatches()
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

  // Emptying the field is not a search: the marks have to go at once, and the
  // debounced term would otherwise leave them up for another 300ms.
  watch(term, (value) => {
    if (!value.trim()) {
      lastSearch++
      clearMatches()
    }
  })

  watch(debouncedTerm, search)

  return { term, debouncedTerm, activeIndex, matches, occurrences, activePage, isLoading }
}
