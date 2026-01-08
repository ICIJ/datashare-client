import { toValue } from 'vue'
import { useModalController } from 'bootstrap-vue-next'

import ProjectDeletionModal from '@/components/Project/ProjectDeletionModal'

export function useProjectDeletionModal(project) {
  const modalController = useModalController()

  function show() {
    return new Promise((resolve) => {
      modalController.create({
        component: ProjectDeletionModal,
        modelValue: true,
        project: toValue(project),
        onOk: resolve,
        onClose: resolve,
        onCancel: resolve
      })
    })
  }

  function hide() {
    return modalController.hide()
  }

  return { show, hide }
}
