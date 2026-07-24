import { h, toValue } from 'vue'
import { useModal } from 'bootstrap-vue-next'

import ProjectDeletionModal from '@/components/Project/ProjectDeletionModal'

export function useProjectDeletionModal(project) {
  const { create, hide } = useModal()

  function show() {
    return new Promise((resolve) => {
      const component = h(ProjectDeletionModal, {
        onOk: resolve,
        onClose: resolve,
        onCancel: resolve
      })

      create({ component, modelValue: true, project: toValue(project) }).show()
    })
  }

  return { show, hide }
}
