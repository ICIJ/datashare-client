import { computed, h } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useModalController } from 'bootstrap-vue-next'

import { useCore } from '@/composables/core'
import SearchSavingModal from '@/components/Search/SearchSavingModal'

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
  const store = useStore()
  const indices = computed(() => store.state.search.indices)
  const { core } = useCore()
  const { resolve } = useRouter()

  const searchRoute = computed(() => {
    const from = 0
    const routeQuery = store.getters['search/toRouteQuery']()
    const query = { ...routeQuery, from }
    return resolve({ name: 'search', query })
  })

  function save({ name }) {
    return core.api.addUserHistoryEvent(indices.value, 'SEARCH', name, searchRoute.value.fullPath)
  }

  return { save }
}

export default useSearchSaving
