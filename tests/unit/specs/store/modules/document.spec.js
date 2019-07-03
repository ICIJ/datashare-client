import store from '@/store'
import { datashare, initialState } from '@/store/modules/document'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import { jsonOk } from 'tests/unit/tests_utils'

describe('Document store', () => {
  esConnectionHelper()
  const es = esConnectionHelper.es

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
    const id = 'document'
    await letData(es).have(new IndexedDocument(id).withContent('This is the document.')).commit()
    await store.dispatch('document/get', { id: id })

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
    const id = 'document'
    await letData(es).have(new IndexedDocument(id).withContent('This is the document.').withNer('naz')).commit()
    await store.dispatch('document/get', { id: id })
    await store.dispatch('document/getNamedEntities')

    expect(store.state.document.namedEntities[0].raw._source.mention).toEqual('naz')
    expect(store.state.document.namedEntities[0].raw._routing).toEqual(id)
  })

  it('should get only the not hidden document\'s named entities', async () => {
    const id = 'document'
    await letData(es).have(new IndexedDocument(id).withContent('This is the document.')
      .withNer('entity_01', 42, 'ORGANIZATION', false)
      .withNer('entity_02', 43, 'ORGANIZATION', true)
      .withNer('entity_03', 44, 'ORGANIZATION', false)).commit()
    await store.dispatch('document/get', { id: id })
    await store.dispatch('document/getNamedEntities')

    expect(store.state.document.namedEntities.length).toEqual(2)
    expect(store.state.document.namedEntities[0].raw._source.mention).toEqual('entity_01')
    expect(store.state.document.namedEntities[0].raw._routing).toEqual(id)
    expect(store.state.document.namedEntities[1].raw._source.mention).toEqual('entity_03')
    expect(store.state.document.namedEntities[1].raw._routing).toEqual(id)
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

  it('should untag a document', async () => {
    const id = 'document'
    await letData(es).have(new IndexedDocument(id).withTags(['tag_01', 'tag_02'])).commit()
    await store.dispatch('document/get', { id: id })

    await store.dispatch('document/untag', { documentId: id, tags: ['tag_01'] })

    expect(store.state.document.doc.tags).toEqual(['tag_02'])
  })

  it('should tag a document', async () => {
    const id = 'document'
    await letData(es).have(new IndexedDocument(id).withTags(['tag_01'])).commit()
    await store.dispatch('document/get', { id: id })

    await store.dispatch('document/tag', { documentId: id, tags: ['tag_02'] })

    expect(store.state.document.doc.tags).toEqual(['tag_01', 'tag_02'])
  })
})
