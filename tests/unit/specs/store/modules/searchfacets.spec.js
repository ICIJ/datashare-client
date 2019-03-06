import Murmur from '@icij/murmur'
import { FacetText } from '@/store/facetsStore'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import store from '@/store'
import cloneDeep from 'lodash/cloneDeep'
import each from 'lodash/each'
import find from 'lodash/find'
import functionsIn from 'lodash/functionsIn'
import omit from 'lodash/omit'

describe('Search facets', () => {
  esConnectionHelper()
  const es = esConnectionHelper.es
  // High timeout because multiple searches can be heavy for the Elasticsearch
  jest.setTimeout(1e4)

  beforeAll(() => store.commit('search/index', process.env.VUE_APP_ES_INDEX))

  afterEach(() => store.commit('search/reset'))

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

  it('should define a `content-type` facet correctly (name, key and type)', () => {
    const facet = find(store.state.search.facets, { name: 'content-type' })

    expect(typeof facet).toBe('object')
    expect(facet.key).toEqual('contentType')
    expect(facet.constructor.name).toEqual('FacetText')
  })

  it('should define a `language` facet correctly (name, key and type)', () => {
    const facet = find(store.state.search.facets, { name: 'language' })

    expect(typeof facet).toBe('object')
    expect(facet.key).toEqual('language')
    expect(facet.constructor.name).toEqual('FacetText')
  })

  it('should define a `named-entity` facet correctly (name, key, type and PERSON category)', () => {
    const facet = find(store.state.search.facets, { name: 'named-entity-person' })

    expect(typeof facet).toBe('object')
    expect(facet.key).toEqual('byMentions')
    expect(facet.category).toEqual('PERSON')
    expect(facet.constructor.name).toEqual('FacetNamedEntity')
  })

  it('should find a `content-type` facet using object', () => {
    expect(store.getters['search/getFacet']({ name: 'content-type' })).not.toBeUndefined()
  })

  it('should find a `content-type` facet using function', () => {
    expect(store.getters['search/getFacet'](f => f.name === 'content-type')).not.toBeUndefined()
  })

  it('should not find a `yolo-type` facet', () => {
    expect(store.getters['search/getFacet']({ name: 'yo-type' })).toBeUndefined()
  })

  it('should have a facet with a body method', () => {
    expect(store.state.search.facets[0]).toHaveProperty('body')
  })

  it('should add a facet', () => {
    const length = store.state.search.facets.length
    store.commit('search/addFacet', new FacetText('test', 'key', true, null))

    expect(store.state.search.facets).toHaveLength(length + 1)
  })

  it('should count 2 pdf documents', async () => {
    await letData(es).have(new IndexedDocument('bar.pdf').withContentType('application/pdf')).commit()
    await letData(es).have(new IndexedDocument('foo.pdf').withContentType('application/pdf')).commit()

    const response = await store.dispatch('search/queryFacet', { name: 'content-type' })

    expect(response.aggregations.contentType.buckets).toHaveLength(1)
    expect(response.aggregations.contentType.buckets[0].doc_count).toEqual(2)
  })

  it('should use contentType (without charset)', async () => {
    await letData(es).have(new IndexedDocument('bar.txt').withContentType('text/plain; charset=UTF-8')).commit()

    const response = await store.dispatch('search/queryFacet', { name: 'content-type' })

    expect(response.aggregations.contentType.buckets[0].key).toEqual('text/plain')
  })

  it('should count 2 pdf and 1 javascript documents', async () => {
    await letData(es).have(new IndexedDocument('bar.pdf').withContentType('application/pdf')).commit()
    await letData(es).have(new IndexedDocument('foo.pdf').withContentType('application/pdf')).commit()
    await letData(es).have(new IndexedDocument('foo.js').withContentType('text/javascript')).commit()

    const response = await store.dispatch('search/queryFacet', { name: 'content-type' })

    expect(response.aggregations.contentType.buckets).toHaveLength(2)
    expect(response.aggregations.contentType.buckets[0].doc_count).toEqual(2)
    expect(response.aggregations.contentType.buckets[1].doc_count).toEqual(1)
  })

  it('should count 2 pdf but have no hits', async () => {
    await letData(es).have(new IndexedDocument('bar.pdf').withContentType('application/pdf')).commit()
    await letData(es).have(new IndexedDocument('foo.pdf').withContentType('application/pdf')).commit()

    const response = await store.dispatch('search/queryFacet', { name: 'content-type' })

    expect(response.aggregations.contentType.buckets[0].doc_count).toEqual(2)
    expect(response.hits).toHaveLength(0)
  })

  it('should create 3 buckets from 3 documents', async () => {
    await letData(es).have(new IndexedDocument('index.js').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('index.html').withContentType('text/html')).commit()
    await letData(es).have(new IndexedDocument('index.css').withContentType('text/css')).commit()

    const response = await store.dispatch('search/queryFacet', { name: 'content-type' })

    expect(response.aggregations.contentType.buckets).toHaveLength(3)
  })

  it('should create 3 buckets from 7 documents', async () => {
    await letData(es).have(new IndexedDocument('index.js').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('list.js').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('show.js').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('index.html').withContentType('text/html')).commit()
    await letData(es).have(new IndexedDocument('list.html').withContentType('text/html')).commit()
    await letData(es).have(new IndexedDocument('index.css').withContentType('text/css')).commit()
    await letData(es).have(new IndexedDocument('list.css').withContentType('text/css')).commit()

    const response = await store.dispatch('search/queryFacet', { name: 'content-type' })

    expect(response.aggregations.contentType.buckets).toHaveLength(3)
  })

  // Path facet
  it('should define a `path` facet correctly (name, key and type)', () => {
    const facet = find(store.state.search.facets, { name: 'path' })

    expect(typeof facet).toBe('object')
    expect(facet.key).toEqual('byDirname')
    expect(facet.constructor.name).toEqual('FacetPath')
  })

  it('should get no bucket for path aggregation', async () => {
    Murmur.config.set('dataDir', '/home/user/data')

    const response = await store.dispatch('search/queryFacet', { name: 'path' })

    expect(response.aggregations.byDirname.buckets).toHaveLength(0)
  })

  it('should return 1 bucket, the correct first level path and the correct number of results', async () => {
    Murmur.config.set('dataDir', '/home/user/data')
    await letData(es).have(new IndexedDocument('/home/user/data/is/a/path/test.doc')).commit()

    const response = await store.dispatch('search/queryFacet', { name: 'path' })

    expect(response.aggregations.byDirname.buckets).toHaveLength(1)
    expect(response.aggregations.byDirname.buckets[0].key).toEqual('/home/user/data/is')
    expect(response.aggregations.byDirname.buckets[0].doc_count).toEqual(1)
  })

  it('should return 2 buckets, the correct path and the correct number of results', async () => {
    Murmur.config.set('dataDir', '/home/user/data')
    await letData(es).have(new IndexedDocument('/home/user/data/is/a/path/test.doc')).commit()
    await letData(es).have(new IndexedDocument('/home/user/data/is/a/second/path/test.doc')).commit()
    await letData(es).have(new IndexedDocument('/home/user/data/was/a/third/path/test.doc')).commit()

    const response = await store.dispatch('search/queryFacet', { name: 'path' })

    expect(response.aggregations.byDirname.buckets).toHaveLength(2)
    expect(response.aggregations.byDirname.buckets[0].key).toEqual('/home/user/data/is')
    expect(response.aggregations.byDirname.buckets[0].doc_count).toEqual(2)
    expect(response.aggregations.byDirname.buckets[1].key).toEqual('/home/user/data/was')
    expect(response.aggregations.byDirname.buckets[1].doc_count).toEqual(1)
  })

  // Indexing date facet
  it('should define an `indexing date` facet correctly (name, key and type)', () => {
    const facet = find(store.state.search.facets, { name: 'indexing-date' })

    expect(typeof facet).toBe('object')
    expect(facet.key).toEqual('extractionDate')
    expect(facet.constructor.name).toEqual('FacetDate')
  })

  it('should return the indexing date buckets', async () => {
    await letData(es).have(new IndexedDocument('doc_01.txt').withIndexingDate('2018-04-04T20:20:20.001Z')).commit()
    await letData(es).have(new IndexedDocument('doc_02.txt').withIndexingDate('2018-04-06T20:20:20.001Z')).commit()
    await letData(es).have(new IndexedDocument('doc_03.txt').withIndexingDate('2018-05-04T20:20:20.001Z')).commit()

    const response = await store.dispatch('search/queryFacet', { name: 'indexing-date' })

    expect(response.aggregations.extractionDate.buckets).toHaveLength(2)
    expect(response.aggregations.extractionDate.buckets[0].key).toEqual(1525132800000)
    expect(response.aggregations.extractionDate.buckets[0].doc_count).toEqual(1)
    expect(response.aggregations.extractionDate.buckets[1].key).toEqual(1522540800000)
    expect(response.aggregations.extractionDate.buckets[1].doc_count).toEqual(2)
  })

  // Named entities facet
  it('should aggregate only the not hidden named entities for PERSON category', async () => {
    await letData(es).have(new IndexedDocument('doc_01.csv').withNer('entity_01', 42, 'PERSON', false)).commit()
    await letData(es).have(new IndexedDocument('doc_02.csv').withNer('entity_01', 43, 'PERSON', false)).commit()
    await letData(es).have(new IndexedDocument('doc_03.csv').withNer('entity_02', 44, 'PERSON', true)).commit()
    await letData(es).have(new IndexedDocument('doc_04.csv').withNer('entity_03', 45, 'PERSON', false)).commit()

    const response = await store.dispatch('search/queryFacet', { name: 'named-entity-person' })

    expect(response.aggregations.byMentions.buckets).toHaveLength(2)
    expect(response.aggregations.byMentions.buckets[0].key).toEqual('entity_01')
    expect(response.aggregations.byMentions.buckets[0].doc_count).toEqual(2)
    expect(response.aggregations.byMentions.buckets[1].key).toEqual('entity_03')
    expect(response.aggregations.byMentions.buckets[1].doc_count).toEqual(1)
  })

  it('should aggregate named entities for LOCATION category', async () => {
    await letData(es).have(new IndexedDocument('doc_01.csv').withNer('entity_01', 42, 'LOCATION', false)).commit()
    await letData(es).have(new IndexedDocument('doc_02.csv').withNer('entity_02', 43, 'LOCATION', false)).commit()
    await letData(es).have(new IndexedDocument('doc_03.csv').withNer('entity_03', 44, 'ORGANIZATION', true)).commit()

    const response = await store.dispatch('search/queryFacet', { name: 'named-entity-location', category: 'LOCATION' })

    expect(response.aggregations.byMentions.buckets).toHaveLength(2)
  })

  it('should aggregate named entities for ORGANIZATION category', async () => {
    await letData(es).have(new IndexedDocument('doc_01.csv').withNer('entity_01', 42, 'ORGANIZATION', false)).commit()
    await letData(es).have(new IndexedDocument('doc_02.csv').withNer('entity_02', 43, 'ORGANIZATION', false)).commit()
    await letData(es).have(new IndexedDocument('doc_03.csv').withNer('entity_03', 44, 'PERSON', true)).commit()

    const response = await store.dispatch('search/queryFacet', { name: 'named-entity-organization', category: 'ORGANIZATION' })

    expect(response.aggregations.byMentions.buckets).toHaveLength(2)
  })
})
