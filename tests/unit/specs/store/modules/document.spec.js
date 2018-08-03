import { expect } from 'chai'

import store from '@/store'
import { initialState } from '@/store/modules/document'
import { IndexedDocument, letData } from '../../../es_utils'
import esConnectionHelper from '../../utils/esConnectionHelper'

describe('Document store', () => {
  esConnectionHelper()
  let es = esConnectionHelper.es

  afterEach(async () => store.commit('document/reset'))

  it('should define a store module', () => {
    expect(store.state.document).to.not.equal(undefined)
  })

  it('should reset the store state', async () => {
    await store.commit('document/reset')
    expect(store.state.document).to.deep.equal(initialState())
  })

  it('should get the document', async () => {
    let doc = new IndexedDocument('doc.txt').withContent('This is the document.')
    await letData(es).have(doc).commit()
    await store.dispatch('search/query', 'document')
    let docNode = store.state.search.response.hits

    await store.dispatch('document/get', { id: docNode[0].id })
    expect(store.state.document.doc.id).to.equal(docNode[0].id)
  })

  it('should get the document\'s named entities', async () => {
    let doc = new IndexedDocument('doc.txt').withContent('This is the document.').withNer('naz')
    await letData(es).have(doc).commit()
    await store.dispatch('search/query', 'document')
    let docNode = store.state.search.response.hits

    await store.dispatch('document/get', { id: docNode[0].id })
    await store.dispatch('document/getNamedEntities')
    expect(store.state.document.namedEntities[0].raw._source.mention).to.equal('naz')
    expect(store.state.document.namedEntities[0].raw._routing).to.equal('doc.txt')
  })

  it('should get the parent document', async () => {
    let parent = new IndexedDocument('parent.txt').withContent('This is parent.')
    await letData(es).have(parent).commit()
    await store.dispatch('search/query', 'parent')
    let parentNode = store.state.search.response.hits

    let child = new IndexedDocument('child.txt').withContent('This is child.').withParent(parentNode[0].id)
    await letData(es).have(child).commit()
    await store.dispatch('search/query', 'child')
    let childNode = store.state.search.response.hits

    await store.dispatch('document/get', { id: childNode[0].id, routing: childNode[0].routing })
    await store.dispatch('document/getParent')
    expect(store.state.document.parentDoc.id).to.equal(parentNode[0].id)
  })
})
