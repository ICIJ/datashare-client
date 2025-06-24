import { h } from 'vue'
import { useModalController } from 'bootstrap-vue-next'

import BatchSearchErrorModal from '@/components/BatchSearch/BatchSearchErrorModal'

export function useBatchSearchErrorModal() {
  const modalController = useModalController()

  function show({ errorMessage, errorQuery } = {}) {
    const props = { errorMessage, errorQuery }

    return new Promise((resolve) => {
      const component = h(BatchSearchErrorModal, {
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
