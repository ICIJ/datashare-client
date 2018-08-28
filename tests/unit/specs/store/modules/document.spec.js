import store from '@/store'
import { initialState } from '@/store/modules/document'
import { IndexedDocument, letData } from '../../../es_utils'
import esConnectionHelper from '../../utils/esConnectionHelper'

describe('Document store', () => {
  esConnectionHelper()
  let es = esConnectionHelper.es

  afterEach(async () => store.commit('document/reset'))

  it('should define a store module', () => {
    expect(store.state.document).not.toEqual(undefined)
  })

  it('should reset the store state', async () => {
    await store.commit('document/reset')
    expect(store.state.document).toEqual(initialState())
  })

  it('should get the document', async () => {
    let id = 'doc.txt'
    await letData(es).have(new IndexedDocument(id).withContent('This is the document.')).commit()

    await store.dispatch('document/get', { id: id })
    expect(store.state.document.doc.id).toEqual(id)
  })

  it('should get the document\'s named entities', async () => {
    let id = 'doc.txt'
    await letData(es).have(new IndexedDocument(id).withContent('This is the document.').withNer('naz')).commit()

    await store.dispatch('document/get', { id: id })
    await store.dispatch('document/getNamedEntities')
    expect(store.state.document.namedEntities[0].raw._source.mention).toEqual('naz')
    expect(store.state.document.namedEntities[0].raw._routing).toEqual(id)
  })

  it('should get the parent document', async () => {
    await letData(es).have(new IndexedDocument('parent.txt').withContent('This is parent.')).commit()
    await store.dispatch('search/query', 'parent')
    let parentNode = store.state.search.response.hits

    await letData(es).have(new IndexedDocument('child.txt').withContent('This is child.').withParent(parentNode[0].id)).commit()
    await store.dispatch('search/query', 'child')
    let childNode = store.state.search.response.hits

    await store.dispatch('document/get', { id: childNode[0].id, routing: childNode[0].routing })
    await store.dispatch('document/getParent')
    expect(store.state.document.parentDoc.id).toEqual(parentNode[0].id)
  })
})
