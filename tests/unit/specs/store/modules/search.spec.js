import { find } from 'lodash'
import { setActivePinia, createPinia } from 'pinia'

import { IndexedDocument, IndexedDocuments, letData } from '~tests/unit/es_utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import Document from '@/api/resources/Document'
import EsDocList from '@/api/resources/EsDocList'
import NamedEntity from '@/api/resources/NamedEntity'
import { useAppStore, useSearchStore } from '@/store/modules'

describe('SearchStore', () => {
  const { index: project, es } = esConnectionHelper.build()
  const { index: anotherProject } = esConnectionHelper.build()

  let searchStore, appStore

  beforeEach(() => {
    setActivePinia(createPinia())
    appStore = useAppStore()
    searchStore = useSearchStore()
    searchStore.setIndex(project)
    appStore.setSettings({ view: 'search', perPage: 25 })
    appStore.setSettings({ view: 'search', orderBy: ['_score', 'desc'] })
  })

  it('should define a store module', () => {
    expect(searchStore).toBeDefined()
  })

  it('should instantiate the default 13 filters, with order', () => {
    const filters = searchStore.instantiatedFilters

    expect(filters).toHaveLength(13)
    expect(find(filters, { name: 'contentType' }).order).toBe(40)
  })

  it('should reset to initial state', async () => {
    appStore.setSettings({ view: 'search', perPage: 12 })
    appStore.setSettings({ view: 'search', orderBy: ['randomOrder', 'asc'] })

    searchStore.setIndices([anotherProject])
    searchStore.setQuery('datashare')
    searchStore.addFilterValue({ name: 'contentType', value: 'TXT' })

    searchStore.reset()

    expect(searchStore.isReady).toBeTruthy()
    expect(find(searchStore.instantiatedFilters, { name: 'contentType' }).values).toHaveLength(0)

    appStore.setSettings({ view: 'search', perPage: 25 })
  })

  it('should change the state after "query" mutation', async () => {
    await searchStore.query('bar')
    expect(searchStore.q).toBe('bar')
  })

  it('should build a EsDocList object from raw value', () => {
    const raw = {
      hits: {
        hits: [
          { _source: { type: 'Document' }, _id: 'foo' },
          { _source: { type: 'NamedEntity' }, _id: 'bar' }
        ]
      }
    }
    searchStore.setResponse({ raw })
    expect(searchStore.response).toBeInstanceOf(EsDocList)
  })

  it('should build a correct EsDocList object from raw value', () => {
    const raw = {
      hits: {
        hits: [
          { _source: { type: 'Document' }, _id: 'foo' },
          { _source: { type: 'NamedEntity' }, _id: 'bar' }
        ]
      }
    }
    searchStore.setResponse({ raw })
    expect(searchStore.response.hits[0]).toBeInstanceOf(Document)
    expect(searchStore.response.hits[1]).toBeInstanceOf(NamedEntity)
    expect(searchStore.response.hits[2]).toBeUndefined()
  })

  it('should return document from local project', async () => {
    await letData(es).have(new IndexedDocument('document', project).withContent('bar')).commit()
    await searchStore.query('bar')

    expect(searchStore.response.hits).toHaveLength(1)
    expect(searchStore.response.hits[0].basename).toBe('document')
  })

  it('should return document from another project', async () => {
    await letData(es).have(new IndexedDocument('document', anotherProject).withContent('bar')).commit()
    await searchStore.query({ indices: [anotherProject], query: 'bar', from: 0, perPage: 25 })

    expect(searchStore.response.hits).toHaveLength(1)
    expect(searchStore.response.hits[0].basename).toBe('document')
  })

  it('should find 2 documents filtered by one contentType', async () => {
    await letData(es).have(new IndexedDocument('bar.txt', project).withContentType('txt').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('foo.txt', project).withContentType('txt').withContent('foo')).commit()
    await letData(es).have(new IndexedDocument('bar.pdf', project).withContentType('pdf').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('foo.pdf', project).withContentType('pdf').withContent('foo')).commit()

    await searchStore.query('*')
    expect(searchStore.response.hits).toHaveLength(4)
    await searchStore.queryAddFilterValue({ name: 'contentType', value: 'pdf' })
    expect(searchStore.response.hits).toHaveLength(2)
  })

  it('should find 3 documents filtered by two contentType', async () => {
    await letData(es).have(new IndexedDocument('bar.txt', project).withContentType('txt').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.pdf', project).withContentType('pdf').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.csv', project).withContentType('csv').withContent('bar')).commit()

    await searchStore.query('*')
    expect(searchStore.response.hits).toHaveLength(3)
    await searchStore.queryAddFilterValue({ name: 'contentType', value: 'pdf' })
    expect(searchStore.response.hits).toHaveLength(1)
    await searchStore.queryAddFilterValue({ name: 'contentType', value: 'csv' })
    expect(searchStore.response.hits).toHaveLength(2)
  })

  it('should not find documents after filtering by contentType', async () => {
    await letData(es).have(new IndexedDocument('bar.txt', project).withContentType('txt').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.pdf', project).withContentType('pdf').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.csv', project).withContentType('csv').withContent('bar')).commit()

    await searchStore.query('*')
    expect(searchStore.response.hits).toHaveLength(3)
    await searchStore.queryAddFilterValue({ name: 'contentType', value: 'ico' })
    expect(searchStore.response.hits).toHaveLength(0)
  })

  it('should find documents after removing filter by contentType', async () => {
    await letData(es).have(new IndexedDocument('bar.txt', project).withContentType('txt').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.pdf', project).withContentType('pdf').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.csv', project).withContentType('csv').withContent('bar')).commit()

    await searchStore.query('*')
    expect(searchStore.response.hits).toHaveLength(3)
    await searchStore.queryAddFilterValue({ name: 'contentType', value: 'ico' })
    expect(searchStore.response.hits).toHaveLength(0)
    await searchStore.queryRemoveFilterValue({ name: 'contentType', value: 'ico' })
    expect(searchStore.response.hits).toHaveLength(3)
  })

  it('should exclude documents with a specific contentType', async () => {
    await letData(es).have(new IndexedDocument('bar.txt', project).withContentType('txt').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.pdf', project).withContentType('pdf').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.csv', project).withContentType('csv').withContent('bar')).commit()

    await searchStore.query('*')
    expect(searchStore.response.hits).toHaveLength(3)
    await searchStore.queryAddFilterValue({ name: 'contentType', value: 'txt' })
    expect(searchStore.response.hits).toHaveLength(1)
    await searchStore.queryToggleFilter('contentType')
    expect(searchStore.response.hits).toHaveLength(2)
  })

  it('should exclude documents with a specific named entity and include them again', async () => {
    await letData(es).have(new IndexedDocument('bar.txt', project).withContent('bar').withNer('name_01')).commit()
    await letData(es).have(new IndexedDocument('foo.txt', project).withContent('foo').withNer('name_01')).commit()
    await letData(es).have(new IndexedDocument('bar.pdf', project).withContent('bar').withNer('name_01')).commit()
    await letData(es).have(new IndexedDocument('bar.csv', project).withContent('bar').withNer('name_02')).commit()
    await letData(es).have(new IndexedDocument('bar.ico', project).withContent('bar').withNer('name_02')).commit()

    await searchStore.queryAddFilterValue({ name: 'namedEntityPerson', value: 'name_02' })
    expect(searchStore.response.hits).toHaveLength(2)
  })

  it('should filter documents if a named entity is selected', async () => {
    await letData(es).have(new IndexedDocument('bar.txt', project).withContentType('txt').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('foo.txt', project).withContentType('txt').withContent('foo')).commit()
    await letData(es).have(new IndexedDocument('bar.pdf', project).withContentType('pdf').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.csv', project).withContentType('csv').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.ico', project).withContentType('ico').withContent('bar')).commit()

    await searchStore.query('*')
    await searchStore.querySetFilterValue({ name: 'contentType', value: 'txt' })
    await searchStore.queryToggleFilter('contentType')
    expect(searchStore.response.hits).toHaveLength(3)
    await searchStore.queryToggleFilter('contentType')
    expect(searchStore.response.hits).toHaveLength(2)
  })

  describe('hasFilterValue', () => {
    it('this filter should have no values', () => {
      expect(searchStore.hasFilterValue({ name: 'contentType' })).toBeFalsy()
    })

    it('this filter should have value', async () => {
      await searchStore.queryAddFilterValue({ name: 'contentType', value: 'txt' })
      expect(searchStore.hasFilterValue({ name: 'contentType', value: 'txt' })).toBeTruthy()
    })
  })

  it('should take into reverse a filter and not the others', async () => {
    await searchStore.queryAddFilterValue({ name: 'contentType', value: 'txt' })
    await searchStore.queryAddFilterValue({ name: 'language', value: 'fr' })
    await searchStore.queryToggleFilter('contentType')
    expect(searchStore.isFilterExcluded('contentType')).toBeTruthy()
    expect(searchStore.isFilterExcluded('language')).toBeFalsy()
  })

  it('should add filter with several values', async () => {
    await searchStore.queryAddFilterValue({ name: 'contentType', value: ['txt', 'pdf'] })
    expect(searchStore.getFilter({ name: 'contentType' }).values).toHaveLength(2)
  })

  it('should merge filter values with several other values', async () => {
    await searchStore.queryAddFilterValue({ name: 'contentType', value: 'txt' })
    expect(searchStore.getFilter({ name: 'contentType' }).values).toHaveLength(1)
    await searchStore.queryAddFilterValue({ name: 'contentType', value: ['csv', 'pdf'] })
    expect(searchStore.getFilter({ name: 'contentType' }).values).toHaveLength(3)
  })

  it('should add a filter value only once', async () => {
    await searchStore.queryAddFilterValue({ name: 'contentType', value: ['txt', 'csv', 'pdf'] })
    expect(searchStore.getFilter({ name: 'contentType' }).values).toHaveLength(3)
    await searchStore.queryAddFilterValue({ name: 'contentType', value: ['txt', 'pdf'] })
    expect(searchStore.getFilter({ name: 'contentType' }).values).toHaveLength(3)
  })

  it('should add a filter value only once even if numbers', async () => {
    await searchStore.queryAddFilterValue({ name: 'contentType', value: [1, 2, 3] })
    expect(searchStore.getFilter({ name: 'contentType' }).values).toHaveLength(3)
    await searchStore.queryAddFilterValue({ name: 'contentType', value: ['1', '2'] })
    expect(searchStore.getFilter({ name: 'contentType' }).values).toHaveLength(3)
  })

  it('should return 2 documents', async () => {
    await letData(es)
      .have(new IndexedDocuments().setBaseName('doc').withContent('this is a document').withIndex(project).count(4))
      .commit()

    appStore.setSettings({ view: 'search', perPage: 2 })
    await searchStore.query({ query: 'document', from: 0 })
    expect(searchStore.response.hits).toHaveLength(2)
    appStore.setSettings({ view: 'search', perPage: 25 })
  })

  it('should return 3 documents', async () => {
    await letData(es)
      .have(new IndexedDocuments().setBaseName('doc').withContent('this is a document').withIndex(project).count(4))
      .commit()

    appStore.setSettings({ view: 'search', perPage: 3 })
    await searchStore.query({ query: 'document', from: 0 })
    expect(searchStore.response.hits).toHaveLength(3)
  })

  it('should return 1 document (1/3)', async () => {
    await letData(es)
      .have(new IndexedDocuments().setBaseName('doc').withContent('this is a document').withIndex(project).count(4))
      .commit()

    appStore.setSettings({ view: 'search', perPage: 3 })
    await searchStore.query({ query: 'document', from: 3 })
    expect(searchStore.response.hits).toHaveLength(1)
  })

  it('should return 0 documents in total', async () => {
    await searchStore.query('*')
    expect(searchStore.response.total).toBe(0)
  })

  it('should return 5 documents in total', async () => {
    await letData(es)
      .have(new IndexedDocuments().setBaseName('doc').withContent('this is a document').withIndex(project).count(5))
      .commit()

    await searchStore.query({ query: 'document', from: 0, perPage: 2 })
    expect(searchStore.response.total).toBe(5)
    appStore.setSettings({ view: 'search', perPage: 25 })
  })

  it('should return the default query parameters', () => {
    expect(searchStore.toRouteQuery).toMatchObject({
      field: 'all',
      indices: project,
      q: '',
      perPage: '25',
      from: '0'
    })
  })

  it('should return an advanced and filtered query parameters', () => {
    appStore.setSettings({ view: 'search', orderBy: ['randomOrder', 'asc'] })
    appStore.setSettings({ view: 'search', perPage: 12 })

    searchStore.setIndices([project])
    searchStore.setQuery('datashare')
    searchStore.addFilterValue({ name: 'contentType', value: 'TXT' })

    expect(searchStore.toRouteQuery).toMatchObject({
      indices: project,
      q: 'datashare',
      from: '0',
      perPage: '12',
      sort: 'randomOrder',
      'f[contentType]': ['TXT']
    })

    appStore.setSettings({ view: 'search', perPage: 25 })
  })

  it('should reset the values of a filter', async () => {
    await searchStore.queryAddFilterValue({ name: 'contentType', value: ['txt', 'csv'] })
    expect(searchStore.getFilter({ name: 'contentType' }).values).toHaveLength(2)

    searchStore.resetFilterValues('contentType')
    expect(searchStore.getFilter({ name: 'contentType' }).values).toHaveLength(0)
  })

  describe('updateFromRouteQuery should not be cumulated with existing filter', () => {
    it('should set the query to empty after the store is updated with a route query', async () => {
      searchStore.updateFromRouteQuery({ q: 'foo' })
      expect(searchStore.q).toBe('foo')
      searchStore.updateFromRouteQuery({ from: 0 })
      expect(searchStore.q).toBe('')
    })

    it('should set the from to 0 after the store is updated with a route query', async () => {
      searchStore.updateFromRouteQuery({ q: 'foo', from: 10 })
      expect(searchStore.q).toBe('foo')
      expect(searchStore.from).toBe(10)
      searchStore.updateFromRouteQuery({ q: 'bar' })
      expect(searchStore.q).toBe('bar')
      expect(searchStore.from).toBe(0)
    })

    it('should reset the contentType filter after the store is updated with a route query', async () => {
      searchStore.updateFromRouteQuery({ 'f[contentType]': ['application/pdf'] })
      expect(searchStore.getFilter({ name: 'contentType' }).values).toHaveLength(1)
      searchStore.updateFromRouteQuery({ q: 'bar' })
      expect(searchStore.getFilter({ name: 'contentType' }).values).toHaveLength(0)
    })

    it('should not reset the "field" after the store is updated', async () => {
      searchStore.updateFromRouteQuery({ 'f[contentType]': ['application/pdf'], field: 'author' })
      expect(searchStore.getFilter({ name: 'contentType' }).values).toHaveLength(1)
      searchStore.updateFromRouteQuery({ q: 'bar' })
      expect(searchStore.field).toBe('author')
    })

    it('should not empty "index" and "indices" after the store is updated', async () => {
      searchStore.updateFromRouteQuery({ index: 'local', indices: ['local', 'project'] })
      expect(searchStore.index).toBe('local')
      expect(searchStore.indices).toEqual(['local', 'project'])
      searchStore.updateFromRouteQuery({ from: 0 })
      expect(searchStore.index).toBe('local')
      expect(searchStore.indices).toEqual(['local', 'project'])
    })
  })

  describe('updateFromRouteQuery should restore search state from url', () => {
    it('should set the project of the store according to the url', async () => {
      searchStore.setIndex(project)
      searchStore.updateFromRouteQuery({ indices: process.env.VITE_ES_ANOTHER_INDEX })

      expect(searchStore.index).toBe(process.env.VITE_ES_ANOTHER_INDEX)
    })

    it('should set the query of the store according to the url', async () => {
      searchStore.setQuery('anything')
      searchStore.updateFromRouteQuery({ q: 'new_query' })

      expect(searchStore.q).toBe('new_query')
    })

    it('should set the from of the store according to the url', async () => {
      searchStore.setFrom(12)
      searchStore.updateFromRouteQuery({ from: 42 })

      expect(searchStore.from).toBe(42)
    })

    it('should RESET the from of the store according to the url', async () => {
      searchStore.setFrom(12)
      searchStore.updateFromRouteQuery({ from: 0 })

      expect(searchStore.from).toBe(0)
    })

    it('should set the filter of the store according to the url', async () => {
      searchStore.updateFromRouteQuery({ 'f[contentType]': ['new_type'] })
      expect(searchStore.getFilter({ name: 'contentType' }).values[0]).toBe('new_type')
    })

    it('should not change the field on updateFromRouteQuery', async () => {
      searchStore.setField('author')
      searchStore.updateFromRouteQuery({})

      expect(searchStore.field).toBe('author')
    })
  })

  it("should not delete the term from the query if it doesn't exist", async () => {
    searchStore.setQuery('*')
    await searchStore.queryDeleteQueryTerm('term')

    expect(searchStore.q).toBe('*')
  })

  it('should delete the term from the query', async () => {
    searchStore.setQuery('this is a query')
    await searchStore.queryDeleteQueryTerm('is')

    expect(searchStore.q).toEqual('this a query')
  })

  it('should delete all occurrences of the term from the query', async () => {
    searchStore.setQuery('this is is is a query')
    await searchStore.queryDeleteQueryTerm('is')

    expect(searchStore.q).toBe('this a query')
  })

  it('should delete "AND" boolean operator on first applied filter deletion, if any', async () => {
    searchStore.setQuery('term_01 AND term_02')
    await searchStore.queryDeleteQueryTerm('term_01')

    expect(searchStore.q).toBe('term_02')
  })

  it('should delete "OR" boolean operator on first applied filter deletion, if any', async () => {
    searchStore.setQuery('term_01 OR term_02')
    await searchStore.queryDeleteQueryTerm('term_01')

    expect(searchStore.q).toBe('term_02')
  })

  it('should delete "AND" boolean operator on last applied filter deletion, if any', async () => {
    searchStore.setQuery('term_01 AND term_02')
    await searchStore.queryDeleteQueryTerm('term_02')

    expect(searchStore.q).toBe('term_01')
  })

  it('should delete "OR" boolean operator on last applied filter deletion, if any', async () => {
    searchStore.setQuery('term_01 OR term_02')
    await searchStore.queryDeleteQueryTerm('term_02')

    expect(searchStore.q).toBe('term_01')
  })

  describe('retrieveQueryTerm', () => {
    it('should retrieve no applied filters (1/2)', () => {
      searchStore.setQuery('*')

      expect(searchStore.retrieveQueryTerms).toEqual([])
    })

    it('should retrieve no applied filters (2/2)', () => {
      searchStore.setQuery('   ')

      expect(searchStore.retrieveQueryTerms).toEqual([])
    })

    it('should retrieve 1 applied filter', () => {
      searchStore.setQuery('term_01')

      expect(searchStore.retrieveQueryTerms).toEqual([{ field: '', label: 'term_01', negation: false, regex: false }])
    })

    it('should retrieve 2 applied filters', () => {
      searchStore.setQuery('term_01 term_02')

      expect(searchStore.retrieveQueryTerms).toEqual([
        { field: '', label: 'term_01', negation: false, regex: false },
        { field: '', label: 'term_02', negation: false, regex: false }
      ])
    })

    it('should retrieve 3 applied filters', () => {
      searchStore.setQuery('term_01 term_02 term_03')

      expect(searchStore.retrieveQueryTerms).toEqual([
        { field: '', label: 'term_01', negation: false, regex: false },
        { field: '', label: 'term_02', negation: false, regex: false },
        { field: '', label: 'term_03', negation: false, regex: false }
      ])
    })

    it('should merge 2 identical terms', () => {
      searchStore.setQuery('term_01 term_01')

      expect(searchStore.retrieveQueryTerms).toEqual([{ field: '', label: 'term_01', negation: false, regex: false }])
    })

    it('should filter on boolean operators "AND" and "OR"', () => {
      searchStore.setQuery('term_01 AND term_02 OR term_03')

      expect(searchStore.retrieveQueryTerms).toEqual([
        { field: '', label: 'term_01', negation: false, regex: false },
        { field: '', label: 'term_02', negation: false, regex: false },
        { field: '', label: 'term_03', negation: false, regex: false }
      ])
    })

    it('should filter on fuzziness number', () => {
      searchStore.setQuery('term_01~2 term_02')

      expect(searchStore.retrieveQueryTerms).toEqual([
        { field: '', label: 'term_01', negation: false, regex: false },
        { field: '', label: 'term_02', negation: false, regex: false }
      ])
    })

    it('should not split an exact search sentence', () => {
      searchStore.setQuery('term_01 "and an exact term" term_02')

      expect(searchStore.retrieveQueryTerms).toEqual([
        { field: '', label: 'term_01', negation: false, regex: false },
        { field: '', label: 'and an exact term', negation: false, regex: false },
        { field: '', label: 'term_02', negation: false, regex: false }
      ])
    })

    it('should display field name', () => {
      searchStore.setQuery('field_name:term_01')

      expect(searchStore.retrieveQueryTerms).toEqual([
        { field: 'field_name', label: 'term_01', negation: false, regex: false }
      ])
    })

    it('should return a negation parameter according to the prefix', () => {
      searchStore.setQuery('-term_01 +term_02 !term_03')

      expect(searchStore.retrieveQueryTerms).toEqual([
        { field: '', label: 'term_01', negation: true, regex: false },
        { field: '', label: 'term_02', negation: false, regex: false },
        { field: '', label: 'term_03', negation: true, regex: false }
      ])
    })

    it('should return a negation parameter if query starts by "NOT"', () => {
      searchStore.setQuery('NOT term_01')

      expect(searchStore.retrieveQueryTerms).toEqual([{ field: '', label: 'term_01', negation: true, regex: false }])
    })

    it('should return a negation parameter if query contains "AND NOT" or "OR NOT"', () => {
      searchStore.setQuery('term_01 AND NOT term_02 NOT term_03')

      expect(searchStore.retrieveQueryTerms).toEqual([
        { field: '', label: 'term_01', negation: false, regex: false },
        { field: '', label: 'term_02', negation: true, regex: false },
        { field: '', label: 'term_03', negation: true, regex: false }
      ])
    })

    it('should remove escaped slash', () => {
      searchStore.setQuery('term\\:other')

      expect(searchStore.retrieveQueryTerms).toEqual([
        { field: '', label: 'term:other', negation: false, regex: false }
      ])
    })

    it('should grab terms between brackets', () => {
      searchStore.setQuery('term_01 (term_02 AND -term_03) term_04')

      expect(searchStore.retrieveQueryTerms).toEqual([
        { field: '', label: 'term_01', negation: false, regex: false },
        { field: '', label: 'term_02', negation: false, regex: false },
        { field: '', label: 'term_03', negation: true, regex: false },
        { field: '', label: 'term_04', negation: false, regex: false }
      ])
    })

    it('should apply the negation only to the second group', () => {
      searchStore.setQuery('(term_01 term_02) NOT term_03')

      expect(searchStore.retrieveQueryTerms).toEqual([
        { field: '', label: 'term_01', negation: false, regex: false },
        { field: '', label: 'term_02', negation: false, regex: false },
        { field: '', label: 'term_03', negation: true, regex: false }
      ])
    })

    it('should detect regex and return it as true', () => {
      searchStore.setQuery('/test and.*/')

      expect(searchStore.retrieveQueryTerms).toEqual([{ field: '', label: 'test and.*', negation: false, regex: true }])
    })

    it('should replace escaped arobase in regex', () => {
      searchStore.setQuery('/.*\\@.*/')

      expect(searchStore.retrieveQueryTerms).toEqual([{ field: '', label: '.*@.*', negation: false, regex: true }])
    })
  })

  describe('queryDeleteQueryTerm', () => {
    it('should delete 1 simple query term', async () => {
      searchStore.setQuery('term_01')
      await searchStore.queryDeleteQueryTerm('term_01')

      expect(searchStore.q).toBe('')
    })

    it('should delete 1 simple prefixed query term', async () => {
      searchStore.setQuery('-term_01')
      await searchStore.queryDeleteQueryTerm('term_01')

      expect(searchStore.q).toBe('')
    })

    it('should delete 1 simple negative query term', async () => {
      searchStore.setQuery('NOT term_01')
      await searchStore.queryDeleteQueryTerm('term_01')

      expect(searchStore.q).toBe('')
    })

    it('should delete a term from a complex query', async () => {
      searchStore.setQuery('term_01 AND term_02')
      await searchStore.queryDeleteQueryTerm('term_02')

      expect(searchStore.q).toBe('term_01')
    })

    it('should delete a negative term from a complex query', async () => {
      searchStore.setQuery('term_01 AND NOT term_02')
      await searchStore.queryDeleteQueryTerm('term_02')

      expect(searchStore.q).toBe('term_01')
    })

    it('should delete a term from a recursive query', async () => {
      searchStore.setQuery('term_01 term_02 term_03')
      await searchStore.queryDeleteQueryTerm('term_03')

      expect(searchStore.q).toBe('term_01 term_02')
    })

    it('should delete a negative term from a recursive query', async () => {
      searchStore.setQuery('term_01 AND NOT term_02 term_03')
      await searchStore.queryDeleteQueryTerm('term_02')

      expect(searchStore.q).toBe('term_01 term_03')
    })

    it('should delete duplicated term from a query', async () => {
      searchStore.setQuery('term_01 term_02 term_01')
      await searchStore.queryDeleteQueryTerm('term_01')

      expect(searchStore.q).toBe('term_02')
    })

    it('should delete term from a query with parenthesis', async () => {
      searchStore.setQuery('term_01 (term_02 AND term_03) term_04')
      await searchStore.queryDeleteQueryTerm('term_02')

      expect(searchStore.q).toBe('term_01 term_03 term_04')
    })
  })

  it('should find document on querying the NamedEntity', async () => {
    const document = new IndexedDocument('doc_01', project)
    document.withNer('test')
    document.withContent('this is the doc_01 and a mention of "test"')
    await letData(es).have(document).commit()

    await searchStore.query('test')

    expect(searchStore.response.hits).toHaveLength(1)
    expect(searchStore.response.hits[0].basename).toBe('doc_01')
  })

  it('should not find document on querying the NamedEntity if it isnt in its content', async () => {
    const document = new IndexedDocument('doc_01', project)
    document.withNer('test')
    document.withContent('this is the doc_01 and no mention of the Named-Entity-Who-Must-Not-Be-Named')
    await letData(es).have(document).commit()

    await searchStore.query('test')

    expect(searchStore.response.hits).toHaveLength(0)
  })

  it('should find document on querying the NamedEntity with a complex query', async () => {
    await letData(es)
      .have(new IndexedDocument('doc_01', project).withContent('test of ner_01').withNer('ner_01'))
      .commit()
    await letData(es)
      .have(new IndexedDocument('doc_02', project).withContent('test of ner_02').withNer('ner_02'))
      .commit()
    await letData(es).have(new IndexedDocument('doc_03', project).withContent('no content').withNer('test')).commit()

    await searchStore.query('(test AND ner_*) OR test')

    expect(searchStore.response.hits).toHaveLength(2)
    expect(searchStore.response.hits[0].basename).toBe('doc_01')
    expect(searchStore.response.hits[1].basename).toBe('doc_02')
  })

  it('should set this value to the filter', () => {
    const name = 'creationDate'
    searchStore.setFilterValue({ name, value: '12' })
    expect(find(searchStore.instantiatedFilters, { name }).values).toEqual(['12'])

    searchStore.setFilterValue({ name, value: '42' })
    expect(find(searchStore.instantiatedFilters, { name }).values).toEqual(['42'])
  })

  it('should order documents by path', async () => {
    await letData(es).have(new IndexedDocument('c', project)).commit()
    await letData(es).have(new IndexedDocument('b', project)).commit()
    await letData(es).have(new IndexedDocument('a', project)).commit()

    await searchStore.query('*')

    expect(searchStore.response.hits).toHaveLength(3)
    expect(searchStore.response.hits[0].shortId).toBe('a')
    expect(searchStore.response.hits[1].shortId).toBe('b')
    expect(searchStore.response.hits[2].shortId).toBe('c')
  })

  describe('sortFilters with language filter', () => {
    beforeEach(() => {
      searchStore.reset()
    })

    it('this filter should have no sortFilters', () => {
      expect(Object.keys(searchStore.sortFilters).length).toBe(0)
    })

    it('this filter should have one sorted filter', () => {
      searchStore.sortFilter({ name: 'language', sortBy: '_key', orderBy: 'asc' })
      expect(Object.keys(searchStore.sortFilters).length).toBe(1)
    })

    it('this filter should sort language by _count', () => {
      searchStore.sortFilter({ name: 'language', sortBy: '_count', orderBy: 'asc' })
      expect(searchStore.filterSortedBy('language')).toBe('_count')
      expect(searchStore.filterSortedByOrder('language')).toBe('asc')
    })

    it('this filter should sort language by _count once', () => {
      searchStore.sortFilter({ name: 'language', sortBy: '_key', orderBy: 'desc' })
      searchStore.sortFilter({ name: 'language', sortBy: '_count', orderBy: 'asc' })
      expect(searchStore.filterSortedBy('language')).toBe('_count')
      expect(searchStore.filterSortedByOrder('language')).toBe('asc')
      expect(Object.keys(searchStore.sortFilters).length).toBe(1)
    })

    it('this filter should not sort language anymore', () => {
      searchStore.sortFilter({ name: 'language', sortBy: '_key', orderBy: 'desc' })
      expect(Object.keys(searchStore.sortFilters).length).toBe(1)
      searchStore.unsortFilter('language')
      expect(Object.keys(searchStore.sortFilters).length).toBe(0)
    })

    it('this filter should have a default sort for language', () => {
      expect(Object.keys(searchStore.sortFilters).length).toBe(0)
      expect(searchStore.filterSortedBy('language')).not.toBeUndefined()
      expect(searchStore.filterSortedByOrder('language')).not.toBeUndefined()
    })
  })
})
