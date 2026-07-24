import { h } from 'vue'
import { useModal } from 'bootstrap-vue-next'

import SearchSavingModal from '@/components/Search/SearchSavingModal'

export function useSearchSavingModal() {
  const { create, hide } = useModal()

  function show(event = null) {
    return new Promise((resolve) => {
      const component = h(SearchSavingModal, {
        onOk: resolve,
        onClose: resolve,
        onCancel: resolve
      })

      create({ component, event }).show()
    })
  }

  return { show, hide }
}
