import store from '@/store'
import { initialState } from '@/store/modules/search'
import Response from '@/api/Response'
import Document from '@/api/Document'
import NamedEntity from '@/api/NamedEntity'

import { IndexedDocuments, IndexedDocument, letData } from '../../../es_utils'
import esConnectionHelper from '../../utils/esConnectionHelper'
import cloneDeep from 'lodash/cloneDeep'
import { expect, assert } from 'chai'

describe('Search store', () => {
  esConnectionHelper()
  let es = esConnectionHelper.es

  afterEach(async () => store.commit('search/reset'))

  it('should define a store module', () => {
    expect(store.state.search).to.not.equal(undefined)
  })

  it('should reset the store state', async () => {
    await store.commit('search/reset')
    expect(store.state.search).to.deep.equal(initialState())
  })

  it('should change the state after `query` mutation', () => {
    store.commit('search/query', 'bar')
    expect(store.state.search.query).to.equal('bar')
  })

  it('should change query value after `query` action', () => {
    store.commit('search/query', 'bar')
    store.dispatch('search/query', 'foo')
    expect(store.state.search.query).to.equal('foo')
  })

  it('should build a Response object from raw value', () => {
    store.commit('search/buildResponse', {
      hits: {
        hits: [
          { _source: { type: 'Document' }, _id: 'foo' },
          { _source: { type: 'NamedEntity' }, _id: 'bar' }
        ]
      }
    })
    assert(store.state.search.response instanceof Response)
  })

  it('should build a correct Response object from raw value', () => {
    store.commit('search/buildResponse', {
      hits: {
        hits: [
          { _source: { type: 'Document' }, _id: 'foo' },
          { _source: { type: 'NamedEntity' }, _id: 'bar' }
        ]
      }
    })
    expect(store.state.search.response.hits[0]).to.be.instanceOf(Document)
    expect(store.state.search.response.hits[1]).to.be.instanceOf(NamedEntity)
    expect(store.state.search.response.hits[2]).to.equal(undefined)
  })

  it('should get document from ElsaticSearch', async () => {
    await letData(es).have(new IndexedDocument('docs/bar.txt').withContent('this is bar document')).commit()
    await store.dispatch('search/query', 'bar')
    expect(store.state.search.response.hits.length).to.equal(1)
    expect(store.state.search.response.hits[0].basename).to.equal('bar.txt')
  })

  it('should found 2 documents filtered by one content-type', async () => {
    await letData(es).have(new IndexedDocument('bar.txt').withContentType('txt').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('foo.txt').withContentType('txt').withContent('foo')).commit()
    await letData(es).have(new IndexedDocument('bar.pdf').withContentType('pdf').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('foo.pdf').withContentType('pdf').withContent('foo')).commit()

    await store.dispatch('search/query', '*')
    expect(store.state.search.response.hits.length).to.equal(4)
    await store.dispatch('search/addFacetValue', { name: 'content-type', value: 'pdf' })
    expect(store.state.search.response.hits.length).to.equal(2)
  })

  it('should found 3 documents filtered by two content-type', async () => {
    await letData(es).have(new IndexedDocument('bar.txt').withContentType('txt').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.pdf').withContentType('pdf').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.csv').withContentType('csv').withContent('bar')).commit()

    await store.dispatch('search/query', '*')
    expect(store.state.search.response.hits.length).to.equal(3)
    await store.dispatch('search/addFacetValue', { name: 'content-type', value: 'pdf' })
    expect(store.state.search.response.hits.length).to.equal(1)
    await store.dispatch('search/addFacetValue', { name: 'content-type', value: 'csv' })
    expect(store.state.search.response.hits.length).to.equal(2)
  })

  it('should not found documents after filter by content-type', async () => {
    await letData(es).have(new IndexedDocument('bar.txt').withContentType('txt').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.pdf').withContentType('pdf').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.csv').withContentType('csv').withContent('bar')).commit()

    await store.dispatch('search/query', '*')
    expect(store.state.search.response.hits.length).to.equal(3)
    await store.dispatch('search/addFacetValue', { name: 'content-type', value: 'ico' })
    expect(store.state.search.response.hits.length).to.equal(0)
  })

  it('should found documents after removing filter by content-type', async () => {
    await letData(es).have(new IndexedDocument('bar.txt').withContentType('txt').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.pdf').withContentType('pdf').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.csv').withContentType('csv').withContent('bar')).commit()

    await store.dispatch('search/query', '*')
    expect(store.state.search.response.hits.length).to.equal(3)
    await store.dispatch('search/addFacetValue', { name: 'content-type', value: 'ico' })
    expect(store.state.search.response.hits.length).to.equal(0)
    await store.dispatch('search/removeFacetValue', { name: 'content-type', value: 'ico' })
    expect(store.state.search.response.hits.length).to.equal(3)
  })

  it('should exclude documents with a specific content-type', async () => {
    await letData(es).have(new IndexedDocument('bar.txt').withContentType('txt').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.pdf').withContentType('pdf').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.csv').withContentType('csv').withContent('bar')).commit()

    await store.dispatch('search/query', '*')
    expect(store.state.search.response.hits.length).to.equal(3)
    await store.dispatch('search/addFacetValue', { name: 'content-type', value: 'txt' })
    expect(store.state.search.response.hits.length).to.equal(1)
    await store.dispatch('search/toggleFacet', 'content-type')
    expect(store.state.search.response.hits.length).to.equal(2)
  })

  it('should exclude documents with a specific content-type and include them again', async () => {
    await letData(es).have(new IndexedDocument('bar.txt').withContentType('txt').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('foo.txt').withContentType('txt').withContent('foo')).commit()
    await letData(es).have(new IndexedDocument('bar.pdf').withContentType('pdf').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.csv').withContentType('csv').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.ico').withContentType('ico').withContent('bar')).commit()

    await store.dispatch('search/query', '*')
    await store.dispatch('search/addFacetValue', { name: 'content-type', value: 'txt' })
    await store.dispatch('search/toggleFacet', 'content-type')
    expect(store.state.search.response.hits.length).to.equal(3)
    await store.dispatch('search/toggleFacet', 'content-type')
    expect(store.state.search.response.hits.length).to.equal(2)
  })

  it('should take into account the given facet', async () => {
    assert(!store.getters['search/hasFacetValues']('content-type'))
    await store.dispatch('search/addFacetValue', { name: 'content-type', value: 'txt' })
    assert(store.getters['search/hasFacetValues']('content-type'))
  })

  it('should take into account the given facet but not an arbitrary one', async () => {
    await store.dispatch('search/addFacetValue', { name: 'content-type', value: 'txt' })
    assert(store.getters['search/hasFacetValues']('content-type'))
    assert(!store.getters['search/hasFacetValues']('bar'))
  })

  it('should take into account the given facet and its invert', async () => {
    await store.dispatch('search/addFacetValue', { name: 'content-type', value: 'txt' })
    assert(store.getters['search/hasFacetValues']('content-type'))
    assert(!store.getters['search/isFacetReversed']('content-type'))
    await store.dispatch('search/toggleFacet', 'content-type')
    assert(store.getters['search/isFacetReversed']('content-type'))
  })

  it('should take into reverse a facet and not the others', async () => {
    await store.dispatch('search/addFacetValue', { name: 'content-type', value: 'txt' })
    await store.dispatch('search/addFacetValue', { name: 'language', value: 'fr' })
    await store.dispatch('search/toggleFacet', 'content-type')
    assert(store.getters['search/isFacetReversed']('content-type'))
    assert(!store.getters['search/isFacetReversed']('language'))
  })

  it('should add facet with several values', async () => {
    await store.dispatch('search/addFacetValue', { name: 'content-type', value: ['txt', 'pdf'] })
    expect(store.getters['search/findFacet']('content-type').values).to.have.lengthOf(2)
  })

  it('should merge facet values with several other values', async () => {
    await store.dispatch('search/addFacetValue', { name: 'content-type', value: 'txt' })
    expect(store.getters['search/findFacet']('content-type').values).to.have.lengthOf(1)
    await store.dispatch('search/addFacetValue', { name: 'content-type', value: ['csv', 'pdf'] })
    expect(store.getters['search/findFacet']('content-type').values).to.have.lengthOf(3)
  })

  it('should add a facet value only once', async () => {
    await store.dispatch('search/addFacetValue', { name: 'content-type', value: 'txt' })
    expect(store.getters['search/findFacet']('content-type').values).to.have.lengthOf(1)
    await store.dispatch('search/addFacetValue', { name: 'content-type', value: 'txt' })
    expect(store.getters['search/findFacet']('content-type').values).to.have.lengthOf(1)
  })

  it('should add facet values only once', async () => {
    await store.dispatch('search/addFacetValue', { name: 'content-type', value: ['txt', 'csv'] })
    expect(store.getters['search/findFacet']('content-type').values).to.have.lengthOf(2)
    await store.dispatch('search/addFacetValue', { name: 'content-type', value: 'txt' })
    expect(store.getters['search/findFacet']('content-type').values).to.have.lengthOf(2)
    await store.dispatch('search/addFacetValue', { name: 'content-type', value: ['csv'] })
    expect(store.getters['search/findFacet']('content-type').values).to.have.lengthOf(2)
    await store.dispatch('search/addFacetValue', { name: 'content-type', value: ['csv', 'pdf'] })
    expect(store.getters['search/findFacet']('content-type').values).to.have.lengthOf(3)
  })

  it('should return 2 documents', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('this is a document').count(4)).commit()

    await store.dispatch('search/query', { query: 'document', from: 0, size: 2 })
    expect(store.state.search.response.hits.length).to.equal(2)
  })

  it('should return 3 documents', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('this is a document').count(4)).commit()

    await store.dispatch('search/query', { query: 'document', from: 0, size: 3 })
    expect(store.state.search.response.hits.length).to.equal(3)
  })

  it('should return 1 document', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('this is a document').count(4)).commit()

    await store.dispatch('search/query', { query: 'document', from: 3, size: 3 })
    expect(store.state.search.response.hits.length).to.equal(1)
  })

  it('should return 1 document', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('this is a document').count(4)).commit()

    await store.dispatch('search/query', { query: 'document', from: 0, size: 3 })
    await store.dispatch('search/nextPage')
    expect(store.state.search.from).to.equal(3)
    expect(store.state.search.response.hits.length).to.equal(1)
  })

  it('should return 1 document', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('this is a document').count(4)).commit()

    await store.dispatch('search/query', { query: 'document', from: 0, size: 3 })
    await store.dispatch('search/nextPage')
    await store.dispatch('search/nextPage')
    expect(store.state.search.from).to.equal(3)
    expect(store.state.search.response.hits.length).to.equal(1)
  })

  it('should return 4 documents on the first page', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('this is a document').count(4)).commit()

    await store.dispatch('search/firstPage')
    expect(store.state.search.from).to.equal(0)
    expect(store.state.search.response.hits.length).to.equal(4)
  })

  it('should return 3 documents on the first page', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('this is a document').count(4)).commit()

    await store.dispatch('search/query', { query: 'document', from: 0, size: 3 })
    await store.dispatch('search/nextPage')
    await store.dispatch('search/nextPage')
    await store.dispatch('search/firstPage')
    expect(store.state.search.from).to.equal(0)
    expect(store.state.search.response.hits.length).to.equal(3)
  })

  it('should return 2 documents on the second page', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('this is a document').count(5)).commit()

    await store.dispatch('search/query', { query: 'document', from: 0, size: 2 })
    await store.dispatch('search/nextPage')
    await store.dispatch('search/nextPage')
    await store.dispatch('search/previousPage')
    expect(store.state.search.from).to.equal(2)
    expect(store.state.search.response.hits.length).to.equal(2)
  })

  it('should return 0 documents in total', async () => {
    await store.dispatch('search/query', '*')
    expect(store.state.search.response.total).to.equal(0)
  })

  it('should return 5 documents in total', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('this is a document').count(5)).commit()

    await store.dispatch('search/query', { query: 'document', from: 0, size: 2 })
    expect(store.state.search.response.total).to.equal(5)
  })

  it('should return the last page whose contains 2 documents', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('this is a document').count(5)).commit()

    await store.dispatch('search/query', { query: 'document', from: 0, size: 3 })
    await store.dispatch('search/lastPage')
    expect(store.state.search.from).to.equal(3)
    expect(store.state.search.response.hits.length).to.equal(2)
  })
})
