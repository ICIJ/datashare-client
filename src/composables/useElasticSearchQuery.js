import bodybuilder from 'bodybuilder'
import { get } from 'lodash'
import { apiInstance as api } from '@/api/apiInstance'
export function useElasticSearchQuery() {
  const fetchAllTagsByIndex = async (index) => {
    const body = bodybuilder().size(0).agg('terms', 'tags').build()
    const response = await api.elasticsearch.search({ index, body })
    const buckets = get(response, 'aggregations.agg_terms_tags.buckets', [])
    return buckets.map(({ key: label }) => ({ label }))
  }

  return { fetchAllTagsByIndex }
}
