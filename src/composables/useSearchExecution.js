import { onUnmounted } from 'vue'

import { useSearchStore } from '@/store/modules'

/**
 * Ties the search execution lifecycle to the component that drives the search.
 * Cancelling the in-flight async search when that component unmounts (the user
 * leaves the search view) lets the backend stop polling and free the stored
 * result.
 *
 * The store instance follows the parent context through `inject()`, matching
 * the other search composables. The AbortController itself stays in the store,
 * which is the single choke point for every search and aborts the previous run
 * when a new one supersedes it; this composable owns only the lifecycle binding.
 *
 * @returns {{ cancel: Function }} Handle to cancel the in-flight search on demand.
 */
export function useSearchExecution() {
  const searchStore = useSearchStore.inject()

  function cancel() {
    searchStore.cancelActiveSearch()
  }

  // Stop the in-flight search when the driving component goes away.
  onUnmounted(cancel)

  return { cancel }
}
