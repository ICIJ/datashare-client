import { Api } from '@/api'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import { storeBuilder } from '@/store/storeBuilder'

describe('RecommendedStore', () => {
  const { index } = esConnectionHelper.build()

  let mockAxios, api, store
  beforeAll(() => {
    mockAxios = { request: jest.fn() }
    api = new Api(mockAxios)
    store = storeBuilder(api)
    store.commit('search/index', index)
  })

  beforeEach(() => {
    mockAxios.request.mockClear()
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
    mockAxios.request.mockResolvedValue({ data: ['document_01', 'document_02', 'document_03'] })
    mockAxios.request.mockClear()

    await store.dispatch('recommended/getDocumentsRecommendedBy', ['user_01', 'user_02'])

    expect(mockAxios.request).toBeCalledTimes(1)
    expect(mockAxios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl(`/api/${index}/documents/recommendations`),
      method: 'GET',
      params: {
        userids: 'user_01,user_02'
      }
    }))
    expect(store.state.recommended.documents).toEqual(['document_01', 'document_02', 'document_03'])
  })

  it('should reset the list of documents recommended if no users', async () => {
    mockAxios.request.mockClear()

    await store.dispatch('recommended/getDocumentsRecommendedBy', [])

    expect(mockAxios.request).toBeCalledTimes(0)
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
    mockAxios.request.mockResolvedValue({ data: { aggregates: [{ item: { id: 'user_01' }, count: 1 }, { item: { id: 'user_02' }, count: 1 }] } })
    mockAxios.request.mockClear()
    await store.dispatch('recommended/fetchIndicesRecommendations')

    expect(mockAxios.request).toBeCalledTimes(1)
    expect(mockAxios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl('/api/users/recommendations'),
      method: 'GET',
      params: { project: index }
    }))
    expect(store.state.recommended.byUsers)
      .toEqual([{ user: 'user_01', count: 1 }, { user: 'user_02', count: 1 }])
  })

  it('should return the total of documents recommended for this project', async () => {
    mockAxios.request.mockResolvedValue({ data: { totalCount: 42, aggregates: [] } })
    mockAxios.request.mockClear()
    await store.dispatch('recommended/fetchIndicesRecommendations')

    expect(mockAxios.request).toBeCalledTimes(1)
    expect(mockAxios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl('/api/users/recommendations'),
      method: 'GET',
      params: { project: index }
    }))
    expect(store.state.recommended.total).toBe(42)
  })
})
