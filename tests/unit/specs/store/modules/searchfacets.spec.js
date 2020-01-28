import cloneDeep from 'lodash/cloneDeep'
import each from 'lodash/each'
import find from 'lodash/find'
import functionsIn from 'lodash/functionsIn'
import omit from 'lodash/omit'
import toLower from 'lodash/toLower'
import Murmur from '@icij/murmur'

import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import { FacetText } from '@/store/facetsStore'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import store from '@/store'

describe('SearchFacets', () => {
  const index = toLower('SearchFacets')
  esConnectionHelper(index)
  const es = esConnectionHelper.es

  beforeAll(() => store.commit('search/index', index))

  afterEach(() => store.commit('search/reset'))

  describe('Common facet', () => {
    it('should reset the store state', async () => {
      const initialState = cloneDeep(store.state.search)
      await store.commit('search/reset')

      // Should filter the functions because these would never be equal
      // So only compare integers, strings, arrays ...
      initialState.facets = each(initialState.facets, (value, key) => {
        initialState.facets[key] = omit(value, functionsIn(value))
      })

      store.commit('search/setFacets', each(store.state.search.facets, (value, key) => {
        store.state.search.facets[key] = omit(value, functionsIn(value))
      }))

      expect(store.state.search).toEqual(initialState)
    })

    it('should define a "language" facet correctly (name, key and type)', () => {
      const facet = find(store.state.search.facets, { name: 'language' })

      expect(typeof facet).toBe('object')
      expect(facet.key).toBe('language')
      expect(facet.constructor.name).toBe('FacetText')
    })

    it('should not find a "yolo-type" facet', () => {
      expect(store.getters['search/getFacet']({ name: 'yo-type' })).toBeUndefined()
    })

    it('should add a facet', () => {
      const length = store.state.search.facets.length
      store.commit('search/addFacet', new FacetText('test', 'key', true, null))

      expect(store.state.search.facets).toHaveLength(length + 1)
    })
  })

  describe('Content type facet', () => {
    it('should define a "contentType" facet correctly (name, key and type)', () => {
      const facet = find(store.state.search.facets, { name: 'contentType' })

      expect(typeof facet).toBe('object')
      expect(facet.key).toBe('contentType')
      expect(facet.constructor.name).toBe('FacetText')
    })

    it('should find a "contentType" facet using object', () => {
      expect(store.getters['search/getFacet']({ name: 'contentType' })).not.toBeUndefined()
    })

    it('should find a "contentType" facet using function', () => {
      expect(store.getters['search/getFacet'](f => f.name === 'contentType')).not.toBeUndefined()
    })

    it('should count 2 documents of type "type_01"', async () => {
      await letData(es).have(new IndexedDocument('document_01', index).withContentType('type_01')).commit()
      await letData(es).have(new IndexedDocument('document_02', index).withContentType('type_01')).commit()

      const response = await store.dispatch('search/queryFacet', { name: 'contentType' })

      expect(response.aggregations.contentType.buckets).toHaveLength(1)
      expect(response.aggregations.contentType.buckets[0].doc_count).toBe(2)
    })

    it('should use contentType (without charset)', async () => {
      await letData(es).have(new IndexedDocument('document', index).withContentType('text/plain; charset=UTF-8')).commit()

      const response = await store.dispatch('search/queryFacet', { name: 'contentType' })

      expect(response.aggregations.contentType.buckets[0].key).toBe('text/plain')
    })

    it('should count 2 documents of "type_01" and 1 document of "type_02"', async () => {
      await letData(es).have(new IndexedDocument('document_01', index).withContentType('type_01')).commit()
      await letData(es).have(new IndexedDocument('document_02', index).withContentType('type_01')).commit()
      await letData(es).have(new IndexedDocument('document_03', index).withContentType('type_02')).commit()

      const response = await store.dispatch('search/queryFacet', { name: 'contentType' })

      expect(response.aggregations.contentType.buckets).toHaveLength(2)
      expect(response.aggregations.contentType.buckets[0].doc_count).toBe(2)
      expect(response.aggregations.contentType.buckets[1].doc_count).toBe(1)
    })

    it('should count 2 pdf but have no hits', async () => {
      await letData(es).have(new IndexedDocument('document_01', index).withContentType('application/pdf')).commit()
      await letData(es).have(new IndexedDocument('document_02', index).withContentType('application/pdf')).commit()

      const response = await store.dispatch('search/queryFacet', { name: 'contentType' })

      expect(response.aggregations.contentType.buckets[0].doc_count).toBe(2)
      expect(response.hits).toHaveLength(0)
    })

    it('should create 3 buckets from 3 documents', async () => {
      await letData(es).have(new IndexedDocument('Api.js', index).withContentType('text/javascript')).commit()
      await letData(es).have(new IndexedDocument('index.html', index).withContentType('text/html')).commit()
      await letData(es).have(new IndexedDocument('index.css', index).withContentType('text/css')).commit()

      const response = await store.dispatch('search/queryFacet', { name: 'contentType' })

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

      const response = await store.dispatch('search/queryFacet', { name: 'contentType' })

      expect(response.aggregations.contentType.buckets).toHaveLength(3)
    })
  })

  describe('Path facet', () => {
    it('should define a `path` facet correctly (name, key and type)', () => {
      const facet = find(store.state.search.facets, { name: 'path' })

      expect(typeof facet).toBe('object')
      expect(facet.key).toBe('byDirname')
      expect(facet.constructor.name).toBe('FacetPath')
    })

    it('should get no bucket for path aggregation', async () => {
      Murmur.config.set('dataDir', '/home/user/data')

      const response = await store.dispatch('search/queryFacet', { name: 'path' })

      expect(response.aggregations.byDirname.buckets).toHaveLength(0)
    })

    it('should return 1 bucket, the correct first level path and the correct number of results', async () => {
      Murmur.config.set('dataDir', '/home/user/data')
      await letData(es).have(new IndexedDocument('/home/user/data/is/a/path/test.doc', index)).commit()

      const response = await store.dispatch('search/queryFacet', { name: 'path' })

      expect(response.aggregations.byDirname.buckets).toHaveLength(1)
      expect(response.aggregations.byDirname.buckets[0].key).toBe('/home/user/data/is')
      expect(response.aggregations.byDirname.buckets[0].doc_count).toBe(1)
    })

    it('should return 2 buckets, the correct path and the correct number of results', async () => {
      Murmur.config.set('dataDir', '/home/user/data')
      await letData(es).have(new IndexedDocument('/home/user/data/is/a/path/test.doc', index)).commit()
      await letData(es).have(new IndexedDocument('/home/user/data/is/a/second/path/test.doc', index)).commit()
      await letData(es).have(new IndexedDocument('/home/user/data/was/a/third/path/test.doc', index)).commit()

      const response = await store.dispatch('search/queryFacet', { name: 'path' })

      expect(response.aggregations.byDirname.buckets).toHaveLength(2)
      expect(response.aggregations.byDirname.buckets[0].key).toBe('/home/user/data/is')
      expect(response.aggregations.byDirname.buckets[0].doc_count).toBe(2)
      expect(response.aggregations.byDirname.buckets[1].key).toBe('/home/user/data/was')
      expect(response.aggregations.byDirname.buckets[1].doc_count).toBe(1)
    })
  })

  describe('Indexing date facet', () => {
    const name = 'indexingDate'

    it('should define an `indexing date` facet correctly (name, key and type)', () => {
      const facet = find(store.state.search.facets, { name })

      expect(typeof facet).toBe('object')
      expect(facet.key).toBe('extractionDate')
      expect(facet.constructor.name).toBe('FacetDate')
    })

    it('should return the indexing date buckets', async () => {
      await letData(es).have(new IndexedDocument('doc_01.txt', index).withIndexingDate('2018-04-04T20:20:20.001Z')).commit()
      await letData(es).have(new IndexedDocument('doc_02.txt', index).withIndexingDate('2018-04-06T20:20:20.001Z')).commit()
      await letData(es).have(new IndexedDocument('doc_03.txt', index).withIndexingDate('2018-05-04T20:20:20.001Z')).commit()

      const response = await store.dispatch('search/queryFacet', { name, options: { size: 8 } })

      expect(response.aggregations.extractionDate.buckets).toHaveLength(2)
      expect(response.aggregations.extractionDate.buckets[0].key).toBe(1525132800000)
      expect(response.aggregations.extractionDate.buckets[0].doc_count).toBe(1)
      expect(response.aggregations.extractionDate.buckets[1].key).toBe(1522540800000)
      expect(response.aggregations.extractionDate.buckets[1].doc_count).toBe(2)
    })
  })

  describe('Named entities facet', () => {
    it('should define a `named-entity` facet correctly (name, key, type and PERSON category)', () => {
      const facet = find(store.state.search.facets, { name: 'namedEntityPerson' })

      expect(typeof facet).toBe('object')
      expect(facet.key).toBe('byMentions')
      expect(facet.category).toBe('PERSON')
      expect(facet.constructor.name).toBe('FacetNamedEntity')
    })

    it('should aggregate only the not hidden named entities for PERSON category', async () => {
      await letData(es).have(new IndexedDocument('doc_01.csv', index).withNer('entity_01', 42, 'PERSON', false)).commit()
      await letData(es).have(new IndexedDocument('doc_02.csv', index).withNer('entity_01', 43, 'PERSON', false)).commit()
      await letData(es).have(new IndexedDocument('doc_03.csv', index).withNer('entity_02', 44, 'PERSON', true)).commit()
      await letData(es).have(new IndexedDocument('doc_04.csv', index).withNer('entity_03', 45, 'PERSON', false)).commit()

      const response = await store.dispatch('search/queryFacet', { name: 'namedEntityPerson' })

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

      const response = await store.dispatch('search/queryFacet', { name: 'namedEntityLocation', category: 'LOCATION' })

      expect(response.aggregations.byMentions.buckets).toHaveLength(2)
    })

    it('should aggregate named entities for ORGANIZATION category', async () => {
      await letData(es).have(new IndexedDocument('doc_01.csv', index).withNer('entity_01', 42, 'ORGANIZATION', false)).commit()
      await letData(es).have(new IndexedDocument('doc_02.csv', index).withNer('entity_02', 43, 'ORGANIZATION', false)).commit()
      await letData(es).have(new IndexedDocument('doc_03.csv', index).withNer('entity_03', 44, 'PERSON', true)).commit()

      const response = await store.dispatch('search/queryFacet', { name: 'namedEntityOrganization', category: 'ORGANIZATION' })

      expect(response.aggregations.byMentions.buckets).toHaveLength(2)
    })
  })

  describe('Creation date facet', () => {
    const name = 'creationDate'

    it('should merge all missing data', async () => {
      await letData(es).have(new IndexedDocument('doc_01', index)
        .withCreationDate('2018-04-01T00:00:00.001Z')).commit()
      await letData(es).have(new IndexedDocument('doc_02', index)
        .withCreationDate('2018-05-01T00:00:00.001Z')).commit()
      await letData(es).have(new IndexedDocument('doc_03', index)).commit()
      await letData(es).have(new IndexedDocument('doc_04', index)).commit()

      const response = await store.dispatch('search/queryFacet', { name, options: { size: 8 } })

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

      const response = await store.dispatch('search/queryFacet', { name, options: { size: 8 } })

      expect(response.aggregations['metadata.tika_metadata_creation_date'].buckets).toHaveLength(1)
    })
  })

  describe('Starred facet', () => {
    it('should define a `starred` facet correctly (name, key, type and starredDocuments)', () => {
      const facet = find(store.state.search.facets, { name: 'starred' })

      expect(typeof facet).toBe('object')
      expect(facet.key).toBe('_id')
      expect(facet.constructor.name).toBe('FacetYesNo')
      expect(facet.starredDocuments).toEqual([])
    })
  })
})
