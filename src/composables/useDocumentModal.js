import { h } from 'vue'
import { useModal } from 'bootstrap-vue-next'

import DocumentModal from '@/components/Document/DocumentModal'

export function useDocumentModal() {
  const { create, hide } = useModal()

  function show(index, id, routing, q = null) {
    const props = { index, id, routing, q }

    return new Promise((resolve) => {
      const component = h(DocumentModal, {
        onOk: resolve,
        onClose: resolve,
        onCancel: resolve
      })

      return create({ component, ...props }).show()
    })
  }

  return { show, hide }
}
