import { state, actions, getters, mutations } from '@/store/modules/aggregation'
import esMapping from '@/datashare_index_mappings.json'

import elasticsearch from 'elasticsearch-browser'
import Vuex from 'vuex'
import cloneDeep from 'lodash/cloneDeep'

import {IndexedDocument, letData} from 'test/unit/es_utils'

let store = null

describe('store/module/aggregation', () => {
  var es = new elasticsearch.Client({host: process.env.CONFIG.es_host})
  before(async () => {
    await es.indices.create({index: process.env.CONFIG.es_index})
    await es.indices.putMapping({index: process.env.CONFIG.es_index, type: 'doc', body: esMapping})
  })
  after(async () => {
    await es.indices.delete({index: process.env.CONFIG.es_index})
  })
  beforeEach(async () => {
    // Recreate the store before every test to preserve the intial step
    store = new Vuex.Store({ state: cloneDeep(state), actions, getters, mutations })
    await es.deleteByQuery({index: process.env.CONFIG.es_index, conflicts: 'proceed', refresh: true, body: {query: {match_all: {}}}})
  })

  it('should define a `content-type` facet correctly', () => {
    expect(store.state.facets[0].name).to.equal('content-type')
    expect(store.state.facets[0].type).to.equal('FacetText')
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

  it('should have a facet with a build method', () => {
    expect(store.state.facets[0].body).to.respondTo('build')
  })

  it('should add a facet', () => {
    expect(store.state.facets).to.have.lengthOf(state.facets.length)
    store.commit('addFacet', { name: 'test', type: null, body: null })
    expect(store.state.facets).to.have.lengthOf(state.facets.length + 1)
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
})
