import { toValue } from 'vue'

import { useCore } from '@/composables/useCore'
import { useMode } from '@/composables/useMode'

export function useProjectMetrics(project) {
  const core = useCore()
  const { isServer } = useMode(core)
  const { name: index } = toValue(project)

  async function fetchDocumentsCount() {
    return core.api.elasticsearch.countDocuments(index)
  }

  async function fetchTagsCount() {
    return core.api.elasticsearch.countTags(index)
  }

  async function fetchRecommendationsCount() {
    // Recommendations are a server-mode-only feature
    if (!isServer.value) return 0
    const recommendations = await core.api.getRecommendationsByProject(index)
    return recommendations?.totalCount || 0
  }

  return { fetchDocumentsCount, fetchTagsCount, fetchRecommendationsCount }
}
