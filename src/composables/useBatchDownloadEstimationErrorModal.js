import { h } from 'vue'
import { useModal } from 'bootstrap-vue-next'

import BatchDownloadEstimationErrorModal from '@/components/BatchDownload/BatchDownloadEstimationErrorModal'

export function useBatchDownloadEstimationErrorModal() {
  const { create, hide } = useModal()

  function show() {
    return new Promise((resolve) => {
      const component = h(BatchDownloadEstimationErrorModal, {
        onOk: resolve,
        onClose: resolve,
        onCancel: resolve,
        onHide: resolve
      })

      create({ component, modelValue: true }).show()
    })
  }

  async function confirm() {
    const { trigger } = await show()
    return trigger === 'ok'
  }

  return { show, confirm, hide }
}
