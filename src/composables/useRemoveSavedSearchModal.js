import { useModal } from 'bootstrap-vue-next'

import { useConfirmModal } from '@/composables/useConfirmModal'
import { useHistoryEvents } from '@/composables/useHistoryEvents'

export function useRemoveSavedSearchModal() {
  const { hide } = useModal()
  const { remove } = useHistoryEvents('SEARCH')
  const { confirm: showConfirmModal } = useConfirmModal()

  async function show({ id }, props) {
    if (await showConfirmModal(props)) {
      return remove({ id })
    }
  }

  return { show, hide }
}
