import { h } from 'vue'
import { useModal } from 'bootstrap-vue-next'

import BatchDownloadConfirmModal from '@/components/BatchDownload/BatchDownloadConfirmModal'

export function useBatchDownloadConfirmModal() {
  const { create, hide } = useModal()

  function show({ estimatedCount, estimatedSize, maxNbFiles, maxSizeBytes }) {
    return new Promise((resolve) => {
      const component = h(BatchDownloadConfirmModal, {
        estimatedCount,
        estimatedSize,
        maxNbFiles,
        maxSizeBytes,
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
