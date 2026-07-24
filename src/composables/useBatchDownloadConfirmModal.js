import { h } from 'vue'
import { useModal } from 'bootstrap-vue-next'

import BatchDownloadConfirmModal from '@/components/BatchDownload/BatchDownloadConfirmModal'

export function useBatchDownloadConfirmModal() {
  const { create, hide } = useModal()

  function show({ maxNbFiles, maxSizeBytes, estimatedCount = null, estimatedSize = null } = {}) {
    return new Promise((resolve) => {
      const component = h(BatchDownloadConfirmModal, {
        maxNbFiles,
        maxSizeBytes,
        estimatedCount,
        estimatedSize,
        onOk: resolve,
        onClose: resolve,
        onCancel: resolve,
        onHide: resolve
      })

      create({ component, modelValue: true }).show()
    })
  }

  async function confirm(props) {
    const { trigger } = await show(props)
    return trigger === 'ok'
  }

  return { show, confirm, hide }
}
