import { actions, mutations } from '@/store/modules/search'
import Response from '@/api/Response'
import Document from '@/api/Document'
import NamedEntity from '@/api/NamedEntity'
import esMapping from '@/datashare_index_mappings.json'

import elasticsearch from 'elasticsearch-browser'
import Vuex from 'vuex'

import {IndexedDocument, letData} from 'test/unit/es_utils'

const state = { query: '', response: Response.none() }
const store = new Vuex.Store({ state, actions, mutations })

describe('store/module/search', () => {
  var es = new elasticsearch.Client({host: process.env.CONFIG.es_host})
  before(async () => {
    await es.indices.create({index: process.env.CONFIG.es_index})
    await es.indices.putMapping({index: process.env.CONFIG.es_index, type: 'doc', body: esMapping})
  })
  after(async () => {
    await es.indices.delete({index: process.env.CONFIG.es_index})
  })
  beforeEach(async () => {
    await es.deleteByQuery({index: process.env.CONFIG.es_index, conflicts: 'proceed', body: {query: {match_all: {}}}})
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
})
