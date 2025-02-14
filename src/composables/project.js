import { computed, h, toValue } from 'vue'
import { useModalController } from 'bootstrap-vue-next'

import { useCore } from '@/composables/core'
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

export function useProjectMetrics(project) {
  const { core } = useCore()
  const { name: index } = toValue(project)

  async function fetchDocumentsCount() {
    return core.api.elasticsearch.countDocuments(index)
  }

  async function fetchTagsCount() {
    return core.api.elasticsearch.countTags(index)
  }

  async function fetchRecommendationsCount() {
    const recommendations = await core.api.getRecommendationsByProject(index)
    return recommendations?.totalCount || 0
  }

  return { fetchDocumentsCount, fetchTagsCount, fetchRecommendationsCount }
}

export function useProjectPinned(project) {
  const { core } = useCore()
  const { name } = toValue(project)

  const pinned = computed({
    get() {
      return core.store.getters['app/isProjectPinned'](name)
    },
    set(pinned) {
      if (pinned) {
        return core.store.commit('app/pinProject', name)
      }

      return core.store.commit('app/unpinProject', name)
    }
  })

  return { pinned }
}
