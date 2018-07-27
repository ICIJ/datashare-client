import cloneDeep from 'lodash/cloneDeep'
import omit from 'lodash/omit'
import functionsIn from 'lodash/functionsIn'
import each from 'lodash/each'
import find from 'lodash/find'
import { expect } from 'chai'
import Vuex from 'vuex'

import store from '@/store'
import { IndexedDocument, letData } from '../../../es_utils'
import esConnectionHelper from '../../utils/esConnectionHelper'

describe('Aggregation store', () => {
  esConnectionHelper()
  let es = esConnectionHelper.es

  before(async () => {
    store.commit('aggregation/reset')
    store.commit('search/reset')
  })

  afterEach(async () => {
    store.commit('aggregation/reset')
    store.commit('search/reset')
  })

  it('should define a store module', () => {
    expect(store.state.aggregation).to.not.equal(undefined)
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

    expect(store.state.aggregation).to.deep.equal(initialState)
  })

  it('should define a `content-type` facet correctly (name, key and type)', () => {
    let facetPath = find(store.state.aggregation.facets, { name: 'content-type' })

    expect(facetPath).to.be.an('object')
    expect(facetPath.key).to.equal('contentType')
    expect(facetPath.type).to.equal('FacetText')
  })

  it('should define a `language` facet correctly (name, key and type)', () => {
    let facetPath = find(store.state.aggregation.facets, { name: 'language' })

    expect(facetPath).to.be.an('object')
    expect(facetPath.key).to.equal('language')
    expect(facetPath.type).to.equal('FacetText')
  })

  it('should define a `named-entity` facet correctly (name, key and type)', () => {
    let facetPath = find(store.state.aggregation.facets, { name: 'named-entity' })

    expect(facetPath).to.be.an('object')
    expect(facetPath.key).to.equal('mentions')
    expect(facetPath.type).to.equal('FacetNamedEntity')
  })

  it('should find a `content-type` facet using object', () => {
    expect(store.getters['aggregation/getFacet']({ name: 'content-type' })).to.not.equal(undefined)
  })

  it('should find a `content-type` facet using function', () => {
    expect(store.getters['aggregation/getFacet'](f => f.name === 'content-type')).to.not.equal(undefined)
  })

  it('should not find a `yolo-type` facet', () => {
    expect(store.getters['aggregation/getFacet']({ name: 'yo-type' })).to.equal(undefined)
  })

  it('should have a facet with a body method', () => {
    expect(store.state.aggregation.facets[0]).to.respondTo('body')
  })

  it('should add a facet', () => {
    const length = store.state.aggregation.facets.length
    store.commit('aggregation/addFacet', { name: 'test', type: null, isSearchable: null, body: null })
    expect(store.state.aggregation.facets).to.have.lengthOf(length + 1)
  })

  it('should throw an error while adding an empty facet', () => {
    expect(() => {
      store.commit('aggregation/addFacet', {})
    }).to.throw()
  })

  it('should throw an error while adding a facet without name', () => {
    expect(() => {
      store.commit('aggregation/addFacet', { type: 'yolo', isSearchable: false, body: 'yolo' })
    }).to.throw()
  })

  it('should throw an error while adding a facet without type', () => {
    expect(() => {
      store.commit('aggregation/addFacet', { name: 'yolo', isSearchable: false, body: 'yolo' })
    }).to.throw()
  })

  it('should throw an error while adding a facet without isSearchable', () => {
    expect(() => {
      store.commit('aggregation/addFacet', { name: 'yolo', type: 'yolo', body: 'yolo' })
    }).to.throw()
  })

  it('should throw an error while adding a facet without body', () => {
    expect(() => {
      store.commit('aggregation/addFacet', { name: 'yolo', type: 'yolo', isSearchable: false })
    }).to.throw()
  })

  it('should count 2 pdf documents', async () => {
    await letData(es).have(new IndexedDocument('bar.pdf').withContentType('application/pdf')).commit()
    await letData(es).have(new IndexedDocument('foo.pdf').withContentType('application/pdf')).commit()

    const response = await store.dispatch('aggregation/query', {name: 'content-type'})
    expect(response.aggregations.contentType.buckets).to.have.lengthOf(1)
    expect(response.aggregations.contentType.buckets[0].doc_count).to.equal(2)
  })

  it('should use contentType (without charset)', async () => {
    await letData(es).have(new IndexedDocument('bar.txt').withContentType('text/plain; charset=UTF-8')).commit()

    const response = await store.dispatch('aggregation/query', {name: 'content-type'})
    expect(response.aggregations.contentType.buckets[0].key).to.equal('text/plain')
  })

  it('should count 2 pdf and 1 javascript documents', async () => {
    await letData(es).have(new IndexedDocument('bar.pdf').withContentType('application/pdf')).commit()
    await letData(es).have(new IndexedDocument('foo.pdf').withContentType('application/pdf')).commit()
    await letData(es).have(new IndexedDocument('foo.js').withContentType('text/javascript')).commit()

    const response = await store.dispatch('aggregation/query', {name: 'content-type'})
    expect(response.aggregations.contentType.buckets).to.have.lengthOf(2)
    expect(response.aggregations.contentType.buckets[0].doc_count).to.equal(2)
    expect(response.aggregations.contentType.buckets[1].doc_count).to.equal(1)
  })

  it('should count 2 pdf but have no hits', async () => {
    await letData(es).have(new IndexedDocument('bar.pdf').withContentType('application/pdf')).commit()
    await letData(es).have(new IndexedDocument('foo.pdf').withContentType('application/pdf')).commit()

    const response = await store.dispatch('aggregation/query', {name: 'content-type'})
    expect(response.aggregations.contentType.buckets[0].doc_count).to.equal(2)
    expect(response.hits).to.have.lengthOf(0)
  })

  it('should create 3 buckets from 3 documents', async () => {
    await letData(es).have(new IndexedDocument('index.js').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('index.html').withContentType('text/html')).commit()
    await letData(es).have(new IndexedDocument('index.css').withContentType('text/css')).commit()

    const response = await store.dispatch('aggregation/query', {name: 'content-type'})
    expect(response.aggregations.contentType.buckets).to.have.lengthOf(3)
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
    expect(response.aggregations.contentType.buckets).to.have.lengthOf(3)
  })

  // Path facet
  it('should define a `path` facet correctly (name, key and type)', () => {
    let facetPath = find(store.state.aggregation.facets, {name: 'path'})

    expect(facetPath).to.be.an('object')
    expect(facetPath.key).to.equal('path')
    expect(facetPath.type).to.equal('FacetPath')
  })

  it('should get no bucket for path aggregation', async () => {
    const response = await store.dispatch('aggregation/query', { name: 'path' })
    expect(response.aggregations.path.buckets).to.have.lengthOf(0)
  })

  it('should return one bucket, the correct path and the correct number of results', async () => {
    await letData(es).have(new IndexedDocument('this/is/a/path/test.doc')).commit()

    const response = await store.dispatch('aggregation/query', { name: 'path' })
    expect(response.aggregations.path.buckets).to.have.lengthOf(1)
    expect(response.aggregations.path.buckets[0].key).to.equal('this/is/a/path/test.doc')
    expect(response.aggregations.path.buckets[0].doc_count).to.equal(1)
  })

  it('should return lots of buckets, the correct path and the correct number of results', async () => {
    await letData(es).have(new IndexedDocument('this/is/a/path/test.doc')).commit()
    await letData(es).have(new IndexedDocument('this/is/a/second/path/test.doc')).commit()
    await letData(es).have(new IndexedDocument('this/is/a/third/path/test.doc')).commit()

    const response = await store.dispatch('aggregation/query', { name: 'path' })
    expect(response.aggregations.path.buckets).to.have.lengthOf(3)
    expect(response.aggregations.path.buckets[0].key).to.equal('this/is/a/path/test.doc')
    expect(response.aggregations.path.buckets[0].doc_count).to.equal(1)
    expect(response.aggregations.path.buckets[1].key).to.equal('this/is/a/second/path/test.doc')
    expect(response.aggregations.path.buckets[1].doc_count).to.equal(1)
    expect(response.aggregations.path.buckets[2].key).to.equal('this/is/a/third/path/test.doc')
    expect(response.aggregations.path.buckets[2].doc_count).to.equal(1)
  })

  // Indexing date facet
  it('should define an `indexing date` facet correctly (name, key and type)', () => {
    let facetPath = find(store.state.aggregation.facets, { name: 'indexing-date' })

    expect(facetPath).to.be.an('object')
    expect(facetPath.key).to.equal('extractionDate')
    expect(facetPath.type).to.equal('FacetText')
  })
})
