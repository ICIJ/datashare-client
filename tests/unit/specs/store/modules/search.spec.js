import store from '@/store'
import Response from '@/api/Response'
import Document from '@/api/Document'
import NamedEntity from '@/api/NamedEntity'
import { IndexedDocuments, IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import cloneDeep from 'lodash/cloneDeep'
import find from 'lodash/find'
import omit from 'lodash/omit'

describe('Search store', () => {
  esConnectionHelper()
  let es = esConnectionHelper.es
  // High timeout because multiple searches can be heavy for the Elasticsearch
  jest.setTimeout(1e4)

  afterEach(() => {
    store.dispatch('search/reset')
    store.commit('search/index', process.env.VUE_APP_ES_INDEX)
  })

  it('should define a store module', () => {
    expect(store.state.search).not.toEqual(undefined)
  })

  it('should reset to initial state', () => {
    const initialState = cloneDeep(store.state.search)
    store.commit('search/index', 'another-index')
    store.commit('search/query', 'datashare')
    store.commit('search/size', 12)
    store.commit('search/sort', 'randomOrder')
    store.commit('search/addFacetValue', { name: 'content-type', value: 'TXT' })
    store.commit('search/toggleFilters')
    store.dispatch('search/reset')

    expect(omit(store.state.search, ['index', 'isReady', 'facets'])).toEqual(omit(initialState, ['index', 'isReady', 'facets']))
    expect(store.state.search.index).toEqual('another-index')
    expect(store.state.search.isReady).toEqual(false)
    expect(find(store.state.search.facets, { name: 'content-type' }).values).toEqual([])
  })

  it('should change the state after `query` mutation', () => {
    store.commit('search/query', 'bar')
    expect(store.state.search.query).toEqual('bar')
  })

  it('should change query value after `query` action', () => {
    store.commit('search/query', 'bar')
    store.dispatch('search/query', 'foo')
    expect(store.state.search.query).toEqual('foo')
  })

  it('should build a Response object from raw value', () => {
    store.commit('search/buildResponse', {
      hits: {
        hits: [
          { _source: { type: 'Document' }, _id: 'foo' },
          { _source: { type: 'NamedEntity' }, _id: 'bar' }
        ]
      }
    })
    expect(store.state.search.response).toBeInstanceOf(Response)
  })

  it('should build a correct Response object from raw value', () => {
    store.commit('search/buildResponse', {
      hits: {
        hits: [
          { _source: { type: 'Document' }, _id: 'foo' },
          { _source: { type: 'NamedEntity' }, _id: 'bar' }
        ]
      }
    })
    expect(store.state.search.response.hits[0]).toBeInstanceOf(Document)
    expect(store.state.search.response.hits[1]).toBeInstanceOf(NamedEntity)
    expect(store.state.search.response.hits[2]).toEqual(undefined)
  })

  it('should return document from local index', async () => {
    await letData(es).have(new IndexedDocument('docs/bar.txt').withContent('this is bar document')).commit()
    await store.dispatch('search/query', 'bar')
    expect(store.state.search.response.hits).toHaveLength(1)
    expect(store.state.search.response.hits[0].basename).toEqual('bar.txt')
  })

  it('should return document from another index', async () => {
    await letData(es).have(new IndexedDocument('docs/bar.txt').toIndex(process.env.VUE_APP_ES_ANOTHER_INDEX).withContent('this is bar document')).commit()
    await store.dispatch('search/query', { index: process.env.VUE_APP_ES_ANOTHER_INDEX, query: 'bar', from: 0, size: 25 })
    expect(store.state.search.response.hits).toHaveLength(1)
    expect(store.state.search.response.hits[0].basename).toEqual('bar.txt')
  })

  it('should get document from ElasticSearch', async () => {
    await letData(es).have(new IndexedDocument('docs/bar.txt').withContent('this is bar document')).commit()
    await store.dispatch('search/query', 'bar')
    expect(store.state.search.response.hits).toHaveLength(1)
    expect(store.state.search.response.hits[0].basename).toEqual('bar.txt')
  })

  it('should find 2 documents filtered by one content-type', async () => {
    await letData(es).have(new IndexedDocument('bar.txt').withContentType('txt').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('foo.txt').withContentType('txt').withContent('foo')).commit()
    await letData(es).have(new IndexedDocument('bar.pdf').withContentType('pdf').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('foo.pdf').withContentType('pdf').withContent('foo')).commit()

    await store.dispatch('search/query', '*')
    expect(store.state.search.response.hits).toHaveLength(4)
    await store.dispatch('search/addFacetValue', { name: 'content-type', value: 'pdf' })
    expect(store.state.search.response.hits).toHaveLength(2)
  })

  it('should find 3 documents filtered by two content-type', async () => {
    await letData(es).have(new IndexedDocument('bar.txt').withContentType('txt').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.pdf').withContentType('pdf').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.csv').withContentType('csv').withContent('bar')).commit()

    await store.dispatch('search/query', '*')
    expect(store.state.search.response.hits).toHaveLength(3)
    await store.dispatch('search/addFacetValue', { name: 'content-type', value: 'pdf' })
    expect(store.state.search.response.hits).toHaveLength(1)
    await store.dispatch('search/addFacetValue', { name: 'content-type', value: 'csv' })
    expect(store.state.search.response.hits).toHaveLength(2)
  })

  it('should not find documents after filtering by content-type', async () => {
    await letData(es).have(new IndexedDocument('bar.txt').withContentType('txt').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.pdf').withContentType('pdf').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.csv').withContentType('csv').withContent('bar')).commit()

    await store.dispatch('search/query', '*')
    expect(store.state.search.response.hits).toHaveLength(3)
    await store.dispatch('search/addFacetValue', { name: 'content-type', value: 'ico' })
    expect(store.state.search.response.hits).toHaveLength(0)
  })

  it('should find documents after removing filter by content-type', async () => {
    await letData(es).have(new IndexedDocument('bar.txt').withContentType('txt').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.pdf').withContentType('pdf').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.csv').withContentType('csv').withContent('bar')).commit()

    await store.dispatch('search/query', '*')
    expect(store.state.search.response.hits).toHaveLength(3)
    await store.dispatch('search/addFacetValue', { name: 'content-type', value: 'ico' })
    expect(store.state.search.response.hits).toHaveLength(0)
    await store.dispatch('search/removeFacetValue', { name: 'content-type', value: 'ico' })
    expect(store.state.search.response.hits).toHaveLength(3)
  })

  it('should exclude documents with a specific content-type', async () => {
    await letData(es).have(new IndexedDocument('bar.txt').withContentType('txt').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.pdf').withContentType('pdf').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.csv').withContentType('csv').withContent('bar')).commit()

    await store.dispatch('search/query', '*')
    expect(store.state.search.response.hits).toHaveLength(3)
    await store.dispatch('search/addFacetValue', { name: 'content-type', value: 'txt' })
    expect(store.state.search.response.hits).toHaveLength(1)
    await store.dispatch('search/toggleFacet', 'content-type')
    expect(store.state.search.response.hits).toHaveLength(2)
  })

  it('should exclude documents with a specific content-type and include them again', async () => {
    await letData(es).have(new IndexedDocument('bar.txt').withContent('bar').withNer('name_01')).commit()
    await letData(es).have(new IndexedDocument('foo.txt').withContent('foo').withNer('name_01')).commit()
    await letData(es).have(new IndexedDocument('bar.pdf').withContent('bar').withNer('name_01')).commit()
    await letData(es).have(new IndexedDocument('bar.csv').withContent('bar').withNer('name_02')).commit()
    await letData(es).have(new IndexedDocument('bar.ico').withContent('bar').withNer('name_02')).commit()

    await store.dispatch('search/addFacetValue', { name: 'named-entity-person', value: 'name_02' })
    expect(store.state.search.response.hits).toHaveLength(2)
  })

  it('should filter documents if a named entity is selected', async () => {
    await letData(es).have(new IndexedDocument('bar.txt').withContentType('txt').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('foo.txt').withContentType('txt').withContent('foo')).commit()
    await letData(es).have(new IndexedDocument('bar.pdf').withContentType('pdf').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.csv').withContentType('csv').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.ico').withContentType('ico').withContent('bar')).commit()

    await store.dispatch('search/query', '*')
    await store.dispatch('search/addFacetValue', { name: 'content-type', value: 'txt' })
    await store.dispatch('search/toggleFacet', 'content-type')
    expect(store.state.search.response.hits).toHaveLength(3)
    await store.dispatch('search/toggleFacet', 'content-type')
    expect(store.state.search.response.hits).toHaveLength(2)
  })

  it('should take into account the given facet', async () => {
    expect(store.getters['search/hasFacetValues']('content-type')).toBeFalsy()
    await store.dispatch('search/addFacetValue', { name: 'content-type', value: 'txt' })
    expect(store.getters['search/hasFacetValues']('content-type')).toBeTruthy()
  })

  it('should take into account the given facet but not an arbitrary one', async () => {
    await store.dispatch('search/addFacetValue', { name: 'content-type', value: 'txt' })
    expect(store.getters['search/hasFacetValues']('content-type')).toBeTruthy()
    expect(store.getters['search/hasFacetValues']('bar')).toBeFalsy()
  })

  it('should take into account the given facet and its invert', async () => {
    await store.dispatch('search/addFacetValue', { name: 'content-type', value: 'txt' })
    expect(store.getters['search/hasFacetValues']('content-type')).toBeTruthy()
    expect(store.getters['search/isFacetReversed']('content-type')).toBeFalsy()
    await store.dispatch('search/toggleFacet', 'content-type')
    expect(store.getters['search/isFacetReversed']('content-type')).toBeTruthy()
  })

  it('should take into reverse a facet and not the others', async () => {
    await store.dispatch('search/addFacetValue', { name: 'content-type', value: 'txt' })
    await store.dispatch('search/addFacetValue', { name: 'language', value: 'fr' })
    await store.dispatch('search/toggleFacet', 'content-type')
    expect(store.getters['search/isFacetReversed']('content-type')).toBeTruthy()
    expect(store.getters['search/isFacetReversed']('language')).toBeFalsy()
  })

  it('should add facet with several values', async () => {
    await store.dispatch('search/addFacetValue', { name: 'content-type', value: ['txt', 'pdf'] })
    expect(store.getters['search/findFacet']('content-type').values).toHaveLength(2)
  })

  it('should merge facet values with several other values', async () => {
    await store.dispatch('search/addFacetValue', { name: 'content-type', value: 'txt' })
    expect(store.getters['search/findFacet']('content-type').values).toHaveLength(1)
    await store.dispatch('search/addFacetValue', { name: 'content-type', value: ['csv', 'pdf'] })
    expect(store.getters['search/findFacet']('content-type').values).toHaveLength(3)
  })

  it('should add a facet value only once (1/2)', async () => {
    await store.dispatch('search/addFacetValue', { name: 'content-type', value: 'txt' })
    expect(store.getters['search/findFacet']('content-type').values).toHaveLength(1)
    await store.dispatch('search/addFacetValue', { name: 'content-type', value: 'txt' })
    expect(store.getters['search/findFacet']('content-type').values).toHaveLength(1)
  })

  it('should add facet values only once (2/2)', async () => {
    await store.dispatch('search/addFacetValue', { name: 'content-type', value: ['txt', 'csv'] })
    expect(store.getters['search/findFacet']('content-type').values).toHaveLength(2)
    await store.dispatch('search/addFacetValue', { name: 'content-type', value: 'txt' })
    expect(store.getters['search/findFacet']('content-type').values).toHaveLength(2)
    await store.dispatch('search/addFacetValue', { name: 'content-type', value: ['csv'] })
    expect(store.getters['search/findFacet']('content-type').values).toHaveLength(2)
    await store.dispatch('search/addFacetValue', { name: 'content-type', value: ['csv', 'pdf'] })
    expect(store.getters['search/findFacet']('content-type').values).toHaveLength(3)
  })

  it('should return 2 documents', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('this is a document').count(4)).commit()

    await store.dispatch('search/query', { query: 'document', from: 0, size: 2 })
    expect(store.state.search.response.hits).toHaveLength(2)
  })

  it('should return 3 documents', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('this is a document').count(4)).commit()

    await store.dispatch('search/query', { query: 'document', from: 0, size: 3 })
    expect(store.state.search.response.hits).toHaveLength(3)
  })

  it('should return 1 document (1/3)', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('this is a document').count(4)).commit()

    await store.dispatch('search/query', { query: 'document', from: 3, size: 3 })
    expect(store.state.search.response.hits).toHaveLength(1)
  })

  it('should return 1 document (2/3)', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('this is a document').count(4)).commit()

    await store.dispatch('search/query', { query: 'document', from: 0, size: 3 })
    await store.dispatch('search/nextPage')
    expect(store.state.search.from).toEqual(3)
    expect(store.state.search.response.hits).toHaveLength(1)
  })

  it('should return 1 document (3/3)', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('this is a document').count(4)).commit()

    await store.dispatch('search/query', { query: 'document', from: 0, size: 3 })
    await store.dispatch('search/nextPage')
    await store.dispatch('search/nextPage')
    expect(store.state.search.from).toEqual(3)
    expect(store.state.search.response.hits).toHaveLength(1)
  })

  it('should return 4 documents on the first page', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('this is a document').count(4)).commit()

    await store.dispatch('search/firstPage')
    expect(store.state.search.from).toEqual(0)
    expect(store.state.search.response.hits).toHaveLength(4)
  })

  it('should return 3 documents on the first page', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('this is a document').count(4)).commit()

    await store.dispatch('search/query', { query: 'document', from: 0, size: 3 })
    await store.dispatch('search/nextPage')
    await store.dispatch('search/nextPage')
    await store.dispatch('search/firstPage')
    expect(store.state.search.from).toEqual(0)
    expect(store.state.search.response.hits).toHaveLength(3)
  })

  it('should return 2 documents on the second page', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('this is a document').count(5)).commit()

    await store.dispatch('search/query', { query: 'document', from: 0, size: 2 })
    await store.dispatch('search/nextPage')
    await store.dispatch('search/nextPage')
    await store.dispatch('search/previousPage')
    expect(store.state.search.from).toEqual(2)
    expect(store.state.search.response.hits).toHaveLength(2)
  })

  it('should return 0 documents in total', async () => {
    await store.dispatch('search/query', '*')
    expect(store.state.search.response.total).toEqual(0)
  })

  it('should return 5 documents in total', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('this is a document').count(5)).commit()

    await store.dispatch('search/query', { query: 'document', from: 0, size: 2 })
    expect(store.state.search.response.total).toEqual(5)
  })

  it('should return the last page whose contains 2 documents', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('this is a document').count(5)).commit()

    await store.dispatch('search/query', { query: 'document', from: 0, size: 3 })
    await store.dispatch('search/lastPage')
    expect(store.state.search.from).toEqual(3)
    expect(store.state.search.response.hits).toHaveLength(2)
  })

  it('should return the default query parameters', () => {
    expect(store.getters['search/toRouteQuery']).toEqual({ index: process.env.VUE_APP_ES_INDEX, q: '', size: 25, sort: 'relevance', from: 0 })
  })

  it('should return an advanced and faceted query parameters', () => {
    store.commit('search/index', 'another-index')
    store.commit('search/query', 'datashare')
    store.commit('search/size', 12)
    store.commit('search/sort', 'randomOrder')
    store.commit('search/addFacetValue', { name: 'content-type', value: 'TXT' })
    expect(store.getters['search/toRouteQuery']).toEqual({ index: 'another-index', q: 'datashare', from: 0, size: 12, sort: 'randomOrder', 'f[content-type]': ['TXT'] })
  })

  it('should reset the values of a facet', async () => {
    await store.dispatch('search/addFacetValue', { name: 'content-type', value: ['txt', 'csv'] })
    expect(store.getters['search/findFacet']('content-type').values).toHaveLength(2)

    await store.dispatch('search/resetFacetValues', 'content-type')
    expect(store.getters['search/findFacet']('content-type').values).toHaveLength(0)
  })

  it('should change the state after `toggleFilters` mutation', () => {
    const showFilters = store.state.search.showFilters
    store.commit('search/toggleFilters')
    expect(store.state.search.showFilters).toEqual(!showFilters)
  })
})
