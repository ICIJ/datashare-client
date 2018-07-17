import { state, actions, getters, mutations } from '@/store/modules/aggregation'
import search from '@/store/modules/search'

import Vuex from 'vuex'
import cloneDeep from 'lodash/cloneDeep'
import omit from 'lodash/omit'
import functionsIn from 'lodash/functionsIn'
import each from 'lodash/each'
import find from 'lodash/find'

import { IndexedDocument, letData } from 'test/unit/es_utils'
import esConnectionHelper from 'test/unit/specs/utils/esConnectionHelper'

describe('Aggregation store', () => {
  esConnectionHelper()
  let es = esConnectionHelper.es
  let store = null

  before(async () => {
    store = new Vuex.Store({ state: state, actions, getters, mutations, modules: { search } })
  })

  afterEach(async () => {
    store.commit('search/reset')
    store.commit('reset')
  })

  it('should define a store module', () => {
    expect(store.state).to.not.equal(undefined)
  })

  it('should reset the store state', async () => {
    let initialState = cloneDeep(store.state)

    await store.commit('reset')

    // Should filter the functions because these would never be equal
    // So only compare integers, strings, arrays ...
    let tmp = each(initialState.facets, (value, key) => {
      initialState.facets[key] = omit(value, functionsIn(value))
    })
    initialState.facets = tmp
    tmp = each(store.state.facets, (value, key) => {
      store.state.facets[key] = omit(value, functionsIn(value))
    })
    store.state.facets = tmp

    expect(store.state).to.deep.equal(initialState)
  })

  it('should define a `content-type` facet correctly (name, key and type)', () => {
    let facetPath = find(store.state.facets, { name: 'content-type' })

    facetPath.should.be.an('object')
    expect(facetPath.key).to.equal('contentType')
    expect(facetPath.type).to.equal('FacetText')
  })

  it('should define a `language` facet correctly (name, key and type)', () => {
    let facetPath = find(store.state.facets, { name: 'language' })

    facetPath.should.be.an('object')
    expect(facetPath.key).to.equal('language')
    expect(facetPath.type).to.equal('FacetText')
  })

  it('should define a `named-entity` facet correctly (name, key and type)', () => {
    let facetPath = find(store.state.facets, { name: 'named-entity' })

    facetPath.should.be.an('object')
    expect(facetPath.key).to.equal('mentions')
    expect(facetPath.type).to.equal('FacetNamedEntity')
  })

  it('should find a `content-type` facet using object', () => {
    expect(store.getters.getFacet({ name: 'content-type' })).to.not.equal(undefined)
  })

  it('should find a `content-type` facet using function', () => {
    expect(store.getters.getFacet(f => f.name === 'content-type')).to.not.equal(undefined)
  })

  it('should not find a `yolo-type` facet', () => {
    expect(store.getters.getFacet({ name: 'yo-type' })).to.equal(undefined)
  })

  it('should have a facet with a body method', () => {
    expect(store.state.facets[0]).to.respondTo('body')
  })

  it('should add a facet', () => {
    expect(store.state.facets).to.have.lengthOf(state().facets.length)
    store.commit('addFacet', { name: 'test', type: null, body: null })
    expect(store.state.facets).to.have.lengthOf(state().facets.length + 1)
  })

  it('should throw an error while adding a invalid facet', () => {
    expect(() => {
      store.commit('addFacet', { name: 'test', type: null })
    }).to.throw()
  })

  it('should throw an error while adding an existing facet', () => {
    expect(() => {
      store.commit('addFacet', { name: 'content-type', type: null, body: null })
    }).to.throw()
  })

  it('should count 2 pdf documents', async () => {
    await letData(es).have(new IndexedDocument('bar.pdf').withContentType('application/pdf')).commit()
    await letData(es).have(new IndexedDocument('foo.pdf').withContentType('application/pdf')).commit()

    const response = await store.dispatch('query', {name: 'content-type'})
    expect(response.aggregations.contentType.buckets).to.have.lengthOf(1)
    expect(response.aggregations.contentType.buckets[0].doc_count).to.equal(2)
  })

  it('should use contentType (without charset)', async () => {
    await letData(es).have(new IndexedDocument('bar.txt').withContentType('text/plain; charset=UTF-8')).commit()

    const response = await store.dispatch('query', {name: 'content-type'})
    expect(response.aggregations.contentType.buckets[0].key).to.equal('text/plain')
  })

  it('should count 2 pdf and 1 javascript documents', async () => {
    await letData(es).have(new IndexedDocument('bar.pdf').withContentType('application/pdf')).commit()
    await letData(es).have(new IndexedDocument('foo.pdf').withContentType('application/pdf')).commit()
    await letData(es).have(new IndexedDocument('foo.js').withContentType('text/javascript')).commit()

    const response = await store.dispatch('query', {name: 'content-type'})
    expect(response.aggregations.contentType.buckets).to.have.lengthOf(2)
    expect(response.aggregations.contentType.buckets[0].doc_count).to.equal(2)
    expect(response.aggregations.contentType.buckets[1].doc_count).to.equal(1)
  })

  it('should count 2 pdf but have no hits', async () => {
    await letData(es).have(new IndexedDocument('bar.pdf').withContentType('application/pdf')).commit()
    await letData(es).have(new IndexedDocument('foo.pdf').withContentType('application/pdf')).commit()

    const response = await store.dispatch('query', {name: 'content-type'})
    expect(response.aggregations.contentType.buckets[0].doc_count).to.equal(2)
    expect(response.hits).to.have.lengthOf(0)
  })

  it('should create 3 buckets from 3 documents', async () => {
    await letData(es).have(new IndexedDocument('index.js').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('index.html').withContentType('text/html')).commit()
    await letData(es).have(new IndexedDocument('index.css').withContentType('text/css')).commit()

    const response = await store.dispatch('query', {name: 'content-type'})
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

    const response = await store.dispatch('query', {name: 'content-type'})
    expect(response.aggregations.contentType.buckets).to.have.lengthOf(3)
  })

  // Path facet
  it('should define a `path` facet correctly (name, key and type)', () => {
    let facetPath = find(store.state.facets, {name: 'path'})

    facetPath.should.be.an('object')
    expect(facetPath.key).to.equal('path')
    expect(facetPath.type).to.equal('FacetPath')
  })

  it('should get no bucket for path aggregation', async () => {
    const response = await store.dispatch('query', { name: 'path' })
    expect(response.aggregations.path.buckets).to.have.lengthOf(0)
  })

  it('should return one bucket, the correct path and the correct number of results', async () => {
    await letData(es).have(new IndexedDocument('this/is/a/path/test.doc')).commit()

    const response = await store.dispatch('query', { name: 'path' })
    expect(response.aggregations.path.buckets).to.have.lengthOf(1)
    expect(response.aggregations.path.buckets[0].key).to.equal('this/is/a/path/test.doc')
    expect(response.aggregations.path.buckets[0].doc_count).to.equal(1)
  })

  it('should return lots of buckets, the correct path and the correct number of results', async () => {
    await letData(es).have(new IndexedDocument('this/is/a/path/test.doc')).commit()
    await letData(es).have(new IndexedDocument('this/is/a/second/path/test.doc')).commit()
    await letData(es).have(new IndexedDocument('this/is/a/third/path/test.doc')).commit()

    const response = await store.dispatch('query', { name: 'path' })
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
    let facetPath = find(store.state.facets, { name: 'indexing-date' })

    facetPath.should.be.an('object')
    expect(facetPath.key).to.equal('extractionDate')
    expect(facetPath.type).to.equal('FacetText')
  })
})
