import { setActivePinia, createPinia } from 'pinia'

import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import { useRecommendedStore } from '@/store/modules/recommended'

describe('RecommendedStore', () => {
  let api, recommendedStore
  const { index } = esConnectionHelper.build()

  beforeEach(() => {
    setActivePinia(createPinia())
    api = { getRecommendationsByProject: vi.fn(), getDocumentsRecommendedBy: vi.fn() }
    recommendedStore = useRecommendedStore(api)
  })

  it('should init documents to an empty array', () => {
    expect(recommendedStore).toHaveProperty('documents')
    expect(recommendedStore.documents).toEqual([])
  })

  it('should set documents to userIds', () => {
    const userIds = ['user_01', 'user_02', 'user_03']
    recommendedStore.documents.push(...userIds)
    expect(recommendedStore.documents).toEqual(userIds)
  })

  it('should set the list of documents recommended by a list of users', async () => {
    const documents = ['document_01', 'document_02', 'document_03']
    api.getDocumentsRecommendedBy.mockResolvedValue(documents)
    await recommendedStore.getDocumentsRecommendedBy([index], ['user_01', 'user_02'])

    expect(api.getDocumentsRecommendedBy).toBeCalledTimes(1)
    expect(api.getDocumentsRecommendedBy).toBeCalledWith(index, ['user_01', 'user_02'])
    expect(recommendedStore.documents).toEqual(['document_01', 'document_02', 'document_03'])
  })

  it('should reset the list of documents recommended if no users', async () => {
    await recommendedStore.getDocumentsRecommendedBy([])

    expect(api.getDocumentsRecommendedBy).toBeCalledTimes(0)
    expect(recommendedStore.documents).toEqual([])
  })

  it('should init byUsers to an empty array', () => {
    expect(recommendedStore).toHaveProperty('byUsers')
    expect(recommendedStore.byUsers).toEqual([])
  })

  it('should init total to zero', () => {
    expect(recommendedStore).toHaveProperty('total')
    expect(recommendedStore.total).toBe(0)
  })

  it('should return users who recommended documents from this project', async () => {
    api.getRecommendationsByProject.mockResolvedValue({
      aggregates: [
        { item: { id: 'user_01' }, count: 1 },
        { item: { id: 'user_02' }, count: 1 }
      ]
    })
    await recommendedStore.fetchIndicesRecommendations([index])
    expect(api.getRecommendationsByProject).toBeCalledTimes(1)
    expect(api.getRecommendationsByProject).toBeCalledWith(index)

    expect(recommendedStore.byUsers).toEqual([
      { user: 'user_01', count: 1 },
      { user: 'user_02', count: 1 }
    ])
  })

  it('should return the total of documents recommended for this project', async () => {
    api.getRecommendationsByProject.mockResolvedValue({ totalCount: 42, aggregates: [] })
    await recommendedStore.fetchIndexRecommendations(index)
    expect(api.getRecommendationsByProject).toBeCalledTimes(1)
    expect(api.getRecommendationsByProject).toBeCalledWith(index)
    expect(recommendedStore.total).toBe(42)
  })
})
