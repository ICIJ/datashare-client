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

  async function fetchDocumentsCount(query = 'type:Document') {
    const size = 0
    const body = { track_total_hits: true, query: { query_string: { query } } }
    const preference = 'project-documents-count'
    const res = await core.api.elasticsearch.search({ index, body, preference, size })
    return res?.hits?.total?.value || 0
  }

  async function fetchTagsCount() {
    const size = 0
    const cardinality = { field: 'tags' }
    const aggs = { count: { cardinality } }
    const body = { size, aggs }
    const preference = 'project-tags-count'
    const res = await core.api.elasticsearch.search({ index, body, preference })
    return res?.aggregations?.count?.value || 0
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
