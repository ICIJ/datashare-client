import { computed, inject, h } from 'vue'
import { useRouter } from 'vue-router'
import { useModalController } from 'bootstrap-vue-next'

import { useCore } from '@/composables/core'
import { useConfirmModal } from '@/composables/confirm'
import SearchSavingModal from '@/components/Search/SearchSavingModal'
import { useSearchStore } from '@/store/modules'

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
  const { remove } = useSearchSaving()
  const { confirm: showConfirmModal } = useConfirmModal()

  async function show({ id }, props) {
    if (await showConfirmModal(props)) {
      return remove(id)
    }
  }

  function hide() {
    return modalController.hide()
  }

  return { show, hide }
}

export function useSearchSaving() {
  const searchStore = useSearchStore.instantiate(inject('searchStoreSuffix'))
  const indices = computed(() => searchStore.indices)
  const { core } = useCore()
  const { resolve } = useRouter()

  const searchRoute = computed(() => {
    const from = 0
    const routeQuery = searchStore.toRouteQuery
    const query = { ...routeQuery, from }
    return resolve({ name: 'search', query })
  })

  function save({ name, id = null }) {
    if (id) {
      core.api.renameSavedSearch(id, name)
    }
    return core.api.addUserHistoryEvent(indices.value, 'SEARCH', name, searchRoute.value.fullPath)
  }

  function remove(id) {
    return core.api.deleteUserHistoryEvent(id)
  }

  return { remove, save }
}

export default useSearchSaving
