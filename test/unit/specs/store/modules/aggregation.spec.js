import { state, actions, getters } from '@/store/modules/aggregation'
import esMapping from '@/datashare_index_mappings.json'

import elasticsearch from 'elasticsearch-browser'
import Vuex from 'vuex'

import {IndexedDocument, letData} from 'test/unit/es_utils'

const store = new Vuex.Store({ state, actions, getters })

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
    await es.deleteByQuery({index: process.env.CONFIG.es_index, conflicts: 'proceed', body: {query: {match_all: {}}}})
  })

  it('should define a `content-type` facet correctly', () => {
    expect(store.state.facets[0].name).to.equal('content-type')
    expect(store.state.facets[0].type).to.equal('FacetText')
  })

  it('should count 2 pdf documents', async () => {
    await letData(es).have(new IndexedDocument('bar.pdf').withContentType('application/pdf')).commit()
    await letData(es).have(new IndexedDocument('foo.pdf').withContentType('application/pdf')).commit()

    const response = await store.dispatch('query', {name: 'content-type'})
    expect(response.aggregations.contentType.buckets.length).to.equal(1)
    expect(response.aggregations.contentType.buckets[0].doc_count).to.equal(2)
  })

  it('should count 2 pdf and 1 javascript documents', async () => {
    await letData(es).have(new IndexedDocument('bar.pdf').withContentType('application/pdf')).commit()
    await letData(es).have(new IndexedDocument('foo.pdf').withContentType('application/pdf')).commit()
    await letData(es).have(new IndexedDocument('foo.js').withContentType('text/javascript')).commit()

    const response = await store.dispatch('query', {name: 'content-type'})
    expect(response.aggregations.contentType.buckets.length).to.equal(2)
    expect(response.aggregations.contentType.buckets[0].doc_count).to.equal(2)
    expect(response.aggregations.contentType.buckets[1].doc_count).to.equal(1)
  })

  it('should count 2 pdf but have no hits', async () => {
    await letData(es).have(new IndexedDocument('bar.pdf').withContentType('application/pdf')).commit()
    await letData(es).have(new IndexedDocument('foo.pdf').withContentType('application/pdf')).commit()

    const response = await store.dispatch('query', {name: 'content-type'})
    expect(response.aggregations.contentType.buckets[0].doc_count).to.equal(2)
    expect(response.hits.length).to.equal(0)
  })
})
