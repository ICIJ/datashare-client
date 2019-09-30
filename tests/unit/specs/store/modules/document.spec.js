import store from '@/store'
import { datashare, initialState } from '@/store/modules/document'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import { jsonOk } from 'tests/unit/tests_utils'
import esClient from '@/api/esClient'
import DatashareClient from '@/api/DatashareClient'

describe('Document store', () => {
  esConnectionHelper()
  const es = esConnectionHelper.es
  const id = 'document'
  let spy

  beforeAll(() => store.commit('search/index', process.env.VUE_APP_ES_INDEX))

  beforeEach(() => {
    jest.spyOn(datashare, 'fetch')
    spy = jest.spyOn(esClient, 'getEsDoc')
    datashare.fetch.mockReturnValue(jsonOk())
  })

  afterEach(() => {
    store.commit('document/reset')
    datashare.fetch.mockClear()
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
    await letData(es).have(new IndexedDocument(id).withContent('This is the document.')).commit()
    await store.dispatch('document/get', { id })

    expect(store.state.document.doc.id).toEqual(id)
  })

  it('should get the parent document', async () => {
    await letData(es).have(new IndexedDocument('parent').withContent('This is parent.')).commit()
    await store.dispatch('search/query', 'parent')
    const parentNode = store.state.search.response.hits
    await letData(es).have(new IndexedDocument('child').withContent('This is child.').withParent(parentNode[0].id)).commit()
    await store.dispatch('search/query', 'child')
    const childNode = store.state.search.response.hits
    await store.dispatch('document/get', { id: childNode[0].id, routing: childNode[0].routing })
    await store.dispatch('document/getParent')

    expect(store.state.document.parentDocument.id).toEqual(parentNode[0].id)
  })

  it('should get the document\'s named entities', async () => {
    await letData(es).have(new IndexedDocument(id).withContent('This is the document.').withNer('naz')).commit()
    await store.dispatch('document/get', { id })
    await store.dispatch('document/getNamedEntities')

    expect(store.state.document.namedEntities[0].raw._source.mention).toEqual('naz')
    expect(store.state.document.namedEntities[0].raw._routing).toEqual(id)
  })

  it('should get only the not hidden document\'s named entities', async () => {
    await letData(es).have(new IndexedDocument(id).withContent('This is the document.')
      .withNer('entity_01', 42, 'ORGANIZATION', false)
      .withNer('entity_02', 43, 'ORGANIZATION', true)
      .withNer('entity_03', 44, 'ORGANIZATION', false)).commit()
    await store.dispatch('document/get', { id })

    await store.dispatch('document/getNamedEntities')

    expect(store.state.document.namedEntities.length).toEqual(2)
    expect(store.state.document.namedEntities[0].raw._source.mention).toEqual('entity_01')
    expect(store.state.document.namedEntities[0].raw._routing).toEqual(id)
    expect(store.state.document.namedEntities[1].raw._source.mention).toEqual('entity_03')
    expect(store.state.document.namedEntities[1].raw._routing).toEqual(id)
  })

  it('should get the document\'s tags', async () => {
    const tags = ['tag_01', 'tag_02']
    datashare.fetch.mockReturnValue(jsonOk(tags))
    await letData(es).have(new IndexedDocument(id).withContent('content').withTags(tags))
    store.commit('document/idAndRouting', { id })

    await store.dispatch('document/getTags')

    expect(store.state.document.tags).toEqual(tags)
    datashare.fetch.mockClear()
  })

  it('should get the "showNamedEntities" status', () => {
    expect(store.state.document.showNamedEntities).toBeTruthy()
  })

  it('should toggle the "showNamedEntities" status', () => {
    store.commit('document/toggleShowNamedEntities')
    expect(store.state.document.showNamedEntities).toBeFalsy()
    store.commit('document/toggleShowNamedEntities')
    expect(store.state.document.showNamedEntities).toBeTruthy()
  })

  it('should tag multiple documents and not refresh', async () => {
    await letData(es).have(new IndexedDocument('doc_01').withContent('This is the document.')).commit()
    await letData(es).have(new IndexedDocument('doc_02').withContent('This is the document.')).commit()
    await store.dispatch('document/get', { id: 'doc_01' })

    spy.mockClear()
    datashare.fetch.mockClear()

    await store.dispatch('document/tag', { documents: [{ id: 'doc_01' }, { id: 'doc_02' }], tag: 'tag_01 tag_02 tag_03' })

    expect(datashare.fetch).toHaveBeenCalledTimes(1)
    expect(datashare.fetch).toBeCalledWith(DatashareClient.getFullUrl(`/api/document/project/${process.env.VUE_APP_ES_INDEX}/group/tag`),
      { method: 'POST', body: JSON.stringify({ docIds: ['doc_01', 'doc_02'], tags: ['tag_01', 'tag_02', 'tag_03'] }) })
    expect(esClient.getEsDoc).not.toHaveBeenCalled()
  })

  it('should untag 1 document and refresh', async () => {
    await letData(es).have(new IndexedDocument('doc_01').withContent('This is the document.')).commit()
    await letData(es).have(new IndexedDocument('doc_02').withContent('This is the document.')).commit()
    await store.dispatch('document/get', { id: 'doc_01' })

    spy.mockClear()
    datashare.fetch.mockClear()

    await store.dispatch('document/untag', { documents: [{ id: 'doc_01' }], tag: { label: 'tag_01' } })

    expect(datashare.fetch).toHaveBeenCalledTimes(2)
    expect(datashare.fetch).toBeCalledWith(DatashareClient.getFullUrl(`/api/document/project/${process.env.VUE_APP_ES_INDEX}/group/untag`),
      { method: 'POST', body: JSON.stringify({ docIds: ['doc_01'], tags: ['tag_01'] }) })
  })
})
