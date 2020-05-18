import indexOf from 'lodash/indexOf'
import orderBy from 'lodash/orderBy'
import toLower from 'lodash/toLower'
import uniqueId from 'lodash/uniqueId'
import axios from 'axios'

import Api from '@/api'
import store from '@/store'
import { initialState } from '@/store/modules/document'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'

jest.mock('axios', () => {
  return {
    request: jest.fn().mockResolvedValue({ data: { uid: 'Jean-Michel' } })
  }
})

describe('DocumentStore', () => {
  const index = toLower('DocumentStore')
  esConnectionHelper(index)
  const es = esConnectionHelper.es
  const id = 'document'

  afterEach(() => store.commit('document/reset'))

  afterAll(() => axios.request.mockClear())

  it('should define a store module', () => {
    expect(store.state.document).not.toBeUndefined()
  })

  it('should reset the store state', () => {
    store.commit('document/toggleShowNamedEntities')
    store.commit('document/reset')

    expect(store.state.document).toEqual(initialState())
  })

  it('should get the document', async () => {
    await letData(es).have(new IndexedDocument(id, index)).commit()
    await store.dispatch('document/get', { id, index })

    expect(store.state.document.doc.id).toBe(id)
  })

  it('should get the parent document', async () => {
    const parentId = uniqueId('parent-')
    const childId = uniqueId('child-')
    await letData(es).have(new IndexedDocument(parentId, index)).commit()
    await letData(es).have(new IndexedDocument(childId, index).withParent(parentId)).commit()
    await store.dispatch('document/get', { id: childId, routing: parentId, index })
    await store.dispatch('document/getParent')

    expect(store.state.document.parentDocument.id).toBe(parentId)
  })

  it('should get the document\'s named entities', async () => {
    await letData(es).have(new IndexedDocument(id, index).withNer('naz')).commit()
    await store.dispatch('document/get', { id, index })
    await store.dispatch('document/getFirstPageForNamedEntityInAllCategories')

    expect(store.getters['document/namedEntities'][0].raw._source.mention).toBe('naz')
    expect(store.getters['document/namedEntities'][0].raw._routing).toBe(id)
  })

  it('should get only the not hidden document\'s named entities', async () => {
    await letData(es).have(new IndexedDocument(id, index)
      .withNer('entity_01', 42, 'ORGANIZATION', false)
      .withNer('entity_02', 43, 'ORGANIZATION', true)
      .withNer('entity_03', 44, 'ORGANIZATION', false)).commit()
    await store.dispatch('document/get', { id, index })

    await store.dispatch('document/getFirstPageForNamedEntityInAllCategories')

    expect(store.getters['document/namedEntities']).toHaveLength(2)
    expect(store.getters['document/namedEntities'][0].raw._source.mention).toBe('entity_01')
    expect(store.getters['document/namedEntities'][0].raw._routing).toBe(id)
    expect(store.getters['document/namedEntities'][1].raw._source.mention).toBe('entity_03')
    expect(store.getters['document/namedEntities'][1].raw._routing).toBe(id)
  })

  it('should get the "showNamedEntities" status falsy by default', () => {
    expect(store.state.document.showNamedEntities).toBeFalsy()
  })

  it('should toggle the "showNamedEntities" status', () => {
    store.commit('document/toggleShowNamedEntities')
    expect(store.state.document.showNamedEntities).toBeTruthy()
    store.commit('document/toggleShowNamedEntities')
    expect(store.state.document.showNamedEntities).toBeFalsy()
  })

  describe('Manage tags', () => {
    it('should get the document\'s tags', async () => {
      const tags = ['tag_01', 'tag_02']
      axios.request.mockReturnValue({ data: tags })
      await letData(es).have(new IndexedDocument(id, index).withTags(tags)).commit()
      await store.dispatch('document/get', { id, index })
      await store.dispatch('document/getTags')
      expect(store.state.document.tags).toEqual(tags)
      axios.request.mockClear()
      axios.request.mockResolvedValue({ data: { uid: 'Jean-Michel' } })
    })

    it('should tag multiple documents and not refresh', async () => {
      await letData(es).have(new IndexedDocument('doc_01', index)).commit()
      await letData(es).have(new IndexedDocument('doc_02', index)).commit()
      await store.dispatch('document/get', { id: 'doc_01', index })

      axios.request.mockClear()

      await store.dispatch('document/tag', { documents: [{ id: 'doc_01' }, { id: 'doc_02' }], tag: 'tag_01 tag_02 tag_03' })

      expect(axios.request).toBeCalledTimes(1)
      expect(axios.request).toBeCalledWith(expect.objectContaining({
        url: Api.getFullUrl(`/api/${index}/documents/batchUpdate/tag`),
        method: 'POST',
        data: {
          docIds: ['doc_01', 'doc_02'],
          tags: ['tag_01', 'tag_02', 'tag_03']
        }
      }))
    })

    it('should deleteTag from 1 document', async () => {
      await letData(es).have(new IndexedDocument('doc_01', index)).commit()
      await letData(es).have(new IndexedDocument('doc_02', index)).commit()
      await store.dispatch('document/get', { id: 'doc_01', index })

      axios.request.mockClear()

      await store.dispatch('document/deleteTag', { documents: [{ id: 'doc_01' }], tag: { label: 'tag_01' } })

      expect(axios.request).toBeCalledTimes(1)
      expect(axios.request).toBeCalledWith(expect.objectContaining({
        url: Api.getFullUrl(`/api/${index}/documents/batchUpdate/untag`),
        method: 'POST',
        data: {
          docIds: ['doc_01'],
          tags: ['tag_01']
        }
      }))
    })

    it('should add tags to the store', () => {
      store.commit('document/addTag', { tag: 'tag_01      tag_01 tag_02', userId: 'user' })

      expect(store.state.document.tags).toHaveLength(2)
      expect(orderBy(store.state.document.tags, ['label'])[0].label).toBe('tag_01')
      expect(orderBy(store.state.document.tags, ['label'])[1].label).toBe('tag_02')
    })
  })

  describe('Manage isRecommended status', () => {
    it('should change isRecommended status to true', () => {
      store.state.document.isRecommended = false
      store.commit('document/isRecommended', true)
      expect(store.state.document.isRecommended).toBeTruthy()
    })

    it('should change isRecommended status to false', () => {
      store.state.document.isRecommended = true
      store.commit('document/isRecommended', false)
      expect(store.state.document.isRecommended).toBeFalsy()
    })

    it('should add user in recommendedBy array', () => {
      const userId = 'Jean-Michel'
      store.commit('document/markAsRecommended', userId)
      expect(indexOf(store.state.document.recommendedBy, userId)).toBeGreaterThan(-1)
    })

    it('should remove user from recommendedBy array', () => {
      const userId = 'Jean-Michel'
      store.commit('document/markAsRecommended', userId)
      store.commit('document/unmarkAsRecommended', userId)
      expect(indexOf(store.state.document.recommendedBy, userId)).toBe(-1)
    })

    it('should MARK these documents as recommended', async () => {
      const userId = 'Jean-Michel'
      await letData(es).have(new IndexedDocument('doc_01', index)).commit()
      await letData(es).have(new IndexedDocument('doc_02', index)).commit()
      await store.dispatch('document/get', { id: 'doc_01', index })
      store.state.document.isRecommended = false

      axios.request.mockClear()

      await store.dispatch('document/toggleAsRecommended')

      expect(axios.request).toBeCalledTimes(2)
      expect(axios.request).toBeCalledWith({ url: Api.getFullUrl('/api/users/me') })
      expect(axios.request).toBeCalledWith(expect.objectContaining({
        url: Api.getFullUrl(`/api/${index}/documents/batchUpdate/recommend`),
        method: 'POST',
        data: ['doc_01']
      }))
      expect(store.state.document.isRecommended).toBeTruthy()
      expect(indexOf(store.state.document.recommendedBy, userId)).toBeGreaterThan(-1)
    })

    it('should UNMARK these documents as recommended', async () => {
      const userId = 'Jean-Michel'
      await letData(es).have(new IndexedDocument('doc_01', index)).commit()
      await letData(es).have(new IndexedDocument('doc_02', index)).commit()
      await store.dispatch('document/get', { id: 'doc_01', index })
      store.state.document.isRecommended = true

      axios.request.mockClear()

      await store.dispatch('document/toggleAsRecommended')

      expect(axios.request).toBeCalledTimes(1)
      expect(axios.request).toBeCalledWith(expect.objectContaining({
        url: Api.getFullUrl(`/api/${index}/documents/batchUpdate/unrecommend`),
        method: 'POST',
        data: ['doc_01']
      }))
      expect(store.state.document.isRecommended).toBeFalsy()
      expect(indexOf(store.state.document.recommendedBy, userId)).toBe(-1)
    })

    it('should retrieve the list of users who recommended it and set it to the store', async () => {
      const users = [{ id: 'user_01' }, { id: 'user_02' }]
      axios.request.mockReturnValue({ data: users })
      await letData(es).have(new IndexedDocument('doc_01', index)).commit()
      await store.dispatch('document/get', { id: 'doc_01', index })
      await store.dispatch('document/getRecommendationsByDocuments')

      expect(axios.request).toBeCalledTimes(2)
      expect(axios.request).toBeCalledWith(expect.objectContaining({
        url: Api.getFullUrl(`/api/users/recommendationsby?project=${index}&docIds=doc_01`)
      }))
      expect(store.state.document.recommendedBy).toEqual(['user_01', 'user_02'])
    })

    it('should sort users by alphabetical order of id', async () => {
      const users = [{ id: 'user_02' }, { id: 'user_03' }, { id: 'user_01' }]
      axios.request.mockReturnValue({ data: users })
      await letData(es).have(new IndexedDocument('doc_01', index)).commit()
      await store.dispatch('document/get', { id: 'doc_01', index })
      await store.dispatch('document/getRecommendationsByDocuments')

      expect(store.state.document.recommendedBy).toEqual(['user_01', 'user_02', 'user_03'])
    })
  })
})
