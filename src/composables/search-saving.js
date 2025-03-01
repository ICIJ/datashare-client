import { computed, inject, h } from 'vue'
import { useRouter } from 'vue-router'
import { useModalController } from 'bootstrap-vue-next'

import { useConfirmModal } from '@/composables/confirm'
import SearchSavingModal from '@/components/Search/SearchSavingModal'
import { useSearchStore } from '@/store/modules'
import { useHistoryEvents } from '@/composables/history-events'

export function useSearchSavingModal() {
  const modalController = useModalController()

  function show(event = null) {
    return new Promise((resolve) => {
      const props = { event }
      const component = h(SearchSavingModal, {
        onOk: resolve,
        onClose: resolve,
        onCancel: resolve
      })

      modalController.show({ component, props })
    })
  }

  function hide() {
    return modalController.hide()
  }

  return { show, hide }
}

export function useRemoveSavedSearchModal() {
  const modalController = useModalController()
  const { remove } = useHistoryEvents('SEARCH')
  const { confirm: showConfirmModal } = useConfirmModal()

  async function show({ id }, props) {
    if (await showConfirmModal(props)) {
      return remove({ id })
    }
  }

  function hide() {
    return modalController.hide()
  }

  return { show, hide }
}

export function useSearchSaving() {
  const searchStore = useSearchStore.instantiate(inject('searchStoreSuffix', null))
  const { save: saveSearchEvent, removeAll: removeAllSearchEvents } = useHistoryEvents('SEARCH')
  const { resolve } = useRouter()

  const searchRoute = computed(() => {
    const from = 0
    const routeQuery = searchStore.toRouteQuery
    const query = { ...routeQuery, from }
    return resolve({ name: 'search', query })
  })

  function save({ name, id = null }) {
    const projectIds = searchStore.indices
    const uri = searchRoute.value.fullPath
    const type = 'SEARCH'
    return saveSearchEvent({ id, projectIds, type, name, uri })
  }

  function removeAll() {
    return removeAllSearchEvents()
  }

  return { save, removeAll }
}

export default useSearchSaving
