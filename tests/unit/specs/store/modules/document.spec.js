import orderBy from 'lodash/orderBy'
import toLower from 'lodash/toLower'
import uniqueId from 'lodash/uniqueId'

import { auth, datashare, initialState } from '@/store/modules/document'
import Api from '@/api'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import { jsonResp } from 'tests/unit/tests_utils'
import store from '@/store'

describe('DocumentStore', () => {
  const index = toLower('DocumentStore')
  esConnectionHelper(index)
  const es = esConnectionHelper.es
  const id = 'document'

  beforeAll(() => {
    jest.spyOn(datashare, 'fetch')
    datashare.fetch.mockReturnValue(jsonResp())
    jest.spyOn(auth, 'fetch')
    auth.fetch.mockReturnValue(jsonResp({}, 401, {}))
  })

  afterEach(() => store.commit('document/reset'))

  afterAll(() => {
    datashare.fetch.mockClear()
    auth.fetch.mockClear()
  })

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

    expect(store.getters['document/namedEntities'].length).toBe(2)
    expect(store.getters['document/namedEntities'][0].raw._source.mention).toBe('entity_01')
    expect(store.getters['document/namedEntities'][0].raw._routing).toBe(id)
    expect(store.getters['document/namedEntities'][1].raw._source.mention).toBe('entity_03')
    expect(store.getters['document/namedEntities'][1].raw._routing).toBe(id)
  })

  it('should get the document\'s tags', async () => {
    const tags = ['tag_01', 'tag_02']
    datashare.fetch.mockReturnValue(jsonResp(tags))
    await letData(es).have(new IndexedDocument(id, index).withTags(tags)).commit()
    await store.dispatch('document/get', { id, index })
    await store.dispatch('document/getTags')
    expect(store.state.document.tags).toEqual(tags)
    datashare.fetch.mockClear()
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

  it('should tag multiple documents and not refresh', async () => {
    await letData(es).have(new IndexedDocument('doc_01', index)).commit()
    await letData(es).have(new IndexedDocument('doc_02', index)).commit()
    await store.dispatch('document/get', { id: 'doc_01', index })

    datashare.fetch.mockClear()

    await store.dispatch('document/tag', { documents: [{ id: 'doc_01' }, { id: 'doc_02' }], tag: 'tag_01 tag_02 tag_03' })

    expect(datashare.fetch).toBeCalledTimes(1)
    expect(datashare.fetch).toBeCalledWith(Api.getFullUrl(`/api/${index}/documents/batchUpdate/tag`),
      { method: 'POST', body: JSON.stringify({ docIds: ['doc_01', 'doc_02'], tags: ['tag_01', 'tag_02', 'tag_03'] }) })
  })

  it('should deleteTag from 1 document', async () => {
    await letData(es).have(new IndexedDocument('doc_01', index)).commit()
    await letData(es).have(new IndexedDocument('doc_02', index)).commit()
    await store.dispatch('document/get', { id: 'doc_01', index })

    datashare.fetch.mockClear()

    await store.dispatch('document/deleteTag', { documents: [{ id: 'doc_01' }], tag: { label: 'tag_01' } })

    expect(datashare.fetch).toBeCalledTimes(1)
    expect(datashare.fetch).toBeCalledWith(Api.getFullUrl(`/api/${index}/documents/batchUpdate/untag`),
      { method: 'POST', body: JSON.stringify({ docIds: ['doc_01'], tags: ['tag_01'] }) })
  })

  it('should add tags to the store', async () => {
    store.commit('document/addTag', { tag: 'tag_01      tag_01 tag_02', userId: 'user' })

    expect(store.state.document.tags).toHaveLength(2)
    expect(orderBy(store.state.document.tags, ['label'])[0].label).toBe('tag_01')
    expect(orderBy(store.state.document.tags, ['label'])[1].label).toBe('tag_02')
  })
})
