import { actions, mutations, getters } from '@/store/modules/search'
import Response from '@/api/Response'
import Document from '@/api/Document'
import NamedEntity from '@/api/NamedEntity'
import esMapping from '@/datashare_index_mappings.json'

import elasticsearch from 'elasticsearch-browser'
import Vuex from 'vuex'
import cloneDeep from 'lodash/cloneDeep'

import {IndexedDocument, letData} from 'test/unit/es_utils'

describe('store/module/search', () => {
  var es = new elasticsearch.Client({host: process.env.CONFIG.es_host})
  var state = { query: '', response: Response.none(), facets: [] }
  var store = null

  before(async () => {
    await es.indices.create({index: process.env.CONFIG.es_index})
    await es.indices.putMapping({index: process.env.CONFIG.es_index, type: 'doc', body: esMapping})
  })
  after(async () => {
    await es.indices.delete({index: process.env.CONFIG.es_index})
  })
  beforeEach(async () => {
    await es.deleteByQuery({index: process.env.CONFIG.es_index, conflicts: 'proceed', body: {query: {match_all: {}}}})
    store = new Vuex.Store({ state: cloneDeep(state), actions, mutations, getters })
  })

  it('should define a store module', () => {
    expect(store.state).to.not.equal(undefined)
  })

  it('should change the state after `query` mutation', () => {
    store.commit('query', 'bar')
    expect(store.state.query).to.equal('bar')
  })

  it('should change query value after `query` action', () => {
    store.commit('query', 'bar')
    store.dispatch('query', 'foo')
    expect(store.state.query).to.equal('foo')
  })

  it('should build a Response object from raw value', () => {
    store.commit('buildResponse', {
      hits: {
        hits: [
          { _source: { type: 'Document' }, _id: 'foo' },
          { _source: { type: 'NamedEntity' }, _id: 'bar' }
        ]
      }
    })
    assert(store.state.response instanceof Response)
  })

  it('should build a correct Response object from raw value', () => {
    store.commit('buildResponse', {
      hits: {
        hits: [
          { _source: { type: 'Document' }, _id: 'foo' },
          { _source: { type: 'NamedEntity' }, _id: 'bar' }
        ]
      }
    })
    assert.instanceOf(store.state.response.hits[0], Document)
    assert.instanceOf(store.state.response.hits[1], NamedEntity)
    assert.isUndefined(store.state.response.hits[2])
  })

  it('should get document from ElsaticSearch', async () => {
    await letData(es).have(new IndexedDocument('docs/bar.txt').withContent('this is bar document')).commit()
    await store.dispatch('query', 'bar')
    expect(store.state.response.hits.length).to.equal(1)
    expect(store.state.response.hits[0].basename).to.equal('bar.txt')
  })

  it('should found 2 documents filtered by one contentType', async () => {
    await letData(es).have(new IndexedDocument('bar.txt').withContentType('txt').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('foo.txt').withContentType('txt').withContent('foo')).commit()
    await letData(es).have(new IndexedDocument('bar.pdf').withContentType('pdf').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('foo.pdf').withContentType('pdf').withContent('foo')).commit()

    await store.dispatch('query', '*')
    expect(store.state.response.hits.length).to.equal(4)
    await store.dispatch('addFacetValue', { field: 'contentType', value: 'pdf' })
    expect(store.state.response.hits.length).to.equal(2)
  })

  it('should found 3 documents filtered by two contentType', async () => {
    await letData(es).have(new IndexedDocument('bar.txt').withContentType('txt').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.pdf').withContentType('pdf').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.csv').withContentType('csv').withContent('bar')).commit()

    await store.dispatch('query', '*')
    expect(store.state.response.hits.length).to.equal(3)
    await store.dispatch('addFacetValue', { field: 'contentType', value: 'pdf' })
    expect(store.state.response.hits.length).to.equal(1)
    await store.dispatch('addFacetValue', { field: 'contentType', value: 'csv' })
    expect(store.state.response.hits.length).to.equal(2)
  })

  it('should not found documents after filter by contentType', async () => {
    await letData(es).have(new IndexedDocument('bar.txt').withContentType('txt').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.pdf').withContentType('pdf').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.csv').withContentType('csv').withContent('bar')).commit()

    await store.dispatch('query', '*')
    expect(store.state.response.hits.length).to.equal(3)
    await store.dispatch('addFacetValue', { field: 'contentType', value: 'ico' })
    expect(store.state.response.hits.length).to.equal(0)
  })

  it('should found documents after removing filter by contentType', async () => {
    await letData(es).have(new IndexedDocument('bar.txt').withContentType('txt').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.pdf').withContentType('pdf').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.csv').withContentType('csv').withContent('bar')).commit()

    await store.dispatch('query', '*')
    expect(store.state.response.hits.length).to.equal(3)
    await store.dispatch('addFacetValue', { field: 'contentType', value: 'ico' })
    expect(store.state.response.hits.length).to.equal(0)
    await store.dispatch('removeFacetValue', { field: 'contentType', value: 'ico' })
    expect(store.state.response.hits.length).to.equal(3)
  })

  it('should exclude documents with a specific contentType', async () => {
    await letData(es).have(new IndexedDocument('bar.txt').withContentType('txt').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.pdf').withContentType('pdf').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.csv').withContentType('csv').withContent('bar')).commit()

    await store.dispatch('query', '*')
    expect(store.state.response.hits.length).to.equal(3)
    await store.dispatch('addFacetValue', { field: 'contentType', value: 'txt' })
    expect(store.state.response.hits.length).to.equal(1)
    await store.dispatch('invertFacet', 'contentType')
    expect(store.state.response.hits.length).to.equal(2)
  })

  it('should exclude documents with a specific contentType and include them again', async () => {
    await letData(es).have(new IndexedDocument('bar.txt').withContentType('txt').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('foo.txt').withContentType('txt').withContent('foo')).commit()
    await letData(es).have(new IndexedDocument('bar.pdf').withContentType('pdf').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.csv').withContentType('csv').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.ico').withContentType('ico').withContent('bar')).commit()

    await store.dispatch('query', '*')
    await store.dispatch('addFacetValue', { field: 'contentType', value: 'txt' })
    await store.dispatch('invertFacet', 'contentType')
    expect(store.state.response.hits.length).to.equal(3)
    await store.dispatch('invertFacet', 'contentType')
    expect(store.state.response.hits.length).to.equal(2)
  })

  it('should take into account the given facet', async () => {
    assert(!store.getters.hasFacetValues('contentType'))
    await store.dispatch('addFacetValue', { field: 'contentType', value: 'txt' })
    assert(store.getters.hasFacetValues('contentType'))
  })

  it('should take into account the given facet but not an arbitrary one', async () => {
    await store.dispatch('addFacetValue', { field: 'foo', value: 'txt' })
    assert(store.getters.hasFacetValues('foo'))
    assert(!store.getters.hasFacetValues('bar'))
  })

  it('should take into account the given facet and its invert', async () => {
    await store.dispatch('addFacetValue', { field: 'foo', value: 'txt' })
    assert(store.getters.hasFacetValues('foo'))
    assert(!store.getters.isFacetReversed('foo'))
    await store.dispatch('invertFacet', 'foo')
    assert(store.getters.isFacetReversed('foo'))
  })

  it('should take into reverse a facet and not the others', async () => {
    await store.dispatch('addFacetValue', { field: 'foo', value: 'txt' })
    await store.dispatch('addFacetValue', { field: 'bar', value: 'txt' })
    await store.dispatch('invertFacet', 'foo')
    assert(store.getters.isFacetReversed('foo'))
    assert(!store.getters.isFacetReversed('bar'))
  })

  it('should add facet with several values', async () => {
    await store.dispatch('addFacetValue', { field: 'foo', value: ['txt', 'pdf'] })
    expect(store.getters.findFacet('foo').values).to.have.lengthOf(2)
  })

  it('should merge facet values with several other values', async () => {
    await store.dispatch('addFacetValue', { field: 'foo', value: 'txt' })
    expect(store.getters.findFacet('foo').values).to.have.lengthOf(1)
    await store.dispatch('addFacetValue', { field: 'foo', value: ['csv', 'pdf'] })
    expect(store.getters.findFacet('foo').values).to.have.lengthOf(3)
  })

  it('should add a facet value only once', async () => {
    await store.dispatch('addFacetValue', { field: 'foo', value: 'txt' })
    expect(store.getters.findFacet('foo').values).to.have.lengthOf(1)
    await store.dispatch('addFacetValue', { field: 'foo', value: 'txt' })
    expect(store.getters.findFacet('foo').values).to.have.lengthOf(1)
  })

  it('should add facet values only once', async () => {
    await store.dispatch('addFacetValue', { field: 'foo', value: ['txt', 'csv'] })
    expect(store.getters.findFacet('foo').values).to.have.lengthOf(2)
    await store.dispatch('addFacetValue', { field: 'foo', value: 'txt' })
    expect(store.getters.findFacet('foo').values).to.have.lengthOf(2)
    await store.dispatch('addFacetValue', { field: 'foo', value: ['csv'] })
    expect(store.getters.findFacet('foo').values).to.have.lengthOf(2)
    await store.dispatch('addFacetValue', { field: 'foo', value: ['csv', 'pdf'] })
    expect(store.getters.findFacet('foo').values).to.have.lengthOf(3)
  })
})
