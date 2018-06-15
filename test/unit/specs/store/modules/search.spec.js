import { state, actions, mutations, getters } from '@/store/modules/search'
import Response from '@/api/Response'
import Document from '@/api/Document'
import NamedEntity from '@/api/NamedEntity'

import Vuex from 'vuex'

import {IndexedDocument, letData} from 'test/unit/es_utils'
import esConnectionHelper from 'test/unit/specs/utils/esConnectionHelper'

describe('store/module/search', () => {
  esConnectionHelper()
  var es = esConnectionHelper.es
  var store = null

  beforeEach(async () => {
    store = new Vuex.Store({ state, actions, mutations, getters })
    // Reset default search not to inherit from previous searches
    store.commit('clear')
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

  it('should found 2 documents filtered by one content-type', async () => {
    await letData(es).have(new IndexedDocument('bar.txt').withContentType('txt').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('foo.txt').withContentType('txt').withContent('foo')).commit()
    await letData(es).have(new IndexedDocument('bar.pdf').withContentType('pdf').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('foo.pdf').withContentType('pdf').withContent('foo')).commit()

    await store.dispatch('query', '*')
    expect(store.state.response.hits.length).to.equal(4)
    await store.dispatch('addFacetValue', { name: 'content-type', value: 'pdf' })
    expect(store.state.response.hits.length).to.equal(2)
  })

  it('should found 3 documents filtered by two content-type', async () => {
    await letData(es).have(new IndexedDocument('bar.txt').withContentType('txt').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.pdf').withContentType('pdf').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.csv').withContentType('csv').withContent('bar')).commit()

    await store.dispatch('query', '*')
    expect(store.state.response.hits.length).to.equal(3)
    await store.dispatch('addFacetValue', { name: 'content-type', value: 'pdf' })
    expect(store.state.response.hits.length).to.equal(1)
    await store.dispatch('addFacetValue', { name: 'content-type', value: 'csv' })
    expect(store.state.response.hits.length).to.equal(2)
  })

  it('should not found documents after filter by content-type', async () => {
    await letData(es).have(new IndexedDocument('bar.txt').withContentType('txt').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.pdf').withContentType('pdf').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.csv').withContentType('csv').withContent('bar')).commit()

    await store.dispatch('query', '*')
    expect(store.state.response.hits.length).to.equal(3)
    await store.dispatch('addFacetValue', { name: 'content-type', value: 'ico' })
    expect(store.state.response.hits.length).to.equal(0)
  })

  it('should found documents after removing filter by content-type', async () => {
    await letData(es).have(new IndexedDocument('bar.txt').withContentType('txt').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.pdf').withContentType('pdf').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.csv').withContentType('csv').withContent('bar')).commit()

    await store.dispatch('query', '*')
    expect(store.state.response.hits.length).to.equal(3)
    await store.dispatch('addFacetValue', { name: 'content-type', value: 'ico' })
    expect(store.state.response.hits.length).to.equal(0)
    await store.dispatch('removeFacetValue', { name: 'content-type', value: 'ico' })
    expect(store.state.response.hits.length).to.equal(3)
  })

  it('should exclude documents with a specific content-type', async () => {
    await letData(es).have(new IndexedDocument('bar.txt').withContentType('txt').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.pdf').withContentType('pdf').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.csv').withContentType('csv').withContent('bar')).commit()

    await store.dispatch('query', '*')
    expect(store.state.response.hits.length).to.equal(3)
    await store.dispatch('addFacetValue', { name: 'content-type', value: 'txt' })
    expect(store.state.response.hits.length).to.equal(1)
    await store.dispatch('toggleFacet', 'content-type')
    expect(store.state.response.hits.length).to.equal(2)
  })

  it('should exclude documents with a specific content-type and include them again', async () => {
    await letData(es).have(new IndexedDocument('bar.txt').withContentType('txt').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('foo.txt').withContentType('txt').withContent('foo')).commit()
    await letData(es).have(new IndexedDocument('bar.pdf').withContentType('pdf').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.csv').withContentType('csv').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('bar.ico').withContentType('ico').withContent('bar')).commit()

    await store.dispatch('query', '*')
    await store.dispatch('addFacetValue', { name: 'content-type', value: 'txt' })
    await store.dispatch('toggleFacet', 'content-type')
    expect(store.state.response.hits.length).to.equal(3)
    await store.dispatch('toggleFacet', 'content-type')
    expect(store.state.response.hits.length).to.equal(2)
  })

  it('should take into account the given facet', async () => {
    assert(!store.getters.hasFacetValues('content-type'))
    await store.dispatch('addFacetValue', { name: 'content-type', value: 'txt' })
    assert(store.getters.hasFacetValues('content-type'))
  })

  it('should take into account the given facet but not an arbitrary one', async () => {
    await store.dispatch('addFacetValue', { name: 'content-type', value: 'txt' })
    assert(store.getters.hasFacetValues('content-type'))
    assert(!store.getters.hasFacetValues('bar'))
  })

  it('should take into account the given facet and its invert', async () => {
    await store.dispatch('addFacetValue', { name: 'content-type', value: 'txt' })
    assert(store.getters.hasFacetValues('content-type'))
    assert(!store.getters.isFacetReversed('content-type'))
    await store.dispatch('toggleFacet', 'content-type')
    assert(store.getters.isFacetReversed('content-type'))
  })

  it('should take into reverse a facet and not the others', async () => {
    await store.dispatch('addFacetValue', { name: 'content-type', value: 'txt' })
    await store.dispatch('addFacetValue', { name: 'language', value: 'fr' })
    await store.dispatch('toggleFacet', 'content-type')
    assert(store.getters.isFacetReversed('content-type'))
    assert(!store.getters.isFacetReversed('language'))
  })

  it('should add facet with several values', async () => {
    await store.dispatch('addFacetValue', { name: 'content-type', value: ['txt', 'pdf'] })
    expect(store.getters.findFacet('content-type').values).to.have.lengthOf(2)
  })

  it('should merge facet values with several other values', async () => {
    await store.dispatch('addFacetValue', { name: 'content-type', value: 'txt' })
    expect(store.getters.findFacet('content-type').values).to.have.lengthOf(1)
    await store.dispatch('addFacetValue', { name: 'content-type', value: ['csv', 'pdf'] })
    expect(store.getters.findFacet('content-type').values).to.have.lengthOf(3)
  })

  it('should add a facet value only once', async () => {
    await store.dispatch('addFacetValue', { name: 'content-type', value: 'txt' })
    expect(store.getters.findFacet('content-type').values).to.have.lengthOf(1)
    await store.dispatch('addFacetValue', { name: 'content-type', value: 'txt' })
    expect(store.getters.findFacet('content-type').values).to.have.lengthOf(1)
  })

  it('should add facet values only once', async () => {
    await store.dispatch('addFacetValue', { name: 'content-type', value: ['txt', 'csv'] })
    expect(store.getters.findFacet('content-type').values).to.have.lengthOf(2)
    await store.dispatch('addFacetValue', { name: 'content-type', value: 'txt' })
    expect(store.getters.findFacet('content-type').values).to.have.lengthOf(2)
    await store.dispatch('addFacetValue', { name: 'content-type', value: ['csv'] })
    expect(store.getters.findFacet('content-type').values).to.have.lengthOf(2)
    await store.dispatch('addFacetValue', { name: 'content-type', value: ['csv', 'pdf'] })
    expect(store.getters.findFacet('content-type').values).to.have.lengthOf(3)
  })

  it('should return 2 documents', async () => {
    await letData(es).have(new IndexedDocument('doc_01.txt').withContent('this is the first document')).commit()
    await letData(es).have(new IndexedDocument('doc_02.txt').withContent('this is the second document')).commit()
    await letData(es).have(new IndexedDocument('doc_03.txt').withContent('this is the third document')).commit()
    await letData(es).have(new IndexedDocument('doc_04.txt').withContent('this is the fourth document')).commit()

    await store.dispatch('query', { query: 'document', from: 0, size: 2 })
    expect(store.state.response.hits.length).to.equal(2)
  })

  it('should return 3 documents', async () => {
    await letData(es).have(new IndexedDocument('doc_01.txt').withContent('this is the first document')).commit()
    await letData(es).have(new IndexedDocument('doc_02.txt').withContent('this is the second document')).commit()
    await letData(es).have(new IndexedDocument('doc_03.txt').withContent('this is the third document')).commit()
    await letData(es).have(new IndexedDocument('doc_04.txt').withContent('this is the fourth document')).commit()

    await store.dispatch('query', { query: 'document', from: 0, size: 3 })
    expect(store.state.response.hits.length).to.equal(3)
  })

  it('should return 1 document', async () => {
    await letData(es).have(new IndexedDocument('doc_01.txt').withContent('this is the first document')).commit()
    await letData(es).have(new IndexedDocument('doc_02.txt').withContent('this is the second document')).commit()
    await letData(es).have(new IndexedDocument('doc_03.txt').withContent('this is the third document')).commit()
    await letData(es).have(new IndexedDocument('doc_04.txt').withContent('this is the fourth document')).commit()

    await store.dispatch('query', { query: 'document', from: 3, size: 3 })
    expect(store.state.response.hits.length).to.equal(1)
  })

  it('should return 1 document', async () => {
    await letData(es).have(new IndexedDocument('doc_01.txt').withContent('this is the first document')).commit()
    await letData(es).have(new IndexedDocument('doc_02.txt').withContent('this is the second document')).commit()
    await letData(es).have(new IndexedDocument('doc_03.txt').withContent('this is the third document')).commit()
    await letData(es).have(new IndexedDocument('doc_04.txt').withContent('this is the fourth document')).commit()

    await store.dispatch('query', { query: 'document', from: 0, size: 3 })
    await store.dispatch('nextPage')
    expect(store.state.from).to.equal(3)
    expect(store.state.response.hits.length).to.equal(1)
  })

  it('should return 1 document', async () => {
    await letData(es).have(new IndexedDocument('doc_01.txt').withContent('this is the first document')).commit()
    await letData(es).have(new IndexedDocument('doc_02.txt').withContent('this is the second document')).commit()
    await letData(es).have(new IndexedDocument('doc_03.txt').withContent('this is the third document')).commit()
    await letData(es).have(new IndexedDocument('doc_04.txt').withContent('this is the fourth document')).commit()

    await store.dispatch('query', { query: 'document', from: 0, size: 3 })
    await store.dispatch('nextPage')
    await store.dispatch('nextPage')
    expect(store.state.from).to.equal(3)
    expect(store.state.response.hits.length).to.equal(1)
  })

  it('should return 4 documents on the first page', async () => {
    await letData(es).have(new IndexedDocument('doc_01.txt').withContent('this is the first document')).commit()
    await letData(es).have(new IndexedDocument('doc_02.txt').withContent('this is the second document')).commit()
    await letData(es).have(new IndexedDocument('doc_03.txt').withContent('this is the third document')).commit()
    await letData(es).have(new IndexedDocument('doc_04.txt').withContent('this is the fourth document')).commit()

    await store.dispatch('firstPage')
    expect(store.state.from).to.equal(0)
    expect(store.state.response.hits.length).to.equal(4)
  })

  it('should return 3 documents on the first page', async () => {
    await letData(es).have(new IndexedDocument('doc_01.txt').withContent('this is the first document')).commit()
    await letData(es).have(new IndexedDocument('doc_02.txt').withContent('this is the second document')).commit()
    await letData(es).have(new IndexedDocument('doc_03.txt').withContent('this is the third document')).commit()
    await letData(es).have(new IndexedDocument('doc_04.txt').withContent('this is the fourth document')).commit()
    // await letData(es).have(new IndexedDocuments().baseName("doc").count(4)).commit()

    await store.dispatch('query', { query: 'document', from: 0, size: 3 })
    await store.dispatch('nextPage')
    await store.dispatch('nextPage')
    await store.dispatch('firstPage')
    expect(store.state.from).to.equal(0)
    expect(store.state.response.hits.length).to.equal(3)
  })

  it('should return 2 documents on the second page', async () => {
    await letData(es).have(new IndexedDocument('doc_01.txt').withContent('this is the first document')).commit()
    await letData(es).have(new IndexedDocument('doc_02.txt').withContent('this is the second document')).commit()
    await letData(es).have(new IndexedDocument('doc_03.txt').withContent('this is the third document')).commit()
    await letData(es).have(new IndexedDocument('doc_04.txt').withContent('this is the fourth document')).commit()
    await letData(es).have(new IndexedDocument('doc_05.txt').withContent('this is the fifth document')).commit()

    await store.dispatch('query', { query: 'document', from: 0, size: 2 })
    await store.dispatch('nextPage')
    await store.dispatch('nextPage')
    await store.dispatch('previousPage')
    expect(store.state.from).to.equal(2)
    expect(store.state.response.hits.length).to.equal(2)
  })

  it('should return 0 documents in total', async () => {
    await store.dispatch('query', '*')
    expect(store.state.response.total).to.equal(0)
  })

  it('should return 5 documents in total', async () => {
    await letData(es).have(new IndexedDocument('doc_01.txt').withContent('this is the first document')).commit()
    await letData(es).have(new IndexedDocument('doc_02.txt').withContent('this is the second document')).commit()
    await letData(es).have(new IndexedDocument('doc_03.txt').withContent('this is the third document')).commit()
    await letData(es).have(new IndexedDocument('doc_04.txt').withContent('this is the fourth document')).commit()
    await letData(es).have(new IndexedDocument('doc_05.txt').withContent('this is the fifth document')).commit()

    await store.dispatch('query', { query: 'document', from: 0, size: 2 })
    expect(store.state.response.total).to.equal(5)
  })

  it('should return the last page whose contains 2 documents', async () => {
    await letData(es).have(new IndexedDocument('doc_01.txt').withContent('this is the first document')).commit()
    await letData(es).have(new IndexedDocument('doc_02.txt').withContent('this is the second document')).commit()
    await letData(es).have(new IndexedDocument('doc_03.txt').withContent('this is the third document')).commit()
    await letData(es).have(new IndexedDocument('doc_04.txt').withContent('this is the fourth document')).commit()
    await letData(es).have(new IndexedDocument('doc_05.txt').withContent('this is the fifth document')).commit()

    await store.dispatch('query', { query: 'document', from: 0, size: 3 })
    await store.dispatch('lastPage')
    expect(store.state.from).to.equal(3)
    expect(store.state.response.hits.length).to.equal(2)
  })
})
