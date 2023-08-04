import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'

import { storeBuilder } from '@/store/storeBuilder'

describe('RecommendedStore', () => {
  const { index } = esConnectionHelper.build()

  let api, store
  beforeAll(() => {
    api = {
      getRecommendationsByProject: jest.fn(),
      getDocumentsRecommendedBy: jest.fn()
    }
    store = storeBuilder(api)
    store.commit('search/index', index)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should define a store module', () => {
    expect(store.state.recommended).toBeDefined()
  })

  it('should init documents to an empty array', () => {
    expect(store.state.recommended).toHaveProperty('documents')
    expect(store.state.recommended.documents).toEqual([])
  })

  it('should set documents to userIds', () => {
    const userIds = ['user_01', 'user_02', 'user_03']
    store.commit('recommended/documents', userIds)
    expect(store.state.recommended.documents).toEqual(userIds)
  })

  it('should set the list of documents recommended by a list of users', async () => {
    const documents = ['document_01', 'document_02', 'document_03']
    api.getDocumentsRecommendedBy.mockResolvedValue(documents)
    await store.dispatch('recommended/getDocumentsRecommendedBy', ['user_01', 'user_02'])

    expect(api.getDocumentsRecommendedBy).toBeCalledTimes(1)
    expect(api.getDocumentsRecommendedBy).toBeCalledWith(index, ['user_01', 'user_02'])
    expect(store.state.recommended.documents).toEqual(['document_01', 'document_02', 'document_03'])
  })

  it('should reset the list of documents recommended if no users', async () => {
    await store.dispatch('recommended/getDocumentsRecommendedBy', [])

    expect(api.getDocumentsRecommendedBy).toBeCalledTimes(0)
    expect(store.state.recommended.documents).toEqual([])
  })

  it('should init byUsers to an empty array', () => {
    expect(store.state.recommended).toHaveProperty('byUsers')
    expect(store.state.recommended.byUsers).toEqual([])
  })

  it('should init total to zero', () => {
    expect(store.state.recommended).toHaveProperty('total')
    expect(store.state.recommended.total).toBe(0)
  })

  it('should return users who recommended documents from this project', async () => {
    api.getRecommendationsByProject.mockResolvedValue({
      aggregates: [
        { item: { id: 'user_01' }, count: 1 },
        { item: { id: 'user_02' }, count: 1 }
      ]
    })
    await store.dispatch('recommended/fetchIndicesRecommendations')

    expect(api.getRecommendationsByProject).toBeCalledTimes(1)
    expect(api.getRecommendationsByProject).toBeCalledWith(index)

    expect(store.state.recommended.byUsers).toEqual([
      { user: 'user_01', count: 1 },
      { user: 'user_02', count: 1 }
    ])
  })

  it('should return the total of documents recommended for this project', async () => {
    api.getRecommendationsByProject.mockResolvedValue({ totalCount: 42, aggregates: [] })
    await store.dispatch('recommended/fetchIndicesRecommendations')

    expect(api.getRecommendationsByProject).toBeCalledTimes(1)
    expect(api.getRecommendationsByProject).toBeCalledWith(index)
    expect(store.state.recommended.total).toBe(42)
  })
})
