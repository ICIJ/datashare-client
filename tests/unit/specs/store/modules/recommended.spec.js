import axios from 'axios'

import Api from '@/api'
import store from '@/store'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'

jest.mock('axios')

describe('RecommendedStore', () => {
  const { index } = esConnectionHelper.build()

  afterAll(() => jest.unmock('axios'))
  beforeAll(() => store.commit('search/index', index))

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
    axios.request.mockResolvedValue({ data: ['document_01', 'document_02', 'document_03'] })
    axios.request.mockClear()

    await store.dispatch('recommended/getDocumentsRecommendedBy', ['user_01', 'user_02'])

    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl(`/api/${index}/documents/recommendations`),
      method: 'GET',
      params: {
        userids: 'user_01,user_02'
      }
    }))
    expect(store.state.recommended.documents).toEqual(['document_01', 'document_02', 'document_03'])
  })

  it('should reset the list of documents recommended if no users', async () => {
    axios.request.mockClear()

    await store.dispatch('recommended/getDocumentsRecommendedBy', [])

    expect(axios.request).toBeCalledTimes(0)
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
    axios.request.mockResolvedValue({ data: { aggregates: [{ item: { id: 'user_01' }, count: 1 }, { item: { id: 'user_02' }, count: 1 }] } })
    axios.request.mockClear()
    await store.dispatch('recommended/fetchIndicesRecommendations')

    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl('/api/users/recommendations'),
      method: 'GET',
      params: { project: index }
    }))
    expect(store.state.recommended.byUsers)
      .toEqual([{ user: 'user_01', count: 1 }, { user: 'user_02', count: 1 }])
  })

  it('should return the total of documents recommended for this project', async () => {
    axios.request.mockResolvedValue({ data: { totalCount: 42, aggregates: [] } })
    axios.request.mockClear()
    await store.dispatch('recommended/fetchIndicesRecommendations')

    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl('/api/users/recommendations'),
      method: 'GET',
      params: { project: index }
    }))
    expect(store.state.recommended.total).toBe(42)
  })
})
