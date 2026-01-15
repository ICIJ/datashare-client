import { h } from 'vue'
import { useModal } from 'bootstrap-vue-next'

import BatchSearchErrorModal from '@/components/BatchSearch/BatchSearchErrorModal'

export function useBatchSearchErrorModal() {
  const { create, hide } = useModal()

  function show({ errorMessage, errorQuery } = {}) {
    return new Promise((resolve) => {
      const component = h(BatchSearchErrorModal, {
        onOk: resolve,
        onClose: resolve,
        onCancel: resolve
      })

      create({ component, errorMessage, errorQuery }).show()
    })
  }

  return { show, hide }
}
