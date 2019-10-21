import Response from '@/api/Response'
import { datashare } from '@/store/modules/search'
import Document from '@/api/Document'
import NamedEntity from '@/api/NamedEntity'
import { IndexedDocuments, IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import { jsonOk } from 'tests/unit/tests_utils'
import cloneDeep from 'lodash/cloneDeep'
import find from 'lodash/find'
import omit from 'lodash/omit'
import store from '@/store'

describe('Search store', () => {
  esConnectionHelper()
  const es = esConnectionHelper.es
  const index = process.env.VUE_APP_ES_INDEX
  // High timeout because multiple searches can be heavy for the Elasticsearch
  jest.setTimeout(1e4)

  beforeAll(() => store.commit('search/index', index))

  beforeEach(() => {
    jest.spyOn(datashare, 'fetch')
    datashare.fetch.mockReturnValue(jsonOk())
  })

  afterEach(() => {
    store.dispatch('search/reset')
    store.commit('search/index', process.env.VUE_APP_ES_INDEX)
    datashare.fetch.mockClear()
  })

  it('should define a store module', () => {
    expect(store.state.search).not.toBeUndefined()
  })

  it('should reset to initial state', () => {
    const initialState = cloneDeep(store.state.search)
    store.commit('search/index', 'another-index')
    store.commit('search/query', 'datashare')
    store.commit('search/size', 12)
    store.commit('search/sort', 'randomOrder')
    store.commit('search/addFacetValue', { name: 'content-type', value: 'TXT' })
    store.commit('search/toggleFilters')
    store.commit('search/isDownloadAllowed', true)

    store.dispatch('search/reset')

    expect(omit(store.state.search, ['index', 'isReady', 'facets', 'showFilters', 'response'])).toEqual(omit(initialState, ['index', 'isReady', 'facets', 'showFilters', 'response']))
    expect(store.state.search.index).toEqual('another-index')
    expect(store.state.search.isReady).toEqual(false)
    expect(find(store.state.search.facets, { name: 'content-type' }).values).toEqual([])
  })

  it('should not reset the starredDocuments from the facet', () => {
    store.commit('search/starredDocuments', ['doc_01', 'doc_02'])

    store.dispatch('search/reset', ['starredDocuments'])

    expect(find(store.state.search.facets, { name: 'starred' }).starredDocuments).toEqual(['doc_01', 'doc_02'])
  })

  it('should not reset the starredDocuments', () => {
    store.commit('search/starredDocuments', ['doc_01', 'doc_02'])

    store.dispatch('search/reset', ['starredDocuments'])

    expect(store.state.search.starredDocuments).toEqual(['doc_01', 'doc_02'])
  })

  it('should change the state after `query` mutation', async () => {
    await store.dispatch('search/query', 'bar')
    expect(store.state.search.query).toEqual('bar')
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

    await store.dispatch('search/addFacetValue', { name: 'namedEntityPerson', value: 'name_02' })
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

  it('should return 0 documents in total', async () => {
    await store.dispatch('search/query', '*')
    expect(store.state.search.response.total).toEqual(0)
  })

  it('should return 5 documents in total', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('this is a document').count(5)).commit()

    await store.dispatch('search/query', { query: 'document', from: 0, size: 2 })
    expect(store.state.search.response.total).toEqual(5)
  })

  it('should return the default query parameters', () => {
    expect(store.getters['search/toRouteQuery']).toMatchObject({ index: process.env.VUE_APP_ES_INDEX, q: '', size: 25, sort: 'relevance', from: 0 })
  })

  it('should return an advanced and faceted query parameters', () => {
    store.commit('search/index', 'another-index')
    store.commit('search/query', 'datashare')
    store.commit('search/size', 12)
    store.commit('search/sort', 'randomOrder')
    store.commit('search/addFacetValue', { name: 'content-type', value: 'TXT' })
    expect(store.getters['search/toRouteQuery']).toMatchObject({ index: 'another-index', q: 'datashare', from: 0, size: 12, sort: 'randomOrder', 'f[content-type]': ['TXT'] })
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

  describe('updateFromRouteQuery should restore search state from url', () => {
    it('should set the index of the store according to the url', async () => {
      await store.dispatch('search/updateFromRouteQuery', { index: process.env.VUE_APP_ES_ANOTHER_INDEX })
      expect(store.state.search.index).toEqual(process.env.VUE_APP_ES_ANOTHER_INDEX)
    })

    it('should set the query of the store according to the url', async () => {
      await store.dispatch('search/updateFromRouteQuery', { q: 'new_query' })
      expect(store.state.search.query).toEqual('new_query')
    })

    it('should set the from of the store according to the url', async () => {
      await store.dispatch('search/updateFromRouteQuery', { from: 42 })
      expect(store.state.search.from).toEqual(42)
    })

    it('should set the size of the store according to the url', async () => {
      await store.dispatch('search/updateFromRouteQuery', { size: 24 })
      expect(store.state.search.size).toEqual(24)
    })

    it('should set the sort of the store according to the url', async () => {
      await store.dispatch('search/updateFromRouteQuery', { sort: 'new_sort' })
      expect(store.state.search.sort).toEqual('new_sort')
    })

    it('should set the facet of the store according to the url', async () => {
      await store.dispatch('search/updateFromRouteQuery', { 'f[content-type]': ['new_type'] })
      expect(store.getters['search/findFacet']('content-type').values[0]).toEqual('new_type')
    })

    it('should not change the starredDocuments on updateFromRouteQuery', async () => {
      store.commit('search/starredDocuments', ['doc_01', 'doc_02'])

      await store.dispatch('search/updateFromRouteQuery', {})

      expect(store.state.search.starredDocuments).toEqual(['doc_01', 'doc_02'])
    })

    it('should not change the field on updateFromRouteQuery', async () => {
      store.commit('search/field', 'author')

      await store.dispatch('search/updateFromRouteQuery', {})

      expect(store.state.search.field).toEqual('author')
    })
  })

  it('should not delete the term from the query if it doesn\'t exist', async () => {
    store.commit('search/query', '*')
    await store.dispatch('search/deleteQueryTerm', 'term')

    expect(store.state.search.query).toEqual('*')
  })

  it('should delete the term from the query', async () => {
    store.commit('search/query', 'this is a query')
    await store.dispatch('search/deleteQueryTerm', 'is')

    expect(store.state.search.query).toEqual('this a query')
  })

  it('should delete all occurrences of the term from the query', async () => {
    store.commit('search/query', 'this is is is a query')
    await store.dispatch('search/deleteQueryTerm', 'is')

    expect(store.state.search.query).toEqual('this a query')
  })

  it('should delete "AND" boolean operator on first applied filter deletion, if any', async () => {
    store.commit('search/query', 'term_01 AND term_02')
    await store.dispatch('search/deleteQueryTerm', 'term_01')

    expect(store.state.search.query).toEqual('term_02')
  })

  it('should delete "OR" boolean operator on first applied filter deletion, if any', async () => {
    store.commit('search/query', 'term_01 OR term_02')
    await store.dispatch('search/deleteQueryTerm', 'term_01')

    expect(store.state.search.query).toEqual('term_02')
  })

  it('should delete "AND" boolean operator on last applied filter deletion, if any', async () => {
    store.commit('search/query', 'term_01 AND term_02')
    await store.dispatch('search/deleteQueryTerm', 'term_02')

    expect(store.state.search.query).toEqual('term_01')
  })

  it('should delete "OR" boolean operator on last applied filter deletion, if any', async () => {
    store.commit('search/query', 'term_01 OR term_02')
    await store.dispatch('search/deleteQueryTerm', 'term_02')

    expect(store.state.search.query).toEqual('term_01')
  })

  describe('retrieveQueryTerm', () => {
    it('should retrieve no applied filters (1/2)', () => {
      store.commit('search/query', '*')

      expect(store.getters['search/retrieveQueryTerms']).toEqual([])
    })

    it('should retrieve no applied filters (2/2)', () => {
      store.commit('search/query', '   ')

      expect(store.getters['search/retrieveQueryTerms']).toEqual([])
    })

    it('should retrieve 1 applied filter', () => {
      store.commit('search/query', 'term_01')

      expect(store.getters['search/retrieveQueryTerms']).toEqual([{ field: '', label: 'term_01', negation: false }])
    })

    it('should retrieve 2 applied filters', () => {
      store.commit('search/query', 'term_01 term_02')

      expect(store.getters['search/retrieveQueryTerms']).toEqual([{ field: '', label: 'term_01', negation: false }, { field: '', label: 'term_02', negation: false }])
    })

    it('should retrieve 3 applied filters', () => {
      store.commit('search/query', 'term_01 term_02 term_03')

      expect(store.getters['search/retrieveQueryTerms']).toEqual([{ field: '', label: 'term_01', negation: false }, { field: '', label: 'term_02', negation: false }, { field: '', label: 'term_03', negation: false }])
    })

    it('should merge 2 identical terms', () => {
      store.commit('search/query', 'term_01 term_01')

      expect(store.getters['search/retrieveQueryTerms']).toEqual([{ field: '', label: 'term_01', negation: false }])
    })

    it('should filter on boolean operators "AND" and "OR"', () => {
      store.commit('search/query', 'term_01 AND term_02 OR term_03')

      expect(store.getters['search/retrieveQueryTerms']).toEqual([{ field: '', label: 'term_01', negation: false }, { field: '', label: 'term_02', negation: false }, { field: '', label: 'term_03', negation: false }])
    })

    it('should not split an exact search sentence', () => {
      store.commit('search/query', 'term_01 "and an exact term" term_02')

      expect(store.getters['search/retrieveQueryTerms']).toEqual([{ field: '', label: 'term_01', negation: false }, { field: '', label: 'and an exact term', negation: false }, { field: '', label: 'term_02', negation: false }])
    })

    it('should display field name', () => {
      store.commit('search/query', 'field_name:term_01')

      expect(store.getters['search/retrieveQueryTerms']).toEqual([{ field: 'field_name', label: 'term_01', negation: false }])
    })

    it('should return a negation parameter according to the prefix', () => {
      store.commit('search/query', '-term_01 +term_02 !term_03')

      expect(store.getters['search/retrieveQueryTerms']).toEqual([{ field: '', label: 'term_01', negation: true }, { field: '', label: 'term_02', negation: false }, { field: '', label: 'term_03', negation: true }])
    })

    it('should return a negation parameter if query starts by "NOT"', () => {
      store.commit('search/query', 'NOT term_01')

      expect(store.getters['search/retrieveQueryTerms']).toEqual([{ field: '', label: 'term_01', negation: true }])
    })

    it('should return a negation parameter if query contains "AND NOT" or "OR NOT"', () => {
      store.commit('search/query', 'term_01 AND NOT term_02 NOT term_03')

      expect(store.getters['search/retrieveQueryTerms']).toEqual([{ field: '', label: 'term_01', negation: false }, { field: '', label: 'term_02', negation: true }, { field: '', label: 'term_03', negation: true }])
    })

    it('should remove escaped slash', () => {
      store.commit('search/query', 'term\\:other')

      expect(store.getters['search/retrieveQueryTerms']).toEqual([{ field: '', label: 'term:other', negation: false }])
    })

    it('should grab terms between brackets', () => {
      store.commit('search/query', 'term_01 (term_02 AND -term_03) term_04')

      expect(store.getters['search/retrieveQueryTerms']).toEqual([{ field: '', label: 'term_01', negation: false }, { field: '', label: 'term_02', negation: false }, { field: '', label: 'term_03', negation: true }, { field: '', label: 'term_04', negation: false }])
    })

    it('Should apply the negation only to the second group', () => {
      store.commit('search/query', '(term_01 term_02) NOT term_03')

      expect(store.getters['search/retrieveQueryTerms']).toEqual([{ field: '', label: 'term_01', negation: false }, { field: '', label: 'term_02', negation: false }, { field: '', label: 'term_03', negation: true }])
    })
  })

  describe('retrieveContentQueryTermsInContent', () => {
    it('should return an empty array', () => {
      expect(store.getters['search/retrieveContentQueryTermsInContent']()).toEqual([])
    })
  })

  describe('retrieveContentQueryTermsInDocument', () => {
    it('should return an empty array if no query term', async () => {
      const id = 'document'
      await letData(es).have(new IndexedDocument(id)).commit()
      await store.dispatch('document/get', { id, index })
      await store.dispatch('search/query', '*')

      expect(store.getters['search/retrieveContentQueryTermsInDocument'](store.state.document.doc)).toEqual([])
    })

    it('should return an empty result if no match between the query and the document', async () => {
      const id = 'document'
      await letData(es).have(new IndexedDocument(id)).commit()
      await store.dispatch('document/get', { id, index })
      await store.dispatch('search/query', 'test')

      expect(store.getters['search/retrieveContentQueryTermsInDocument'](store.state.document.doc)).toEqual([{ content: 0, field: '', label: 'test', metadata: 0, negation: false, tags: 0 }])
    })

    it('should return a content of 1 if there is a match between the query and the document content', async () => {
      const id = 'document'
      await letData(es).have(new IndexedDocument(id).withContent('specific term specific')).commit()
      await store.dispatch('document/get', { id, index })
      await store.dispatch('search/query', 'specific')

      expect(store.getters['search/retrieveContentQueryTermsInDocument'](store.state.document.doc)).toEqual([{ content: 2, field: '', label: 'specific', metadata: 0, negation: false, tags: 0 }])
    })

    it('should return a metadata of 1 if there is a match between the query and the document metadata', async () => {
      const id = 'document'
      await letData(es).have(new IndexedDocument(id).withMetadata('metadata metadata metadata')).commit()
      await store.dispatch('document/get', { id, index })
      await store.dispatch('search/query', 'metadata')

      expect(store.getters['search/retrieveContentQueryTermsInDocument'](store.state.document.doc)).toEqual([{ content: 0, field: '', label: 'metadata', metadata: 3, negation: false, tags: 0 }])
    })

    it('should return a tags of 1 if there is a match between the query and the document tags', async () => {
      const id = 'document'
      await letData(es).have(new IndexedDocument(id).withTags(['tags'])).commit()
      await store.dispatch('document/get', { id, index })
      await store.dispatch('search/query', 'tags')

      expect(store.getters['search/retrieveContentQueryTermsInDocument'](store.state.document.doc)).toEqual([{ content: 0, field: '', label: 'tags', metadata: 0, negation: false, tags: 1 }])
    })
  })

  describe('deleteQueryTerm', () => {
    it('should delete 1 simple query term', async () => {
      store.commit('search/query', 'term_01')
      await store.dispatch('search/deleteQueryTerm', 'term_01')

      expect(store.state.search.query).toEqual('')
    })

    it('should delete 1 simple prefixed query term', async () => {
      store.commit('search/query', '-term_01')
      await store.dispatch('search/deleteQueryTerm', 'term_01')

      expect(store.state.search.query).toEqual('')
    })

    it('should delete 1 simple negative query term', async () => {
      store.commit('search/query', 'NOT term_01')
      await store.dispatch('search/deleteQueryTerm', 'term_01')

      expect(store.state.search.query).toEqual('')
    })

    it('should delete a term from a complex query', async () => {
      store.commit('search/query', 'term_01 AND term_02')
      await store.dispatch('search/deleteQueryTerm', 'term_02')

      expect(store.state.search.query).toEqual('term_01')
    })

    it('should delete a negative term from a complex query', async () => {
      store.commit('search/query', 'term_01 AND NOT term_02')
      await store.dispatch('search/deleteQueryTerm', 'term_02')

      expect(store.state.search.query).toEqual('term_01')
    })

    it('should delete a term from a recursive query', async () => {
      store.commit('search/query', 'term_01 term_02 term_03')
      await store.dispatch('search/deleteQueryTerm', 'term_03')

      expect(store.state.search.query).toEqual('term_01 term_02')
    })

    it('should delete a negative term from a recursive query', async () => {
      store.commit('search/query', 'term_01 AND NOT term_02 term_03')
      await store.dispatch('search/deleteQueryTerm', 'term_02')

      expect(store.state.search.query).toEqual('term_01 term_03')
    })

    it('should delete duplicated term from a query', async () => {
      store.commit('search/query', 'term_01 term_02 term_01')
      await store.dispatch('search/deleteQueryTerm', 'term_01')

      expect(store.state.search.query).toEqual('term_02')
    })

    it('should delete term from a query with parenthesis', async () => {
      store.commit('search/query', 'term_01 (term_02 AND term_03) term_04')
      await store.dispatch('search/deleteQueryTerm', 'term_02')

      expect(store.state.search.query).toEqual('term_01 term_03 term_04')
    })
  })

  describe('starredDocuments', () => {
    it('should return the list of the starredDocuments', async () => {
      datashare.fetch.mockReturnValue(jsonOk([42]))
      await store.dispatch('search/getStarredDocuments')

      expect(store.state.search.starredDocuments).toEqual([42])
      expect(store.getters['search/findFacet']('starred').starredDocuments).toEqual([42])
    })

    it('should remove a documentId from the list of the starredDocuments', () => {
      store.commit('search/starredDocuments', [12, 42])
      store.commit('search/removeFromStarredDocuments', [42])

      expect(store.state.search.starredDocuments).toEqual([12])
    })

    it('should push a documentId from the list of the starredDocuments', () => {
      store.commit('search/starredDocuments', [12])
      store.commit('search/pushFromStarredDocuments', 42)

      expect(store.state.search.starredDocuments).toEqual([12, 42])
    })

    it('should push a documentId from the list of the starredDocuments only if it does not exist', () => {
      store.commit('search/pushFromStarredDocuments', 12)
      store.commit('search/pushFromStarredDocuments', 42)
      store.commit('search/pushFromStarredDocuments', 42)
      store.commit('search/pushFromStarredDocuments', 42)

      expect(store.state.search.starredDocuments).toEqual([12, 42])
    })

    it('should toggle a starred documentId, push it if it is not starred', async () => {
      store.commit('search/starredDocuments', [])
      await store.dispatch('search/toggleStarDocument', 45)

      expect(store.state.search.starredDocuments).toEqual([45])
      expect(store.getters['search/findFacet']('starred').starredDocuments).toEqual([45])
    })

    it('should toggle a starred documentId, remove it if it is starred', async () => {
      store.commit('search/starredDocuments', [48])
      await store.dispatch('search/toggleStarDocument', 48)

      expect(store.state.search.starredDocuments).toEqual([])
      expect(store.getters['search/findFacet']('starred').starredDocuments).toEqual([])
    })

    it('should setStarredDocuments for facet', () => {
      store.commit('search/starredDocuments', ['doc_01', 'doc_02'])
      store.commit('search/setStarredDocuments')
      expect(store.getters['search/findFacet']('starred').starredDocuments).toEqual(['doc_01', 'doc_02'])
    })
  })

  it('should find document on querying the NamedEntity', async () => {
    await letData(es).have(new IndexedDocument('doc_01').withNer('test')).commit()

    await store.dispatch('search/query', 'test')

    expect(store.state.search.response.hits).toHaveLength(1)
    expect(store.state.search.response.hits[0].basename).toEqual('doc_01')
  })

  it('should find document on querying the NamedEntity with a complex query', async () => {
    await letData(es).have(new IndexedDocument('doc_01').withContent('test').withNer('ner_01')).commit()
    await letData(es).have(new IndexedDocument('doc_02').withNer('ner_02')).commit()
    await letData(es).have(new IndexedDocument('doc_03').withNer('test')).commit()

    await store.dispatch('search/query', '(test AND ner_*) OR test')

    expect(store.state.search.response.hits).toHaveLength(2)
    expect(store.state.search.response.hits[0].basename).toEqual('doc_01')
    expect(store.state.search.response.hits[1].basename).toEqual('doc_03')
  })

  it('should set this value to the facet', () => {
    const name = 'creation-date'
    store.commit('search/setFacetValue', { name, value: '12' })
    store.commit('search/setFacetValue', { name, value: '42' })

    expect(find(store.state.search.facets, { name }).values).toEqual(['42'])
  })

  it('should star a batch of documents', async () => {
    await letData(es).have(new IndexedDocument('doc_01').withContent('test').withNer('ner_01')).commit()
    await letData(es).have(new IndexedDocument('doc_02').withNer('ner_02')).commit()
    await letData(es).have(new IndexedDocument('doc_03').withNer('test')).commit()

    await store.dispatch('search/starDocuments', [{ id: 'doc_01' }, { id: 'doc_03' }])

    expect(store.state.search.starredDocuments).toEqual(['doc_01', 'doc_03'])
  })

  it('should unstar a batch of documents', async () => {
    await letData(es).have(new IndexedDocument('doc_01').withContent('test').withNer('ner_01')).commit()
    await letData(es).have(new IndexedDocument('doc_02').withNer('ner_02')).commit()
    await letData(es).have(new IndexedDocument('doc_03').withNer('test')).commit()

    await store.dispatch('search/starDocuments', [{ id: 'doc_01' }, { id: 'doc_03' }])
    await store.dispatch('search/unstarDocuments', [{ id: 'doc_01' }])

    expect(store.state.search.starredDocuments).toEqual(['doc_03'])
  })
})
