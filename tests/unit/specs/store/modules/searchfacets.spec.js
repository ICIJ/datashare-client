import cloneDeep from 'lodash/cloneDeep'
import toLower from 'lodash/toLower'
import Murmur from '@icij/murmur'

import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import store from '@/store'

describe('SearchFilters', () => {
  const index = toLower('SearchFilters')
  esConnectionHelper(index)
  const es = esConnectionHelper.es

  beforeAll(() => store.commit('search/index', index))

  afterEach(() => store.commit('search/reset'))

  describe('Common filter', () => {
    it('should reset the store state', async () => {
      const initialFilters = cloneDeep(store.state.search.filters)
      store.commit('search/removeFilter', 'contentType')
      expect(store.state.search.filters).toHaveLength(initialFilters.length - 1)
      store.commit('search/removeFilter', 'language')
      expect(store.state.search.filters).toHaveLength(initialFilters.length - 2)
      store.commit('search/resetFiltersAndValues')
      expect(store.state.search.filters).toHaveLength(initialFilters.length)
    })

    it('should define a "language" filter correctly (name, key and type)', () => {
      const filter = store.getters['search/getFilterByName']('language')

      expect(typeof filter).toBe('object')
      expect(filter.key).toBe('language')
      expect(filter.constructor.name).toBe('FilterLanguage')
    })

    it('should not find a "yolo-type" filter', () => {
      expect(store.getters['search/getFilter']({ name: 'yo-type' })).toBeUndefined()
    })

    it('should add a filter', () => {
      const length = store.getters['search/instantiatedFilters'].length
      store.commit('search/addFilter', { type: 'FilterText', options: ['test', 'key', true, null] })
      expect(store.getters['search/instantiatedFilters']).toHaveLength(length + 1)
    })
  })

  describe('Content type filter', () => {
    it('should define a "contentType" filter correctly (name, key and type)', () => {
      const filter = store.getters['search/getFilterByName']('contentType')

      expect(typeof filter).toBe('object')
      expect(filter.key).toBe('contentType')
      expect(filter.constructor.name).toBe('FilterContentType')
    })

    it('should find a "contentType" filter using object', () => {
      expect(store.getters['search/getFilter']({ name: 'contentType' })).not.toBeUndefined()
    })

    it('should find a "contentType" filter using function', () => {
      expect(store.getters['search/getFilter'](f => f.name === 'contentType')).not.toBeUndefined()
    })

    it('should count 2 documents of type "type_01"', async () => {
      await letData(es).have(new IndexedDocument('document_01', index).withContentType('type_01')).commit()
      await letData(es).have(new IndexedDocument('document_02', index).withContentType('type_01')).commit()

      const response = await store.dispatch('search/queryFilter', { name: 'contentType' })

      expect(response.aggregations.contentType.buckets).toHaveLength(1)
      expect(response.aggregations.contentType.buckets[0].doc_count).toBe(2)
    })

    it('should use contentType (without charset)', async () => {
      await letData(es).have(new IndexedDocument('document', index).withContentType('text/plain; charset=UTF-8')).commit()

      const response = await store.dispatch('search/queryFilter', { name: 'contentType' })

      expect(response.aggregations.contentType.buckets[0].key).toBe('text/plain')
    })

    it('should count 2 documents of "type_01" and 1 document of "type_02"', async () => {
      await letData(es).have(new IndexedDocument('document_01', index).withContentType('type_01')).commit()
      await letData(es).have(new IndexedDocument('document_02', index).withContentType('type_01')).commit()
      await letData(es).have(new IndexedDocument('document_03', index).withContentType('type_02')).commit()

      const response = await store.dispatch('search/queryFilter', { name: 'contentType' })

      expect(response.aggregations.contentType.buckets).toHaveLength(2)
      expect(response.aggregations.contentType.buckets[0].doc_count).toBe(2)
      expect(response.aggregations.contentType.buckets[1].doc_count).toBe(1)
    })

    it('should count 2 pdf but have no hits', async () => {
      await letData(es).have(new IndexedDocument('document_01', index).withContentType('application/pdf')).commit()
      await letData(es).have(new IndexedDocument('document_02', index).withContentType('application/pdf')).commit()

      const response = await store.dispatch('search/queryFilter', { name: 'contentType' })

      expect(response.aggregations.contentType.buckets[0].doc_count).toBe(2)
      expect(response.hits).toHaveLength(0)
    })

    it('should create 3 buckets from 3 documents', async () => {
      await letData(es).have(new IndexedDocument('Api.js', index).withContentType('text/javascript')).commit()
      await letData(es).have(new IndexedDocument('index.html', index).withContentType('text/html')).commit()
      await letData(es).have(new IndexedDocument('index.css', index).withContentType('text/css')).commit()

      const response = await store.dispatch('search/queryFilter', { name: 'contentType' })

      expect(response.aggregations.contentType.buckets).toHaveLength(3)
    })

    it('should create 3 buckets from 7 documents', async () => {
      await letData(es).have(new IndexedDocument('Api.js', index).withContentType('text/javascript')).commit()
      await letData(es).have(new IndexedDocument('list.js', index).withContentType('text/javascript')).commit()
      await letData(es).have(new IndexedDocument('show.js', index).withContentType('text/javascript')).commit()
      await letData(es).have(new IndexedDocument('index.html', index).withContentType('text/html')).commit()
      await letData(es).have(new IndexedDocument('list.html', index).withContentType('text/html')).commit()
      await letData(es).have(new IndexedDocument('index.css', index).withContentType('text/css')).commit()
      await letData(es).have(new IndexedDocument('list.css', index).withContentType('text/css')).commit()

      const response = await store.dispatch('search/queryFilter', { name: 'contentType' })

      expect(response.aggregations.contentType.buckets).toHaveLength(3)
    })
  })

  describe('Path filter', () => {
    it('should define a `path` filter correctly (name, key and type)', () => {
      const filter = store.getters['search/getFilterByName']('path')

      expect(typeof filter).toBe('object')
      expect(filter.key).toBe('byDirname')
      expect(filter.constructor.name).toBe('FilterPath')
    })

    it('should get no bucket for path aggregation', async () => {
      Murmur.config.set('dataDir', '/home/user/data')

      const response = await store.dispatch('search/queryFilter', { name: 'path' })

      expect(response.aggregations.byDirname.buckets).toHaveLength(0)
    })

    it('should return 1 bucket, the correct first level path and the correct number of results', async () => {
      Murmur.config.set('dataDir', '/home/user/data')
      await letData(es).have(new IndexedDocument('/home/user/data/is/a/path/test.doc', index)).commit()

      const response = await store.dispatch('search/queryFilter', { name: 'path' })

      expect(response.aggregations.byDirname.buckets).toHaveLength(1)
      expect(response.aggregations.byDirname.buckets[0].key).toBe('/home/user/data/is')
      expect(response.aggregations.byDirname.buckets[0].doc_count).toBe(1)
    })

    it('should return 2 buckets, the correct path and the correct number of results', async () => {
      Murmur.config.set('dataDir', '/home/user/data')
      await letData(es).have(new IndexedDocument('/home/user/data/is/a/path/test.doc', index)).commit()
      await letData(es).have(new IndexedDocument('/home/user/data/is/a/second/path/test.doc', index)).commit()
      await letData(es).have(new IndexedDocument('/home/user/data/was/a/third/path/test.doc', index)).commit()

      const response = await store.dispatch('search/queryFilter', { name: 'path' })

      expect(response.aggregations.byDirname.buckets).toHaveLength(2)
      expect(response.aggregations.byDirname.buckets[0].key).toBe('/home/user/data/is')
      expect(response.aggregations.byDirname.buckets[0].doc_count).toBe(2)
      expect(response.aggregations.byDirname.buckets[1].key).toBe('/home/user/data/was')
      expect(response.aggregations.byDirname.buckets[1].doc_count).toBe(1)
    })
  })

  describe('Indexing date filter', () => {
    const name = 'indexingDate'

    it('should define an `indexing date` filter correctly (name, key and type)', () => {
      const filter = store.getters['search/getFilterByName'](name)

      expect(typeof filter).toBe('object')
      expect(filter.key).toBe('extractionDate')
      expect(filter.constructor.name).toBe('FilterDate')
    })

    it('should return the indexing date buckets', async () => {
      await letData(es).have(new IndexedDocument('doc_01.txt', index).withIndexingDate('2018-04-04T20:20:20.001Z')).commit()
      await letData(es).have(new IndexedDocument('doc_02.txt', index).withIndexingDate('2018-04-06T20:20:20.001Z')).commit()
      await letData(es).have(new IndexedDocument('doc_03.txt', index).withIndexingDate('2018-05-04T20:20:20.001Z')).commit()

      const response = await store.dispatch('search/queryFilter', { name, options: { size: 8 } })

      expect(response.aggregations.extractionDate.buckets).toHaveLength(2)
      expect(response.aggregations.extractionDate.buckets[0].key).toBe(1525132800000)
      expect(response.aggregations.extractionDate.buckets[0].doc_count).toBe(1)
      expect(response.aggregations.extractionDate.buckets[1].key).toBe(1522540800000)
      expect(response.aggregations.extractionDate.buckets[1].doc_count).toBe(2)
    })
  })

  describe('Named entities filter', () => {
    it('should define a `named-entity` filter correctly (name, key, type and PERSON category)', () => {
      const filter = store.getters['search/getFilterByName']('namedEntityPerson')

      expect(typeof filter).toBe('object')
      expect(filter.key).toBe('byMentions')
      expect(filter.category).toBe('PERSON')
      expect(filter.constructor.name).toBe('FilterNamedEntity')
    })

    it('should aggregate only the not hidden named entities for PERSON category', async () => {
      await letData(es).have(new IndexedDocument('doc_01.csv', index).withNer('entity_01', 42, 'PERSON', false)).commit()
      await letData(es).have(new IndexedDocument('doc_02.csv', index).withNer('entity_01', 43, 'PERSON', false)).commit()
      await letData(es).have(new IndexedDocument('doc_03.csv', index).withNer('entity_02', 44, 'PERSON', true)).commit()
      await letData(es).have(new IndexedDocument('doc_04.csv', index).withNer('entity_03', 45, 'PERSON', false)).commit()

      const response = await store.dispatch('search/queryFilter', { name: 'namedEntityPerson' })

      expect(response.aggregations.byMentions.buckets).toHaveLength(2)
      expect(response.aggregations.byMentions.buckets[0].key).toBe('entity_01')
      expect(response.aggregations.byMentions.buckets[0].doc_count).toBe(2)
      expect(response.aggregations.byMentions.buckets[1].key).toBe('entity_03')
      expect(response.aggregations.byMentions.buckets[1].doc_count).toBe(1)
    })

    it('should aggregate named entities for LOCATION category', async () => {
      await letData(es).have(new IndexedDocument('doc_01.csv', index).withNer('entity_01', 42, 'LOCATION', false)).commit()
      await letData(es).have(new IndexedDocument('doc_02.csv', index).withNer('entity_02', 43, 'LOCATION', false)).commit()
      await letData(es).have(new IndexedDocument('doc_03.csv', index).withNer('entity_03', 44, 'ORGANIZATION', true)).commit()

      const response = await store.dispatch('search/queryFilter', { name: 'namedEntityLocation', category: 'LOCATION' })

      expect(response.aggregations.byMentions.buckets).toHaveLength(2)
    })

    it('should aggregate named entities for ORGANIZATION category', async () => {
      await letData(es).have(new IndexedDocument('doc_01.csv', index).withNer('entity_01', 42, 'ORGANIZATION', false)).commit()
      await letData(es).have(new IndexedDocument('doc_02.csv', index).withNer('entity_02', 43, 'ORGANIZATION', false)).commit()
      await letData(es).have(new IndexedDocument('doc_03.csv', index).withNer('entity_03', 44, 'PERSON', true)).commit()

      const response = await store.dispatch('search/queryFilter', { name: 'namedEntityOrganization', category: 'ORGANIZATION' })

      expect(response.aggregations.byMentions.buckets).toHaveLength(2)
    })
  })

  describe('Creation date filter', () => {
    const name = 'creationDate'

    it('should merge all missing data', async () => {
      await letData(es).have(new IndexedDocument('doc_01', index)
        .withCreationDate('2018-04-01T00:00:00.001Z')).commit()
      await letData(es).have(new IndexedDocument('doc_02', index)
        .withCreationDate('2018-05-01T00:00:00.001Z')).commit()
      await letData(es).have(new IndexedDocument('doc_03', index)).commit()
      await letData(es).have(new IndexedDocument('doc_04', index)).commit()

      const response = await store.dispatch('search/queryFilter', { name, options: { size: 8 } })

      expect(response.aggregations['metadata.tika_metadata_creation_date'].buckets).toHaveLength(3)
      expect(response.aggregations['metadata.tika_metadata_creation_date'].buckets[0].key).toBe(1525132800000)
      expect(response.aggregations['metadata.tika_metadata_creation_date'].buckets[0].doc_count).toBe(1)
      expect(response.aggregations['metadata.tika_metadata_creation_date'].buckets[1].key).toBe(1522540800000)
      expect(response.aggregations['metadata.tika_metadata_creation_date'].buckets[1].doc_count).toBe(1)
      expect(response.aggregations['metadata.tika_metadata_creation_date'].buckets[2].key).toBe(-62167219200000)
      expect(response.aggregations['metadata.tika_metadata_creation_date'].buckets[2].doc_count).toBe(2)
    })

    it('should count only Document types and not the NamedEntities', async () => {
      await letData(es).have(new IndexedDocument('doc_01', index)
        .withCreationDate('2018-04-01T00:00:00.001Z').withNer('term_01')).commit()

      const response = await store.dispatch('search/queryFilter', { name, options: { size: 8 } })

      expect(response.aggregations['metadata.tika_metadata_creation_date'].buckets).toHaveLength(1)
    })
  })

  describe('Starred filter', () => {
    it('should define a `starred` filter correctly (name, key, type and starredDocuments)', () => {
      const filter = store.getters['search/getFilterByName']('starred')

      expect(typeof filter).toBe('object')
      expect(filter.key).toBe('_id')
      expect(filter.constructor.name).toBe('FilterStarred')
      expect(filter.starredDocuments).toEqual([])
    })
  })
})
