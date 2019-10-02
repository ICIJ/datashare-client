import store from '@/store'
import { datashare, initialState } from '@/store/modules/document'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import { jsonOk } from 'tests/unit/tests_utils'
import DatashareClient from '@/api/DatashareClient'
import orderBy from 'lodash/orderBy'

describe('Document store', () => {
  esConnectionHelper()
  const es = esConnectionHelper.es
  const id = 'document'

  beforeAll(() => store.commit('search/index', process.env.VUE_APP_ES_INDEX))

  beforeEach(() => {
    jest.spyOn(datashare, 'fetch')
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
    await letData(es).have(new IndexedDocument(id)).commit()
    await store.dispatch('document/get', { id })

    expect(store.state.document.doc.id).toEqual(id)
  })

  it('should get the parent document', async () => {
    await letData(es).have(new IndexedDocument('parent').withContent('parent')).commit()
    await store.dispatch('search/query', 'parent')
    const parentNode = store.state.search.response.hits
    await letData(es).have(new IndexedDocument('child').withContent('child').withParent(parentNode[0].id)).commit()
    await store.dispatch('search/query', 'child')
    const childNode = store.state.search.response.hits
    await store.dispatch('document/get', { id: childNode[0].id, routing: childNode[0].routing })
    await store.dispatch('document/getParent')

    expect(store.state.document.parentDocument.id).toEqual(parentNode[0].id)
  })

  it('should get the document\'s named entities', async () => {
    await letData(es).have(new IndexedDocument(id).withNer('naz')).commit()
    await store.dispatch('document/get', { id })
    await store.dispatch('document/getNamedEntities')

    expect(store.state.document.namedEntities[0].raw._source.mention).toEqual('naz')
    expect(store.state.document.namedEntities[0].raw._routing).toEqual(id)
  })

  it('should get only the not hidden document\'s named entities', async () => {
    await letData(es).have(new IndexedDocument(id)
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
    await letData(es).have(new IndexedDocument(id).withTags(tags))
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
    await letData(es).have(new IndexedDocument('doc_01')).commit()
    await letData(es).have(new IndexedDocument('doc_02')).commit()
    await store.dispatch('document/get', { id: 'doc_01' })

    datashare.fetch.mockClear()

    await store.dispatch('document/tag', { documents: [{ id: 'doc_01' }, { id: 'doc_02' }], tag: 'tag_01 tag_02 tag_03' })

    expect(datashare.fetch).toHaveBeenCalledTimes(1)
    expect(datashare.fetch).toBeCalledWith(DatashareClient.getFullUrl(`/api/document/project/${process.env.VUE_APP_ES_INDEX}/group/tag`),
      { method: 'POST', body: JSON.stringify({ docIds: ['doc_01', 'doc_02'], tags: ['tag_01', 'tag_02', 'tag_03'] }) })
  })

  it('should deleteTag from 1 document', async () => {
    await letData(es).have(new IndexedDocument('doc_01')).commit()
    await letData(es).have(new IndexedDocument('doc_02')).commit()
    await store.dispatch('document/get', { id: 'doc_01' })

    datashare.fetch.mockClear()

    await store.dispatch('document/deleteTag', { documents: [{ id: 'doc_01' }], tag: { label: 'tag_01' } })

    expect(datashare.fetch).toHaveBeenCalledTimes(1)
    expect(datashare.fetch).toBeCalledWith(DatashareClient.getFullUrl(`/api/document/project/${process.env.VUE_APP_ES_INDEX}/group/untag`),
      { method: 'POST', body: JSON.stringify({ docIds: ['doc_01'], tags: ['tag_01'] }) })
  })

  it('should add tags to the store', () => {
    store.commit('document/addTag', 'tag_01      tag_01 tag_02')

    expect(store.state.document.tags).toHaveLength(2)
    expect(orderBy(store.state.document.tags, ['label'])[0].label).toEqual('tag_01')
    expect(orderBy(store.state.document.tags, ['label'])[1].label).toEqual('tag_02')
  })
})
