import { h } from 'vue'
import { useModal } from 'bootstrap-vue-next'

import BatchSearchErrorModal from '@/components/BatchSearch/BatchSearchErrorModal'

export function useBatchSearchErrorModal() {
  const { create, hide } = useModal()

  function show({ errorMessage, errorQuery } = {}) {
    return new Promise((resolve) => {
      const component = h(BatchSearchErrorModal, {
        errorMessage,
        errorQuery,
        onOk: resolve,
        onClose: resolve,
        onCancel: resolve
      })

      create({ component, modelValue: true }).show()
    })
  }

  return { show, hide }
}
