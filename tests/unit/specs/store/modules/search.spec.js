import cloneDeep from 'lodash/cloneDeep'
import find from 'lodash/find'
import omit from 'lodash/omit'
import toLower from 'lodash/toLower'
import axios from 'axios'

import Api from '@/api'
import Document from '@/api/resources/Document'
import EsDocList from '@/api/resources/EsDocList'
import NamedEntity from '@/api/resources/NamedEntity'
import store from '@/store'
import { IndexedDocument, IndexedDocuments, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'

jest.mock('axios')

describe('SearchStore', () => {
  const project = toLower('SearchStore')
  const anotherProject = toLower('AnotherSearchStore')
  esConnectionHelper([project, anotherProject])
  const es = esConnectionHelper.es

  beforeAll(() => store.commit('search/index', project))

  afterEach(() => {
    store.commit('search/index', project)
    store.commit('search/reset')
  })

  afterAll(() => jest.unmock('axios'))

  it('should define a store module', () => {
    expect(store.state.search).not.toBeUndefined()
  })

  it('should instantiate the default 12 filters, with order', () => {
    const filters = store.getters['search/instantiatedFilters']

    expect(filters).toHaveLength(12)
    expect(find(filters, { name: 'contentType' }).order).toEqual(40)
  })

  it('should reset to initial state', async () => {
    const initialState = cloneDeep(store.state.search)
    store.commit('search/index', anotherProject)
    store.commit('search/query', 'datashare')
    store.commit('search/size', 12)
    store.commit('search/sort', 'randomOrder')
    store.commit('search/addFilterValue', { name: 'contentType', value: 'TXT' })
    store.commit('search/toggleFilters')
    store.commit('search/isDownloadAllowed', true)
    store.commit('search/recommendedByUsers', ['user_01', 'user_02'])
    store.commit('search/recommendedByTotal', 42)

    store.commit('search/reset')

    const omittedFields = ['index', 'isReady', 'filters', 'showFilters', 'response', 'size', 'sort']
    expect(omit(store.state.search, omittedFields)).toEqual(omit(initialState, omittedFields))
    expect(store.state.search.index).toBe(anotherProject)
    expect(store.state.search.isReady).toBeTruthy()
    expect(find(store.getters['search/instantiatedFilters'], { name: 'contentType' }).values).toEqual([])

    store.commit('search/size', 25)
  })

  it('should not reset the starredDocuments from the filter', async () => {
    store.commit('search/starredDocuments', ['document_01', 'document_02'])

    store.commit('search/reset', ['starredDocuments'])

    expect(find(store.getters['search/instantiatedFilters'], { name: 'starred' }).starredDocuments).toEqual(['document_01', 'document_02'])
  })

  it('should not reset the starredDocuments', async () => {
    store.commit('search/starredDocuments', ['document_01', 'document_02'])

    store.commit('search/reset', ['starredDocuments'])

    expect(store.state.search.starredDocuments).toEqual(['document_01', 'document_02'])
  })

  it('should change the state after "query" mutation', async () => {
    await store.dispatch('search/query', 'bar')

    expect(store.state.search.query).toBe('bar')
  })

  it('should build a EsDocList object from raw value', () => {
    store.commit('search/buildResponse', {
      hits: {
        hits: [
          { _source: { type: 'Document' }, _id: 'foo' },
          { _source: { type: 'NamedEntity' }, _id: 'bar' }
        ]
      }
    })
    expect(store.state.search.response).toBeInstanceOf(EsDocList)
  })

  it('should build a correct EsDocList object from raw value', () => {
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
    expect(store.state.search.response.hits[2]).toBeUndefined()
  })

  it('should return document from local project', async () => {
    await letData(es).have(new IndexedDocument('document', project).withContent('bar')).commit()
    await store.dispatch('search/query', 'bar')

    expect(store.state.search.response.hits).toHaveLength(1)
    expect(store.state.search.response.hits[0].basename).toBe('document')
  })

  it('should return document from another project', async () => {
    await letData(es).have(new IndexedDocument('document', anotherProject).withContent('bar')).commit()
    await store.dispatch('search/query', { index: anotherProject, query: 'bar', from: 0, size: 25 })

    expect(store.state.search.response.hits).toHaveLength(1)
    expect(store.state.search.response.hits[0].basename).toBe('document')
  })

  it('should find 2 documents filtered by one contentType', async () => {
    await letData(es).have(new IndexedDocument('bar.txt', project).withContentType('txt').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('foo.txt', project).withContentType('txt').withContent('foo')).commit()
    await letData(es).have(new IndexedDocument('bar.pdf', project).withContentType('pdf').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('foo.pdf', project).withContentType('pdf').withContent('foo')).commit()

    await store.dispatch('search/query', '*')
    expect(store.state.search.response.hits).toHaveLength(4)
    await store.dispatch('search/addFilterValue', { name: 'contentType', value: 'pdf' })
    expect(store.state.search.response.hits).toHaveLength(2)
  })

  it('should find 3 documents filtered by two contentType', async () => {
    await letData(es).have(new IndexedDocument('bar.txt', project).withContentType('txt').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.pdf', project).withContentType('pdf').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.csv', project).withContentType('csv').withContent('bar')).commit()

    await store.dispatch('search/query', '*')
    expect(store.state.search.response.hits).toHaveLength(3)
    await store.dispatch('search/addFilterValue', { name: 'contentType', value: 'pdf' })
    expect(store.state.search.response.hits).toHaveLength(1)
    await store.dispatch('search/addFilterValue', { name: 'contentType', value: 'csv' })
    expect(store.state.search.response.hits).toHaveLength(2)
  })

  it('should not find documents after filtering by contentType', async () => {
    await letData(es).have(new IndexedDocument('bar.txt', project).withContentType('txt').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.pdf', project).withContentType('pdf').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.csv', project).withContentType('csv').withContent('bar')).commit()

    await store.dispatch('search/query', '*')
    expect(store.state.search.response.hits).toHaveLength(3)
    await store.dispatch('search/addFilterValue', { name: 'contentType', value: 'ico' })
    expect(store.state.search.response.hits).toHaveLength(0)
  })

  it('should find documents after removing filter by contentType', async () => {
    await letData(es).have(new IndexedDocument('bar.txt', project).withContentType('txt').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.pdf', project).withContentType('pdf').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.csv', project).withContentType('csv').withContent('bar')).commit()

    await store.dispatch('search/query', '*')
    expect(store.state.search.response.hits).toHaveLength(3)
    await store.dispatch('search/addFilterValue', { name: 'contentType', value: 'ico' })
    expect(store.state.search.response.hits).toHaveLength(0)
    await store.dispatch('search/removeFilterValue', { name: 'contentType', value: 'ico' })
    expect(store.state.search.response.hits).toHaveLength(3)
  })

  it('should exclude documents with a specific contentType', async () => {
    await letData(es).have(new IndexedDocument('bar.txt', project).withContentType('txt').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.pdf', project).withContentType('pdf').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.csv', project).withContentType('csv').withContent('bar')).commit()

    await store.dispatch('search/query', '*')
    expect(store.state.search.response.hits).toHaveLength(3)
    await store.dispatch('search/addFilterValue', { name: 'contentType', value: 'txt' })
    expect(store.state.search.response.hits).toHaveLength(1)
    await store.dispatch('search/toggleFilter', 'contentType')
    expect(store.state.search.response.hits).toHaveLength(2)
  })

  it('should exclude documents with a specific contentType and include them again', async () => {
    await letData(es).have(new IndexedDocument('bar.txt', project).withContent('bar').withNer('name_01')).commit()
    await letData(es).have(new IndexedDocument('foo.txt', project).withContent('foo').withNer('name_01')).commit()
    await letData(es).have(new IndexedDocument('bar.pdf', project).withContent('bar').withNer('name_01')).commit()
    await letData(es).have(new IndexedDocument('bar.csv', project).withContent('bar').withNer('name_02')).commit()
    await letData(es).have(new IndexedDocument('bar.ico', project).withContent('bar').withNer('name_02')).commit()

    await store.dispatch('search/addFilterValue', { name: 'namedEntityPerson', value: 'name_02' })
    expect(store.state.search.response.hits).toHaveLength(2)
  })

  it('should filter documents if a named entity is selected', async () => {
    await letData(es).have(new IndexedDocument('bar.txt', project).withContentType('txt').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('foo.txt', project).withContentType('txt').withContent('foo')).commit()
    await letData(es).have(new IndexedDocument('bar.pdf', project).withContentType('pdf').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.csv', project).withContentType('csv').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.ico', project).withContentType('ico').withContent('bar')).commit()

    await store.dispatch('search/query', '*')
    await store.dispatch('search/setFilterValue', { name: 'contentType', value: 'txt' })
    await store.dispatch('search/toggleFilter', 'contentType')
    expect(store.state.search.response.hits).toHaveLength(3)
    await store.dispatch('search/toggleFilter', 'contentType')
    expect(store.state.search.response.hits).toHaveLength(2)
  })

  describe('hasFilterValue', () => {
    it('this filter should have no values', () => {
      expect(store.getters['search/hasFilterValue']({ name: 'contentType' })).toBeFalsy()
    })

    it('this filter should have value', async () => {
      await store.dispatch('search/addFilterValue', { name: 'contentType', value: 'txt' })
      expect(store.getters['search/hasFilterValue']({ name: 'contentType', value: 'txt' })).toBeTruthy()
    })
  })

  describe('hasFilterValues', () => {
    it('should take into account the given filter', async () => {
      expect(store.getters['search/hasFilterValues']('contentType')).toBeFalsy()

      await store.dispatch('search/addFilterValue', { name: 'contentType', value: 'txt' })
      expect(store.getters['search/hasFilterValues']('contentType')).toBeTruthy()
    })

    it('should take into account the given filter but not an arbitrary one', async () => {
      await store.dispatch('search/addFilterValue', { name: 'contentType', value: 'txt' })

      expect(store.getters['search/hasFilterValues']('contentType')).toBeTruthy()
      expect(store.getters['search/hasFilterValues']('bar')).toBeFalsy()
    })

    it('should take into account the given filter and its invert', async () => {
      await store.dispatch('search/addFilterValue', { name: 'contentType', value: 'txt' })
      expect(store.getters['search/hasFilterValues']('contentType')).toBeTruthy()
      expect(store.getters['search/isFilterReversed']('contentType')).toBeFalsy()
      await store.dispatch('search/toggleFilter', 'contentType')
      expect(store.getters['search/isFilterReversed']('contentType')).toBeTruthy()
    })
  })

  it('should take into reverse a filter and not the others', async () => {
    await store.dispatch('search/addFilterValue', { name: 'contentType', value: 'txt' })
    await store.dispatch('search/addFilterValue', { name: 'language', value: 'fr' })
    await store.dispatch('search/toggleFilter', 'contentType')
    expect(store.getters['search/isFilterReversed']('contentType')).toBeTruthy()
    expect(store.getters['search/isFilterReversed']('language')).toBeFalsy()
  })

  it('should add filter with several values', async () => {
    await store.dispatch('search/addFilterValue', { name: 'contentType', value: ['txt', 'pdf'] })
    expect(store.getters['search/getFilter']({ name: 'contentType' }).values).toHaveLength(2)
  })

  it('should merge filter values with several other values', async () => {
    await store.dispatch('search/addFilterValue', { name: 'contentType', value: 'txt' })
    expect(store.getters['search/getFilter']({ name: 'contentType' }).values).toHaveLength(1)
    await store.dispatch('search/addFilterValue', { name: 'contentType', value: ['csv', 'pdf'] })
    expect(store.getters['search/getFilter']({ name: 'contentType' }).values).toHaveLength(3)
  })

  it('should add a filter value only once', async () => {
    await store.dispatch('search/addFilterValue', { name: 'contentType', value: ['txt', 'csv', 'pdf'] })
    expect(store.getters['search/getFilter']({ name: 'contentType' }).values).toHaveLength(3)
    await store.dispatch('search/addFilterValue', { name: 'contentType', value: ['txt', 'pdf'] })
    expect(store.getters['search/getFilter']({ name: 'contentType' }).values).toHaveLength(3)
  })

  it('should add a filter value only once even if numbers', async () => {
    await store.dispatch('search/addFilterValue', { name: 'contentType', value: [1, 2, 3] })
    expect(store.getters['search/getFilter']({ name: 'contentType' }).values).toHaveLength(3)
    await store.dispatch('search/addFilterValue', { name: 'contentType', value: ['1', '2'] })
    expect(store.getters['search/getFilter']({ name: 'contentType' }).values).toHaveLength(3)
  })

  it('should return 2 documents', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('this is a document').withIndex(project).count(4)).commit()

    await store.dispatch('search/query', { query: 'document', from: 0, size: 2 })
    expect(store.state.search.response.hits).toHaveLength(2)
    store.commit('search/size', 25)
  })

  it('should return 3 documents', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('this is a document').withIndex(project).count(4)).commit()

    await store.dispatch('search/query', { query: 'document', from: 0, size: 3 })
    expect(store.state.search.response.hits).toHaveLength(3)
    store.commit('search/size', 25)
  })

  it('should return 1 document (1/3)', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('this is a document').withIndex(project).count(4)).commit()

    await store.dispatch('search/query', { query: 'document', from: 3, size: 3 })
    expect(store.state.search.response.hits).toHaveLength(1)
    store.commit('search/size', 25)
  })

  it('should return 0 documents in total', async () => {
    await store.dispatch('search/query', '*')
    expect(store.state.search.response.total).toEqual(0)
  })

  it('should return 5 documents in total', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('this is a document').withIndex(project).count(5)).commit()

    await store.dispatch('search/query', { query: 'document', from: 0, size: 2 })
    expect(store.state.search.response.total).toEqual(5)
    store.commit('search/size', 25)
  })

  it('should return the default query parameters', () => {
    expect(store.getters['search/toRouteQuery']()).toMatchObject({ field: 'all', index: project, q: '', size: 25, sort: 'relevance', from: 0 })
  })

  it('should return an advanced and filtered query parameters', () => {
    store.commit('search/index', project)
    store.commit('search/query', 'datashare')
    store.commit('search/size', 12)
    store.commit('search/sort', 'randomOrder')
    store.commit('search/addFilterValue', { name: 'contentType', value: 'TXT' })

    expect(store.getters['search/toRouteQuery']()).toMatchObject({ index: project, q: 'datashare', from: 0, size: 12, sort: 'randomOrder', 'f[contentType]': ['TXT'] })

    store.commit('search/size', 25)
  })

  it('should reset the values of a filter', async () => {
    await store.dispatch('search/addFilterValue', { name: 'contentType', value: ['txt', 'csv'] })
    expect(store.getters['search/getFilter']({ name: 'contentType' }).values).toHaveLength(2)

    store.commit('search/resetFilterValues', 'contentType')
    expect(store.getters['search/getFilter']({ name: 'contentType' }).values).toHaveLength(0)
  })

  it('should change the state after `toggleFilters` mutation', () => {
    const showFilters = store.state.search.showFilters
    store.commit('search/toggleFilters')
    expect(store.state.search.showFilters).toEqual(!showFilters)
  })

  describe('updateFromRouteQuery should restore search state from url', () => {
    it('should set the project of the store according to the url', async () => {
      store.commit('search/index', project)
      await store.dispatch('search/updateFromRouteQuery', { index: process.env.VUE_APP_ES_ANOTHER_INDEX })

      expect(store.state.search.index).toBe(process.env.VUE_APP_ES_ANOTHER_INDEX)
    })

    it('should set the query of the store according to the url', async () => {
      store.commit('search/query', 'anything')
      await store.dispatch('search/updateFromRouteQuery', { q: 'new_query' })

      expect(store.state.search.query).toBe('new_query')
    })

    it('should set the from of the store according to the url', async () => {
      store.commit('search/from', 12)
      await store.dispatch('search/updateFromRouteQuery', { from: 42 })

      expect(store.state.search.from).toBe(42)
    })

    it('should RESET the from of the store according to the url', async () => {
      store.commit('search/from', 12)
      await store.dispatch('search/updateFromRouteQuery', { from: 0 })

      expect(store.state.search.from).toBe(0)
    })

    it('should set the size of the store according to the url', async () => {
      store.commit('search/size', 12)
      await store.dispatch('search/updateFromRouteQuery', { size: 24 })

      expect(store.state.search.size).toBe(24)
      store.commit('search/size', 25)
    })

    it('should set the sort of the store according to the url', async () => {
      store.commit('search/sort', 'anything')
      await store.dispatch('search/updateFromRouteQuery', { sort: 'new_sort' })

      expect(store.state.search.sort).toBe('new_sort')
    })

    it('should set the filter of the store according to the url', async () => {
      await store.dispatch('search/updateFromRouteQuery', { 'f[contentType]': ['new_type'] })
      expect(store.getters['search/getFilter']({ name: 'contentType' }).values[0]).toBe('new_type')
    })

    it('should not change the starredDocuments on updateFromRouteQuery', async () => {
      store.commit('search/starredDocuments', ['doc_01', 'doc_02'])
      await store.dispatch('search/updateFromRouteQuery', {})

      expect(store.state.search.starredDocuments).toEqual(['doc_01', 'doc_02'])
    })

    it('should not change the field on updateFromRouteQuery', async () => {
      store.commit('search/field', 'author')
      await store.dispatch('search/updateFromRouteQuery', {})

      expect(store.state.search.field).toBe('author')
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

    expect(store.state.search.query).toBe('this a query')
  })

  it('should delete all occurrences of the term from the query', async () => {
    store.commit('search/query', 'this is is is a query')
    await store.dispatch('search/deleteQueryTerm', 'is')

    expect(store.state.search.query).toBe('this a query')
  })

  it('should delete "AND" boolean operator on first applied filter deletion, if any', async () => {
    store.commit('search/query', 'term_01 AND term_02')
    await store.dispatch('search/deleteQueryTerm', 'term_01')

    expect(store.state.search.query).toBe('term_02')
  })

  it('should delete "OR" boolean operator on first applied filter deletion, if any', async () => {
    store.commit('search/query', 'term_01 OR term_02')
    await store.dispatch('search/deleteQueryTerm', 'term_01')

    expect(store.state.search.query).toBe('term_02')
  })

  it('should delete "AND" boolean operator on last applied filter deletion, if any', async () => {
    store.commit('search/query', 'term_01 AND term_02')
    await store.dispatch('search/deleteQueryTerm', 'term_02')

    expect(store.state.search.query).toBe('term_01')
  })

  it('should delete "OR" boolean operator on last applied filter deletion, if any', async () => {
    store.commit('search/query', 'term_01 OR term_02')
    await store.dispatch('search/deleteQueryTerm', 'term_02')

    expect(store.state.search.query).toBe('term_01')
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

      expect(store.getters['search/retrieveQueryTerms']).toEqual([{ field: '', label: 'term_01', negation: false, regex: false }])
    })

    it('should retrieve 2 applied filters', () => {
      store.commit('search/query', 'term_01 term_02')

      expect(store.getters['search/retrieveQueryTerms']).toEqual([{ field: '', label: 'term_01', negation: false, regex: false }, { field: '', label: 'term_02', negation: false, regex: false }])
    })

    it('should retrieve 3 applied filters', () => {
      store.commit('search/query', 'term_01 term_02 term_03')

      expect(store.getters['search/retrieveQueryTerms']).toEqual([{ field: '', label: 'term_01', negation: false, regex: false }, { field: '', label: 'term_02', negation: false, regex: false }, { field: '', label: 'term_03', negation: false, regex: false }])
    })

    it('should merge 2 identical terms', () => {
      store.commit('search/query', 'term_01 term_01')

      expect(store.getters['search/retrieveQueryTerms']).toEqual([{ field: '', label: 'term_01', negation: false, regex: false }])
    })

    it('should filter on boolean operators "AND" and "OR"', () => {
      store.commit('search/query', 'term_01 AND term_02 OR term_03')

      expect(store.getters['search/retrieveQueryTerms']).toEqual([{ field: '', label: 'term_01', negation: false, regex: false }, { field: '', label: 'term_02', negation: false, regex: false }, { field: '', label: 'term_03', negation: false, regex: false }])
    })

    it('should not split an exact search sentence', () => {
      store.commit('search/query', 'term_01 "and an exact term" term_02')

      expect(store.getters['search/retrieveQueryTerms']).toEqual([{ field: '', label: 'term_01', negation: false, regex: false }, { field: '', label: 'and an exact term', negation: false, regex: false }, { field: '', label: 'term_02', negation: false, regex: false }])
    })

    it('should display field name', () => {
      store.commit('search/query', 'field_name:term_01')

      expect(store.getters['search/retrieveQueryTerms']).toEqual([{ field: 'field_name', label: 'term_01', negation: false, regex: false }])
    })

    it('should return a negation parameter according to the prefix', () => {
      store.commit('search/query', '-term_01 +term_02 !term_03')

      expect(store.getters['search/retrieveQueryTerms']).toEqual([{ field: '', label: 'term_01', negation: true, regex: false }, { field: '', label: 'term_02', negation: false, regex: false }, { field: '', label: 'term_03', negation: true, regex: false }])
    })

    it('should return a negation parameter if query starts by "NOT"', () => {
      store.commit('search/query', 'NOT term_01')

      expect(store.getters['search/retrieveQueryTerms']).toEqual([{ field: '', label: 'term_01', negation: true, regex: false }])
    })

    it('should return a negation parameter if query contains "AND NOT" or "OR NOT"', () => {
      store.commit('search/query', 'term_01 AND NOT term_02 NOT term_03')

      expect(store.getters['search/retrieveQueryTerms']).toEqual([{ field: '', label: 'term_01', negation: false, regex: false }, { field: '', label: 'term_02', negation: true, regex: false }, { field: '', label: 'term_03', negation: true, regex: false }])
    })

    it('should remove escaped slash', () => {
      store.commit('search/query', 'term\\:other')

      expect(store.getters['search/retrieveQueryTerms']).toEqual([{ field: '', label: 'term:other', negation: false, regex: false }])
    })

    it('should grab terms between brackets', () => {
      store.commit('search/query', 'term_01 (term_02 AND -term_03) term_04')

      expect(store.getters['search/retrieveQueryTerms']).toEqual([{ field: '', label: 'term_01', negation: false, regex: false }, { field: '', label: 'term_02', negation: false, regex: false }, { field: '', label: 'term_03', negation: true, regex: false }, { field: '', label: 'term_04', negation: false, regex: false }])
    })

    it('should apply the negation only to the second group', () => {
      store.commit('search/query', '(term_01 term_02) NOT term_03')

      expect(store.getters['search/retrieveQueryTerms']).toEqual([{ field: '', label: 'term_01', negation: false, regex: false }, { field: '', label: 'term_02', negation: false, regex: false }, { field: '', label: 'term_03', negation: true, regex: false }])
    })

    it('should detect regex and return it as true', () => {
      store.commit('search/query', '/test and.*/')

      expect(store.getters['search/retrieveQueryTerms']).toEqual([{ field: '', label: 'test and.*', negation: false, regex: true }])
    })

    it('should replace escaped arobase in regex', () => {
      store.commit('search/query', '/.*\\@.*/')

      expect(store.getters['search/retrieveQueryTerms']).toEqual([{ field: '', label: '.*@.*', negation: false, regex: true }])
    })
  })

  describe('retrieveContentQueryTermsInContent', () => {
    it('should return an empty array', () => {
      expect(store.getters['search/retrieveContentQueryTermsInContent']()).toEqual([])
    })
  })

  describe('retrieveContentQueryTermsInDocument', () => {
    const id = 'document'

    it('should return an empty array if no query term', async () => {
      await letData(es).have(new IndexedDocument(id, project)).commit()
      await store.dispatch('document/get', { id, index: project })
      await store.dispatch('search/query', '*')

      expect(store.getters['search/retrieveContentQueryTermsInDocument'](store.state.document.doc)).toEqual([])
    })

    it('should return an empty result if no match between the query and the document', async () => {
      await letData(es).have(new IndexedDocument(id, project)).commit()
      await store.dispatch('document/get', { id, index: project })
      await store.dispatch('search/query', 'test')

      expect(store.getters['search/retrieveContentQueryTermsInDocument'](store.state.document.doc)).toEqual([{ content: 0, field: '', label: 'test', metadata: 0, negation: false, tags: 0, regex: false }])
    })

    it('should return a content of 1 if there is a match between the query and the document content', async () => {
      await letData(es).have(new IndexedDocument(id, project).withContent('specific term specific')).commit()
      await store.dispatch('document/get', { id, index: project })
      await store.dispatch('search/query', 'specific')

      expect(store.getters['search/retrieveContentQueryTermsInDocument'](store.state.document.doc)).toEqual([{ content: 2, field: '', label: 'specific', metadata: 0, negation: false, tags: 0, regex: false }])
    })

    it('should return a metadata of 1 if there is a match between the query and the document metadata', async () => {
      await letData(es).have(new IndexedDocument(id, project).withMetadata('metadata metadata metadata')).commit()
      await store.dispatch('document/get', { id, index: project })
      await store.dispatch('search/query', 'metadata')

      expect(store.getters['search/retrieveContentQueryTermsInDocument'](store.state.document.doc)).toEqual([{ content: 0, field: '', label: 'metadata', metadata: 3, negation: false, tags: 0, regex: false }])
    })

    it('should return a tags of 1 if there is a match between the query and the document tags', async () => {
      await letData(es).have(new IndexedDocument(id, project).withTags(['tags'])).commit()
      await store.dispatch('document/get', { id, index: project })
      await store.dispatch('search/query', 'tags')

      expect(store.getters['search/retrieveContentQueryTermsInDocument'](store.state.document.doc)).toEqual([{ content: 0, field: '', label: 'tags', metadata: 0, negation: false, tags: 1, regex: false }])
    })

    it('should apply regex to count occurrences', async () => {
      await letData(es).have(new IndexedDocument(id, project).withContent('this is a test like another')).commit()
      await store.dispatch('document/get', { id, index: project })
      await store.dispatch('search/query', '/.*test.*/')

      expect(store.getters['search/retrieveContentQueryTermsInDocument'](store.state.document.doc)).toEqual([{ content: 1, field: '', label: '.*test.*', metadata: 0, negation: false, tags: 0, regex: true }])
    })

    it('should find phrase match across carriage return', async () => {
      await letData(es).have(new IndexedDocument(id, project).withContent('content content Emmanuel\nMacron content')).commit()
      await store.dispatch('document/get', { id, index: project })
      await store.dispatch('search/query', '"Emmanuel Macron"')

      expect(store.getters['search/retrieveContentQueryTermsInDocument'](store.state.document.doc)).toEqual([{ content: 1, field: '', label: 'Emmanuel Macron', metadata: 0, negation: false, tags: 0, regex: false }])
    })
  })

  describe('deleteQueryTerm', () => {
    it('should delete 1 simple query term', async () => {
      store.commit('search/query', 'term_01')
      await store.dispatch('search/deleteQueryTerm', 'term_01')

      expect(store.state.search.query).toBe('')
    })

    it('should delete 1 simple prefixed query term', async () => {
      store.commit('search/query', '-term_01')
      await store.dispatch('search/deleteQueryTerm', 'term_01')

      expect(store.state.search.query).toBe('')
    })

    it('should delete 1 simple negative query term', async () => {
      store.commit('search/query', 'NOT term_01')
      await store.dispatch('search/deleteQueryTerm', 'term_01')

      expect(store.state.search.query).toBe('')
    })

    it('should delete a term from a complex query', async () => {
      store.commit('search/query', 'term_01 AND term_02')
      await store.dispatch('search/deleteQueryTerm', 'term_02')

      expect(store.state.search.query).toBe('term_01')
    })

    it('should delete a negative term from a complex query', async () => {
      store.commit('search/query', 'term_01 AND NOT term_02')
      await store.dispatch('search/deleteQueryTerm', 'term_02')

      expect(store.state.search.query).toBe('term_01')
    })

    it('should delete a term from a recursive query', async () => {
      store.commit('search/query', 'term_01 term_02 term_03')
      await store.dispatch('search/deleteQueryTerm', 'term_03')

      expect(store.state.search.query).toBe('term_01 term_02')
    })

    it('should delete a negative term from a recursive query', async () => {
      store.commit('search/query', 'term_01 AND NOT term_02 term_03')
      await store.dispatch('search/deleteQueryTerm', 'term_02')

      expect(store.state.search.query).toBe('term_01 term_03')
    })

    it('should delete duplicated term from a query', async () => {
      store.commit('search/query', 'term_01 term_02 term_01')
      await store.dispatch('search/deleteQueryTerm', 'term_01')

      expect(store.state.search.query).toBe('term_02')
    })

    it('should delete term from a query with parenthesis', async () => {
      store.commit('search/query', 'term_01 (term_02 AND term_03) term_04')
      await store.dispatch('search/deleteQueryTerm', 'term_02')

      expect(store.state.search.query).toBe('term_01 term_03 term_04')
    })
  })

  describe('starredDocuments', () => {
    it('should return the list of the starredDocuments', async () => {
      axios.request.mockResolvedValue({ data: [42] })
      await store.dispatch('search/getStarredDocuments')

      expect(store.state.search.starredDocuments).toEqual([42])
      expect(store.getters['search/getFilter']({ name: 'starred' }).starredDocuments).toEqual([42])
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
      expect(store.getters['search/getFilter']({ name: 'starred' }).starredDocuments).toEqual([45])
    })

    it('should toggle a starred documentId, remove it if it is starred', async () => {
      store.commit('search/starredDocuments', [48])
      await store.dispatch('search/toggleStarDocument', 48)

      expect(store.state.search.starredDocuments).toEqual([])
      expect(store.getters['search/getFilter']({ name: 'starred' }).starredDocuments).toEqual([])
    })

    it('should set the starredDocuments property of the filter', () => {
      store.commit('search/starredDocuments', ['doc_01', 'doc_02'])
      expect(store.getters['search/getFilter']({ name: 'starred' }).starredDocuments).toEqual(['doc_01', 'doc_02'])
    })
  })

  it('should find document on querying the NamedEntity', async () => {
    await letData(es).have(new IndexedDocument('doc_01', project).withNer('test')).commit()

    await store.dispatch('search/query', 'test')

    expect(store.state.search.response.hits).toHaveLength(1)
    expect(store.state.search.response.hits[0].basename).toBe('doc_01')
  })

  it('should find document on querying the NamedEntity with a complex query', async () => {
    await letData(es).have(new IndexedDocument('doc_01', project).withContent('test').withNer('ner_01')).commit()
    await letData(es).have(new IndexedDocument('doc_02', project).withNer('ner_02')).commit()
    await letData(es).have(new IndexedDocument('doc_03', project).withNer('test')).commit()

    await store.dispatch('search/query', '(test AND ner_*) OR test')

    expect(store.state.search.response.hits).toHaveLength(2)
    expect(store.state.search.response.hits[0].basename).toBe('doc_03')
    expect(store.state.search.response.hits[1].basename).toBe('doc_01')
  })

  it('should set this value to the filter', () => {
    const name = 'creationDate'
    store.commit('search/setFilterValue', { name, value: '12' })
    store.commit('search/setFilterValue', { name, value: '42' })

    expect(find(store.getters['search/instantiatedFilters'], { name }).values).toEqual(['42'])
  })

  it('should star a batch of documents', async () => {
    await letData(es).have(new IndexedDocument('doc_01', project).withContent('test').withNer('ner_01')).commit()
    await letData(es).have(new IndexedDocument('doc_02', project).withNer('ner_02')).commit()
    await letData(es).have(new IndexedDocument('doc_03', project).withNer('test')).commit()

    await store.dispatch('search/starDocuments', [{ id: 'doc_01' }, { id: 'doc_03' }])

    expect(store.state.search.starredDocuments).toEqual(['doc_01', 'doc_03'])
  })

  it('should unstar a batch of documents', async () => {
    await letData(es).have(new IndexedDocument('doc_01', project).withContent('test').withNer('ner_01')).commit()
    await letData(es).have(new IndexedDocument('doc_02', project).withNer('ner_02')).commit()
    await letData(es).have(new IndexedDocument('doc_03', project).withNer('test')).commit()

    await store.dispatch('search/starDocuments', [{ id: 'doc_01' }, { id: 'doc_03' }])
    await store.dispatch('search/unstarDocuments', [{ id: 'doc_01' }])

    expect(store.state.search.starredDocuments).toEqual(['doc_03'])
  })

  it('should order documents by path', async () => {
    await letData(es).have(new IndexedDocument('c', project)).commit()
    await letData(es).have(new IndexedDocument('b', project)).commit()
    await letData(es).have(new IndexedDocument('a', project)).commit()

    await store.dispatch('search/query', '*')

    expect(store.state.search.response.hits).toHaveLength(3)
    expect(store.state.search.response.hits[0].shortId).toBe('a')
    expect(store.state.search.response.hits[1].shortId).toBe('b')
    expect(store.state.search.response.hits[2].shortId).toBe('c')
  })

  describe('documentsRecommended state attribute', () => {
    it('should init documentsRecommended to an empty array', () => {
      expect(store.state.search).toHaveProperty('documentsRecommended')
      expect(store.state.search.documentsRecommended).toEqual([])
    })

    it('should set documentsRecommended to userIds', () => {
      const userIds = ['user_01', 'user_02', 'user_03']
      store.commit('search/documentsRecommended', userIds)

      expect(store.state.search.documentsRecommended).toEqual(userIds)
    })

    it('should set the list of documents recommended by a list of users', async () => {
      axios.request.mockResolvedValue({ data: ['document_01', 'document_02', 'document_03'] })
      axios.request.mockClear()

      await store.dispatch('search/getDocumentsRecommendedBy', ['user_01', 'user_02'])

      expect(axios.request).toBeCalledTimes(1)
      expect(axios.request).toBeCalledWith(expect.objectContaining({
        url: Api.getFullUrl(`/api/${project}/documents/recommendations?userids=user_01,user_02`)
      }))
      expect(store.state.search.documentsRecommended).toEqual(['document_01', 'document_02', 'document_03'])
    })

    it('should reset the list of documents recommended if no users', async () => {
      axios.request.mockClear()

      await store.dispatch('search/getDocumentsRecommendedBy', [])

      expect(axios.request).toBeCalledTimes(0)
      expect(store.state.search.documentsRecommended).toEqual([])
    })
  })

  describe('recommendedByUsers state attribute', () => {
    it('should init recommendedByUsers to an empty array', () => {
      expect(store.state.search).toHaveProperty('recommendedByUsers')
      expect(store.state.search.recommendedByUsers).toEqual([])
    })

    it('should init recommendedByTotal to zero', () => {
      expect(store.state.search).toHaveProperty('recommendedByTotal')
      expect(store.state.search.recommendedByTotal).toBe(0)
    })

    it('should return users who recommended documents from this project', async () => {
      axios.request.mockResolvedValue({ data: { aggregates: [{ item: { id: 'user_01' }, count: 1 }, { item: { id: 'user_02' }, count: 1 }] } })
      axios.request.mockClear()

      await store.dispatch('search/getRecommendationsByProject')

      expect(axios.request).toBeCalledTimes(1)
      expect(axios.request).toBeCalledWith(expect.objectContaining({
        url: Api.getFullUrl(`/api/users/recommendations?project=${project}`)
      }))
      expect(store.state.search.recommendedByUsers).toEqual([{ user: 'user_01', count: 1 }, { user: 'user_02', count: 1 }])
    })

    it('should return the total of documents recommended for this project', async () => {
      axios.request.mockResolvedValue({ data: { totalCount: 42 } })
      axios.request.mockClear()

      await store.dispatch('search/getRecommendationsByProject')

      expect(axios.request).toBeCalledTimes(1)
      expect(axios.request).toBeCalledWith(expect.objectContaining({
        url: Api.getFullUrl(`/api/users/recommendations?project=${project}`)
      }))
      expect(store.state.search.recommendedByTotal).toBe(42)
    })
  })
})
