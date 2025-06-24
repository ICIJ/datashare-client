import { useModalController } from 'bootstrap-vue-next'
import { h } from 'vue'

import SearchSavingModal from '@/components/Search/SearchSavingModal'

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

      modalController.create({ component, props })
    })
  }

  function hide() {
    return modalController.hide()
  }

  return { show, hide }
}
