import { h } from 'vue'
import { useModalController } from 'bootstrap-vue-next'

import ProjectDeletionModal from '@/components/Project/ProjectDeletionModal'

export function useProjectDeletionModal(project) {
  const modalController = useModalController()
  const props = { project }

  function show() {
    return new Promise((resolve) => {
      const component = h(ProjectDeletionModal, {
        onOk: resolve,
        onClose: resolve,
        onCancel: resolve
      })

      modalController.show({ component, props })
    })
  }

  function hide() {
    return modalController.hide()
  }

  return { show, hide }
}
