import { computed, h } from 'vue'
import { useRouter } from 'vue-router'
import { useModalController } from 'bootstrap-vue-next'

import { useCore } from '@/composables/core'
import SearchSavingModal from '@/components/Search/SearchSavingModal'
import { useSearchStore } from '@/store/modules'

export function useSearchSavingModal(project) {
  const modalController = useModalController()
  const props = { project }

  function show() {
    return new Promise((resolve) => {
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

export function useSearchSaving() {
  const searchStore = useSearchStore()
  const indices = computed(() => searchStore.indices)
  const { core } = useCore()
  const { resolve } = useRouter()

  const searchRoute = computed(() => {
    const from = 0
    const routeQuery = searchStore.toRouteQuery
    const query = { ...routeQuery, from }
    return resolve({ name: 'search', query })
  })

  function save({ name }) {
    return core.api.addUserHistoryEvent(indices.value, 'SEARCH', name, searchRoute.value.fullPath)
  }

  return { save }
}

export default useSearchSaving
