import { indexOf, orderBy, toLower, uniqueId } from 'lodash'
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

  afterAll(() => jest.unmock('axios'))

  it('should define a store module', () => {
    expect(store.state.document).toBeDefined()
  })

  it('should reset the store state', () => {
    store.commit('document/isRecommended', true)
    store.commit('document/reset')

    expect(store.state.document.doc).toEqual(initialState().doc)
    expect(store.state.document.idAndRouting).toEqual(initialState().idAndRouting)
    expect(store.state.document.isContentLoaded).toEqual(initialState().isContentLoaded)
    expect(store.state.document.isTranslatedContentLoaded).toEqual(initialState().isTranslatedContentLoaded)
    expect(store.state.document.isLoadingNamedEntities).toEqual(initialState().isLoadingNamedEntities)
    expect(store.state.document.isRecommended).toEqual(initialState().isRecommended)
  })

  it('should get the document', async () => {
    await letData(es).have(new IndexedDocument(id, index)).commit()
    await store.dispatch('document/get', { id, index })

    expect(store.state.document.doc.id).toBe(id)
  })

  it('should get the parent document', async () => {
    const routing = uniqueId('parent-')
    const id = uniqueId('child-')
    await letData(es).have(new IndexedDocument(routing, index)).commit()
    await letData(es).have(new IndexedDocument(id, index).withParent(routing)).commit()
    await store.dispatch('document/get', { id, routing, index })
    await store.dispatch('document/getParent')

    expect(store.state.document.parentDocument.id).toBe(routing)
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

    it('should tag multiple documents and not refresh and no document is selected in the store', async () => {
      await letData(es).have(new IndexedDocument('doc_01', index)).commit()
      await letData(es).have(new IndexedDocument('doc_02', index)).commit()

      axios.request.mockClear()

      // Retrieve documents
      await store.dispatch('document/get', { id: 'doc_01', index })
      const document01 = store.state.document.doc
      await store.dispatch('document/get', { id: 'doc_02', index })
      const document02 = store.state.document.doc

      store.commit('document/reset')

      await store.dispatch('document/tag', { documents: [document01, document02], tag: 'tag_01 tag_02 tag_03' })

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
    it('should tag a single doc with a userId user', async () => {
      await store.dispatch('document/tag', { documents: [{ id: 'doc_01' }], tag: 'tag_01', userId: 'user' })

      expect(store.state.document.tags).toHaveLength(1)
      expect(orderBy(store.state.document.tags, ['label'])[0].label).toBe('tag_01')
      expect(orderBy(store.state.document.tags, ['label'])[0].user.id).toBe('user')
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
      expect(orderBy(store.state.document.tags, ['label'])[0].user.id).toBe('user')
      expect(orderBy(store.state.document.tags, ['label'])[1].label).toBe('tag_02')
      expect(orderBy(store.state.document.tags, ['label'])[1].user.id).toBe('user')
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

      await store.dispatch('document/toggleAsRecommended', userId)

      expect(axios.request).toBeCalledTimes(1)
      expect(axios.request).toBeCalledWith(expect.objectContaining({
        url: Api.getFullUrl(`/api/${index}/documents/batchUpdate/recommend`),
        method: 'POST',
        data: ['doc_01']
      }))
      expect(store.state.document.isRecommended).toBeTruthy()
      expect(store.state.document.recommendedBy).toEqual([userId])
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
      const users = { aggregates: [{ item: { id: 'user_01' }, doc_count: 1 }, { item: { id: 'user_02' }, doc_count: 1 }] }
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
      const users = { aggregates: [{ item: { id: 'user_01' }, doc_count: 1 }, { item: { id: 'user_03' }, doc_count: 1 }, { item: { id: 'user_02' }, doc_count: 1 }] }
      axios.request.mockReturnValue({ data: users })
      await letData(es).have(new IndexedDocument('doc_01', index)).commit()
      await store.dispatch('document/get', { id: 'doc_01', index })
      await store.dispatch('document/getRecommendationsByDocuments')

      expect(store.state.document.recommendedBy).toEqual(['user_01', 'user_02', 'user_03'])
    })
  })
})
