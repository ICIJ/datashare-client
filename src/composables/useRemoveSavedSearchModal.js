import { useModalController } from 'bootstrap-vue-next'

import { useConfirmModal } from '@/composables/useConfirmModal'
import { useHistoryEvents } from '@/composables/useHistoryEvents'

export function useRemoveSavedSearchModal() {
  const modalController = useModalController()
  const { remove } = useHistoryEvents('SEARCH')
  const { confirm: showConfirmModal } = useConfirmModal()

  async function show({ id }, props) {
    if (await showConfirmModal(props)) {
      return remove({ id })
    }
  }

  function hide() {
    return modalController.hide()
  }

  return { show, hide }
}
