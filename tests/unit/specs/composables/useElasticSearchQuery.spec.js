import { apiInstance as api } from '@/api/apiInstance'
import { useElasticSearchQuery } from '@/composables/useElasticSearchQuery'

vi.mock('@/api/apiInstance', () => ({
  apiInstance: {
    elasticsearch: {
      search: vi.fn(() => Promise.resolve({ aggregations: { agg_terms_tags: { buckets: [{ key: 'tag1' }] } } }))
    }
  }
}))

describe('useElasticSearchQuery', () => {
  describe('fetchAllTagsByIndex', () => {
    it('should return the tags as labels', async () => {
      const { fetchAllTagsByIndex } = useElasticSearchQuery()
      expect(await fetchAllTagsByIndex('banana-papers')).toEqual([{ label: 'tag1' }])
    })

    it('should fetch up to 1000 tags instead of the Elasticsearch default of 10', async () => {
      const { fetchAllTagsByIndex } = useElasticSearchQuery()
      await fetchAllTagsByIndex('banana-papers')
      const { body } = api.elasticsearch.search.mock.calls.at(-1)[0]
      expect(body.aggs.agg_terms_tags.terms.size).toBe(1000)
    })
  })
})
