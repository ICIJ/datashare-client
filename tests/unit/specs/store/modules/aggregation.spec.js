import cloneDeep from 'lodash/cloneDeep'
import omit from 'lodash/omit'
import functionsIn from 'lodash/functionsIn'
import each from 'lodash/each'
import find from 'lodash/find'

import store from '@/store'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import Vue from 'vue'

describe('Aggregation store', function () {
  esConnectionHelper()
  let es = esConnectionHelper.es
  // High timeout because multiple searches can be heavy for the Elasticsearch
  jest.setTimeout(1e4)

  beforeAll(async () => {
    store.commit('aggregation/reset')
    store.commit('search/reset')
  })

  afterEach(async () => {
    store.commit('aggregation/reset')
    store.commit('search/reset')
  })

  it('should define a store module', () => {
    expect(store.state.aggregation).not.toEqual(undefined)
  })

  it('should reset the store state', async () => {
    let initialState = cloneDeep(store.state.aggregation)
    await store.commit('aggregation/reset')

    // Should filter the functions because these would never be equal
    // So only compare integers, strings, arrays ...
    initialState.facets = each(initialState.facets, (value, key) => {
      initialState.facets[key] = omit(value, functionsIn(value))
    })

    store.commit('aggregation/setFacets', each(store.state.aggregation.facets, (value, key) => {
      store.state.aggregation.facets[key] = omit(value, functionsIn(value))
    }))

    expect(store.state.aggregation).toEqual(initialState)
  })

  it('should define a `content-type` facet correctly (name, key and type)', () => {
    let facetPath = find(store.state.aggregation.facets, { name: 'content-type' })

    expect(typeof facetPath).toBe('object')
    expect(facetPath.key).toEqual('contentType')
    expect(facetPath.type).toEqual('FacetText')
  })

  it('should define a `language` facet correctly (name, key and type)', () => {
    let facetPath = find(store.state.aggregation.facets, { name: 'language' })

    expect(typeof facetPath).toBe('object')
    expect(facetPath.key).toEqual('language')
    expect(facetPath.type).toEqual('FacetText')
  })

  it('should define a `named-entity` facet correctly (name, key and type)', () => {
    let facetPath = find(store.state.aggregation.facets, { name: 'named-entity' })

    expect(typeof facetPath).toBe('object')
    expect(facetPath.key).toEqual('byMentions')
    expect(facetPath.type).toEqual('FacetNamedEntity')
  })

  it('should find a `content-type` facet using object', () => {
    expect(store.getters['aggregation/getFacet']({ name: 'content-type' })).not.toEqual(undefined)
  })

  it('should find a `content-type` facet using function', () => {
    expect(store.getters['aggregation/getFacet'](f => f.name === 'content-type')).not.toEqual(undefined)
  })

  it('should not find a `yolo-type` facet', () => {
    expect(store.getters['aggregation/getFacet']({ name: 'yo-type' })).toEqual(undefined)
  })

  it('should have a facet with a body method', () => {
    expect(store.state.aggregation.facets[0]).toHaveProperty('body')
  })

  it('should add a facet', () => {
    const length = store.state.aggregation.facets.length
    store.commit('aggregation/addFacet', { name: 'test', type: null, isSearchable: null, body: null })
    expect(store.state.aggregation.facets).toHaveLength(length + 1)
  })

  it('should throw an error while adding an empty facet', () => {
    expect(() => {
      store.commit('aggregation/addFacet', {})
    }).toThrow()
  })

  it('should throw an error while adding a facet without name', () => {
    expect(() => {
      store.commit('aggregation/addFacet', { type: 'yolo', isSearchable: false, body: 'yolo' })
    }).toThrow()
  })

  it('should throw an error while adding a facet without type', () => {
    expect(() => {
      store.commit('aggregation/addFacet', { name: 'yolo', isSearchable: false, body: 'yolo' })
    }).toThrow()
  })

  it('should throw an error while adding a facet without isSearchable', () => {
    expect(() => {
      store.commit('aggregation/addFacet', { name: 'yolo', type: 'yolo', body: 'yolo' })
    }).toThrow()
  })

  it('should throw an error while adding a facet without body', () => {
    expect(() => {
      store.commit('aggregation/addFacet', { name: 'yolo', type: 'yolo', isSearchable: false })
    }).toThrow()
  })

  it('should count 2 pdf documents', async () => {
    await letData(es).have(new IndexedDocument('bar.pdf').withContentType('application/pdf')).commit()
    await letData(es).have(new IndexedDocument('foo.pdf').withContentType('application/pdf')).commit()

    const response = await store.dispatch('aggregation/query', {name: 'content-type'})
    expect(response.aggregations.contentType.buckets).toHaveLength(1)
    expect(response.aggregations.contentType.buckets[0].doc_count).toEqual(2)
  })

  it('should use contentType (without charset)', async () => {
    await letData(es).have(new IndexedDocument('bar.txt').withContentType('text/plain; charset=UTF-8')).commit()

    const response = await store.dispatch('aggregation/query', {name: 'content-type'})
    expect(response.aggregations.contentType.buckets[0].key).toEqual('text/plain')
  })

  it('should count 2 pdf and 1 javascript documents', async () => {
    await letData(es).have(new IndexedDocument('bar.pdf').withContentType('application/pdf')).commit()
    await letData(es).have(new IndexedDocument('foo.pdf').withContentType('application/pdf')).commit()
    await letData(es).have(new IndexedDocument('foo.js').withContentType('text/javascript')).commit()

    const response = await store.dispatch('aggregation/query', {name: 'content-type'})
    expect(response.aggregations.contentType.buckets).toHaveLength(2)
    expect(response.aggregations.contentType.buckets[0].doc_count).toEqual(2)
    expect(response.aggregations.contentType.buckets[1].doc_count).toEqual(1)
  })

  it('should count 2 pdf but have no hits', async () => {
    await letData(es).have(new IndexedDocument('bar.pdf').withContentType('application/pdf')).commit()
    await letData(es).have(new IndexedDocument('foo.pdf').withContentType('application/pdf')).commit()

    const response = await store.dispatch('aggregation/query', {name: 'content-type'})
    expect(response.aggregations.contentType.buckets[0].doc_count).toEqual(2)
    expect(response.hits).toHaveLength(0)
  })

  it('should create 3 buckets from 3 documents', async () => {
    await letData(es).have(new IndexedDocument('index.js').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('index.html').withContentType('text/html')).commit()
    await letData(es).have(new IndexedDocument('index.css').withContentType('text/css')).commit()

    const response = await store.dispatch('aggregation/query', {name: 'content-type'})
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

    const response = await store.dispatch('aggregation/query', {name: 'content-type'})
    expect(response.aggregations.contentType.buckets).toHaveLength(3)
  })

  // Path facet
  it('should define a `path` facet correctly (name, key and type)', () => {
    let facetPath = find(store.state.aggregation.facets, {name: 'path'})

    expect(typeof facetPath).toBe('object')
    expect(facetPath.key).toEqual('byDirname')
    expect(facetPath.type).toEqual('FacetPath')
  })

  it('should get no bucket for path aggregation', async () => {
    Vue.prototype.config = { dataDir: '/home/user/data' }

    const response = await store.dispatch('aggregation/query', { name: 'path' })
    expect(response.aggregations.byDirname.buckets).toHaveLength(0)
  })

  it('should return 1 bucket, the correct first level path and the correct number of results', async () => {
    Vue.prototype.config = { dataDir: '/home/user/data' }

    await letData(es).have(new IndexedDocument('/home/user/data/is/a/path/test.doc')).commit()

    const response = await store.dispatch('aggregation/query', { name: 'path' })

    expect(response.aggregations.byDirname.buckets).toHaveLength(1)
    expect(response.aggregations.byDirname.buckets[0].key).toEqual('/home/user/data/is')
    expect(response.aggregations.byDirname.buckets[0].doc_count).toEqual(1)
  })

  it('should return 2 buckets, the correct path and the correct number of results', async () => {
    Vue.prototype.config = { dataDir: '/home/user/data' }

    await letData(es).have(new IndexedDocument('/home/user/data/is/a/path/test.doc')).commit()
    await letData(es).have(new IndexedDocument('/home/user/data/is/a/second/path/test.doc')).commit()
    await letData(es).have(new IndexedDocument('/home/user/data/was/a/third/path/test.doc')).commit()

    const response = await store.dispatch('aggregation/query', { name: 'path' })

    expect(response.aggregations.byDirname.buckets).toHaveLength(2)
    expect(response.aggregations.byDirname.buckets[0].key).toEqual('/home/user/data/is')
    expect(response.aggregations.byDirname.buckets[0].doc_count).toEqual(2)
    expect(response.aggregations.byDirname.buckets[1].key).toEqual('/home/user/data/was')
    expect(response.aggregations.byDirname.buckets[1].doc_count).toEqual(1)
  })

  // Indexing date facet
  it('should define an `indexing date` facet correctly (name, key and type)', () => {
    let facetPath = find(store.state.aggregation.facets, { name: 'indexing-date' })

    expect(typeof facetPath).toBe('object')
    expect(facetPath.key).toEqual('extractionDate')
    expect(facetPath.type).toEqual('FacetText')
  })

  it('should return the indexing date buckets', async () => {
    await letData(es).have(new IndexedDocument('doc_01.txt').withIndexingDate('2018-04-04T20:20:20.001Z')).commit()
    await letData(es).have(new IndexedDocument('doc_02.txt').withIndexingDate('2018-04-06T20:20:20.001Z')).commit()
    await letData(es).have(new IndexedDocument('doc_03.txt').withIndexingDate('2018-05-04T20:20:20.001Z')).commit()

    const response = await store.dispatch('aggregation/query', { name: 'indexing-date' })

    expect(response.aggregations.extractionDate.buckets).toHaveLength(2)
    expect(response.aggregations.extractionDate.buckets[0].key).toEqual(1522540800000)
    expect(response.aggregations.extractionDate.buckets[0].doc_count).toEqual(2)
    expect(response.aggregations.extractionDate.buckets[1].key).toEqual(1525132800000)
    expect(response.aggregations.extractionDate.buckets[1].doc_count).toEqual(1)
  })

  it('should aggregate only the not hidden named entities', async () => {
    await letData(es).have(new IndexedDocument('doc_01.csv').withNer('entity_01', 42, 'ORGANIZATION', false)).commit()
    await letData(es).have(new IndexedDocument('doc_02.csv').withNer('entity_01', 43, 'ORGANIZATION', false)).commit()
    await letData(es).have(new IndexedDocument('doc_03.csv').withNer('entity_02', 44, 'ORGANIZATION', true)).commit()
    await letData(es).have(new IndexedDocument('doc_04.csv').withNer('entity_03', 45, 'ORGANIZATION', false)).commit()

    const response = await store.dispatch('aggregation/query', { name: 'named-entity' })
    expect(response.aggregations.byMentions.buckets).toHaveLength(2)
    expect(response.aggregations.byMentions.buckets[0].key).toEqual('entity_01')
    expect(response.aggregations.byMentions.buckets[0].doc_count).toEqual(2)
    expect(response.aggregations.byMentions.buckets[1].key).toEqual('entity_03')
    expect(response.aggregations.byMentions.buckets[1].doc_count).toEqual(1)
  })
})
