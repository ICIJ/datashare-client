import { h } from 'vue'
import { useModalController } from 'bootstrap-vue-next'

import DocumentModal from '@/components/Document/DocumentModal'

export function useDocumentModal() {
  const modalController = useModalController()

  function show(index, id, routing, q = null) {
    const props = { index, id, routing, q }

    return new Promise((resolve) => {
      const component = h(DocumentModal, {
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
