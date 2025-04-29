import { toValue } from 'vue'

import { useCore } from '@/composables/useCore'

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
