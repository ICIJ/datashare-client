import { cloneDeep } from 'lodash'

import store from '@/store'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'

describe('SearchFilters', () => {
  const { index: project, es } = esConnectionHelper.build()

  beforeAll(() => store.commit('search/index', project))

  afterEach(() => store.commit('search/reset'))

  describe('Common filter', () => {
    it('should reset the store state', () => {
      const initialFilters = cloneDeep(store.state.search.filters)
      store.commit('search/removeFilter', 'contentType')
      expect(store.state.search.filters).toHaveLength(initialFilters.length - 1)
      store.commit('search/removeFilter', 'language')
      expect(store.state.search.filters).toHaveLength(initialFilters.length - 2)
      store.commit('search/resetFiltersAndValues')
      expect(store.state.search.filters).toHaveLength(initialFilters.length)
    })

    it('should define a "language" filter correctly (name, key and type)', () => {
      const filter = store.getters['search/getFilter']({ name: 'language' })

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
      const filter = store.getters['search/getFilter']({ name: 'contentType' })

      expect(typeof filter).toBe('object')
      expect(filter.key).toBe('contentType')
      expect(filter.constructor.name).toBe('FilterContentType')
    })

    it('should find a "contentType" filter using object', () => {
      expect(store.getters['search/getFilter']({ name: 'contentType' })).toBeDefined()
    })

    it('should find a "contentType" filter using function', () => {
      expect(store.getters['search/getFilter'](f => f.name === 'contentType')).toBeDefined()
    })

    it('should count 2 documents of type "type_01"', async () => {
      await letData(es).have(new IndexedDocument('document_01', project).withContentType('type_01')).commit()
      await letData(es).have(new IndexedDocument('document_02', project).withContentType('type_01')).commit()

      const response = await store.dispatch('search/queryFilter', { name: 'contentType' })

      expect(response.aggregations.contentType.buckets).toHaveLength(1)
      expect(response.aggregations.contentType.buckets[0].doc_count).toBe(2)
    })

    it('should use contentType (without charset)', async () => {
      await letData(es).have(new IndexedDocument('document', project).withContentType('text/plain; charset=UTF-8')).commit()

      const response = await store.dispatch('search/queryFilter', { name: 'contentType' })

      expect(response.aggregations.contentType.buckets[0].key).toBe('text/plain')
    })

    it('should count 2 documents of "type_01" and 1 document of "type_02"', async () => {
      await letData(es).have(new IndexedDocument('document_01', project).withContentType('type_01')).commit()
      await letData(es).have(new IndexedDocument('document_02', project).withContentType('type_01')).commit()
      await letData(es).have(new IndexedDocument('document_03', project).withContentType('type_02')).commit()

      const response = await store.dispatch('search/queryFilter', { name: 'contentType' })

      expect(response.aggregations.contentType.buckets).toHaveLength(2)
      expect(response.aggregations.contentType.buckets[0].doc_count).toBe(2)
      expect(response.aggregations.contentType.buckets[1].doc_count).toBe(1)
    })

    it('should count 2 pdf but have no hits', async () => {
      await letData(es).have(new IndexedDocument('document_01', project).withContentType('application/pdf')).commit()
      await letData(es).have(new IndexedDocument('document_02', project).withContentType('application/pdf')).commit()

      const response = await store.dispatch('search/queryFilter', { name: 'contentType' })

      expect(response.aggregations.contentType.buckets[0].doc_count).toBe(2)
      expect(response.hits).toHaveLength(0)
    })

    it('should create 3 buckets from 3 documents', async () => {
      await letData(es).have(new IndexedDocument('Api.js', project).withContentType('text/javascript')).commit()
      await letData(es).have(new IndexedDocument('index.html', project).withContentType('text/html')).commit()
      await letData(es).have(new IndexedDocument('index.css', project).withContentType('text/css')).commit()

      const response = await store.dispatch('search/queryFilter', { name: 'contentType' })

      expect(response.aggregations.contentType.buckets).toHaveLength(3)
    })

    it('should create 3 buckets from 7 documents', async () => {
      await letData(es).have(new IndexedDocument('Api.js', project).withContentType('text/javascript')).commit()
      await letData(es).have(new IndexedDocument('list.js', project).withContentType('text/javascript')).commit()
      await letData(es).have(new IndexedDocument('show.js', project).withContentType('text/javascript')).commit()
      await letData(es).have(new IndexedDocument('index.html', project).withContentType('text/html')).commit()
      await letData(es).have(new IndexedDocument('list.html', project).withContentType('text/html')).commit()
      await letData(es).have(new IndexedDocument('index.css', project).withContentType('text/css')).commit()
      await letData(es).have(new IndexedDocument('list.css', project).withContentType('text/css')).commit()

      const response = await store.dispatch('search/queryFilter', { name: 'contentType' })

      expect(response.aggregations.contentType.buckets).toHaveLength(3)
    })
  })

  describe('Path filter', () => {
    it('should define a `path` filter correctly (name, key and type)', () => {
      const filter = store.getters['search/getFilter']({ name: 'path' })

      expect(typeof filter).toBe('object')
      expect(filter.key).toBe('byDirname')
      expect(filter.constructor.name).toBe('FilterPath')
    })
  })

  describe('Indexing date filter', () => {
    const name = 'indexingDate'

    it('should define an `indexing date` filter correctly (name, key and type)', () => {
      const filter = store.getters['search/getFilter']({ name })

      expect(typeof filter).toBe('object')
      expect(filter.key).toBe('extractionDate')
      expect(filter.constructor.name).toBe('FilterDate')
    })

    it('should return the indexing date buckets', async () => {
      await letData(es).have(new IndexedDocument('doc_01.txt', project).withIndexingDate('2018-04-04T20:20:20.001Z')).commit()
      await letData(es).have(new IndexedDocument('doc_02.txt', project).withIndexingDate('2018-04-06T20:20:20.001Z')).commit()
      await letData(es).have(new IndexedDocument('doc_03.txt', project).withIndexingDate('2018-05-04T20:20:20.001Z')).commit()

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
      const filter = store.getters['search/getFilter']({ name: 'namedEntityPerson' })

      expect(typeof filter).toBe('object')
      expect(filter.key).toBe('byMentions')
      expect(filter.category).toBe('PERSON')
      expect(filter.constructor.name).toBe('FilterNamedEntity')
    })

    it('should aggregate only the not hidden named entities for PERSON category', async () => {
      await letData(es).have(new IndexedDocument('doc_01.csv', project).withNer('entity_01', 42, 'PERSON', false)).commit()
      await letData(es).have(new IndexedDocument('doc_02.csv', project).withNer('entity_01', 43, 'PERSON', false)).commit()
      await letData(es).have(new IndexedDocument('doc_03.csv', project).withNer('entity_02', 44, 'PERSON', true)).commit()
      await letData(es).have(new IndexedDocument('doc_04.csv', project).withNer('entity_03', 45, 'PERSON', false)).commit()

      const response = await store.dispatch('search/queryFilter', { name: 'namedEntityPerson' })

      expect(response.aggregations.byMentions.buckets).toHaveLength(2)
      expect(response.aggregations.byMentions.buckets[0].key).toBe('entity_01')
      expect(response.aggregations.byMentions.buckets[0].doc_count).toBe(2)
      expect(response.aggregations.byMentions.buckets[1].key).toBe('entity_03')
      expect(response.aggregations.byMentions.buckets[1].doc_count).toBe(1)
    })

    it('should aggregate named entities for LOCATION category', async () => {
      await letData(es).have(new IndexedDocument('doc_01.csv', project).withNer('entity_01', 42, 'LOCATION', false)).commit()
      await letData(es).have(new IndexedDocument('doc_02.csv', project).withNer('entity_02', 43, 'LOCATION', false)).commit()
      await letData(es).have(new IndexedDocument('doc_03.csv', project).withNer('entity_03', 44, 'ORGANIZATION', true)).commit()

      const response = await store.dispatch('search/queryFilter', { name: 'namedEntityLocation', category: 'LOCATION' })

      expect(response.aggregations.byMentions.buckets).toHaveLength(2)
    })

    it('should aggregate named entities for ORGANIZATION category', async () => {
      await letData(es).have(new IndexedDocument('doc_01.csv', project).withNer('entity_01', 42, 'ORGANIZATION', false)).commit()
      await letData(es).have(new IndexedDocument('doc_02.csv', project).withNer('entity_02', 43, 'ORGANIZATION', false)).commit()
      await letData(es).have(new IndexedDocument('doc_03.csv', project).withNer('entity_03', 44, 'PERSON', true)).commit()

      const response = await store.dispatch('search/queryFilter', { name: 'namedEntityOrganization', category: 'ORGANIZATION' })

      expect(response.aggregations.byMentions.buckets).toHaveLength(2)
    })
  })

  describe('Creation date filter', () => {
    const name = 'creationDate'

    it('should merge all missing data', async () => {
      await letData(es).have(new IndexedDocument('doc_01', project)
        .withCreationDate('2018-04-01T00:00:00.001Z')).commit()
      await letData(es).have(new IndexedDocument('doc_02', project)
        .withCreationDate('2018-05-01T00:00:00.001Z')).commit()
      await letData(es).have(new IndexedDocument('doc_03', project)).commit()
      await letData(es).have(new IndexedDocument('doc_04', project)).commit()

      const response = await store.dispatch('search/queryFilter', { name, options: { size: 8 } })

      expect(response.aggregations['metadata.tika_metadata_creation_date'].buckets).toHaveLength(3)
      expect(response.aggregations['metadata.tika_metadata_creation_date'].buckets[0].key).toBe(1525132800000)
      expect(response.aggregations['metadata.tika_metadata_creation_date'].buckets[0].doc_count).toBe(1)
      expect(response.aggregations['metadata.tika_metadata_creation_date'].buckets[1].key).toBe(1522540800000)
      expect(response.aggregations['metadata.tika_metadata_creation_date'].buckets[1].doc_count).toBe(1)
      expect(response.aggregations['metadata.tika_metadata_creation_date'].buckets[2].key).toBe(-62135596800000)
      expect(response.aggregations['metadata.tika_metadata_creation_date'].buckets[2].doc_count).toBe(2)
    })

    it('should count only Document types and not the NamedEntities', async () => {
      await letData(es).have(new IndexedDocument('doc_01', project)
        .withCreationDate('2018-04-01T00:00:00.001Z').withNer('term_01')).commit()

      const response = await store.dispatch('search/queryFilter', { name, options: { size: 8 } })

      expect(response.aggregations['metadata.tika_metadata_creation_date'].buckets).toHaveLength(1)
    })
  })

  describe('Starred filter', () => {
    it('should define a `starred` filter correctly (name, key, type and starredDocuments)', () => {
      const filter = store.getters['search/getFilter']({ name: 'starred' })

      expect(typeof filter).toBe('object')
      expect(filter.key).toBe('_id')
      expect(filter.constructor.name).toBe('FilterStarred')
      expect(filter.starredDocuments).toEqual([])
    })
  })
})
