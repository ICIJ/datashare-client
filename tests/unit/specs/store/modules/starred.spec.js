import axios from 'axios'

import store from '@/store'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'

jest.mock('axios')

describe('StarredStore', () => {
  const { index, es } = esConnectionHelper.build()
  const filter = store.getters['search/getFilter']({ name: 'starred' })

  beforeEach(() => {
    store.commit('search/index', index)
    store.commit('starred/documents', [])
  })

  afterAll(() => jest.unmock('axios'))

  it('should define a store module', () => {
    expect(store.state.starred).toBeDefined()
  })

  it('should not reset the starredDocuments from the filter', async () => {
    store.commit('starred/documents', [
      { index, id: 'document_01' },
      { index, id: 'document_02' }
    ])
    expect(filter.starredDocuments).toEqual([
      { index, id: 'document_01' },
      { index, id: 'document_02' }
    ])
  })

  it('should not reset the starredDocuments', async () => {
    store.commit('starred/documents', [
      { index, id: 'document_01' },
      { index, id: 'document_02' }
    ])
    expect(store.state.starred.documents).toEqual([
      { index, id: 'document_01' },
      { index, id: 'document_02' }
    ])
  })

  it('should not change the starredDocuments on updateFromRouteQuery', async () => {
    store.commit('starred/documents', [
      { index, id: 'document_01' },
      { index, id: 'document_02' }
    ])
    store.dispatch('search/updateFromRouteQuery', {})
    expect(store.state.starred.documents).toEqual([
      { index, id: 'document_01' },
      { index, id: 'document_02' }
    ])
  })

  it('should return the list of the starredDocuments', async () => {
    axios.request.mockResolvedValue({ data: [12] })
    await store.dispatch('starred/fetchIndicesStarredDocuments')
    expect(store.state.starred.documents).toEqual([{ index, id: 12 }])
    expect(filter.starredDocuments).toEqual([{ index, id: 12 }])
  })

  it('should remove a documentId from the list of the starredDocuments', () => {
    store.commit('starred/documents', [
      { index, id: 12 },
      { index, id: 42 }
    ])
    store.commit('starred/removeDocuments', [
      { index, id: 42 }
    ])

    expect(store.state.starred.documents).toEqual([
      { index, id: 12 }
    ])
  })

  it('should push a documentId from the list of the starredDocuments', () => {
    store.commit('starred/documents', [{ index, id: 12 }])
    store.commit('starred/pushDocuments', [{ index, id: 42 }])

    expect(store.state.starred.documents).toEqual([
      { index, id: 12 },
      { index, id: 42 }
    ])
  })

  it('should push a documentId from the list of the starredDocuments only if it does not exist', () => {
    store.commit('starred/pushDocuments', [{ index, id: 12 }])
    store.commit('starred/pushDocuments', [{ index, id: 42 }])
    store.commit('starred/pushDocuments', [{ index, id: 42 }])
    store.commit('starred/pushDocuments', [{ index, id: 42 }])

    expect(store.state.starred.documents).toEqual([
      { index, id: 12 },
      { index, id: 42 }
    ])
  })

  it('should toggle a starred documentId, push it if it is not starred', async () => {
    const document = { index, id: 45 }
    store.commit('starred/documents', [])
    await store.dispatch('starred/toggleStarDocument', document)

    expect(store.state.starred.documents).toEqual([document])
    expect(filter.starredDocuments).toEqual([document])
  })

  it('should toggle a starred documentId, remove it if it is starred', async () => {
    const document = { index, id: 48 }
    store.commit('starred/documents', [document])
    await store.dispatch('starred/toggleStarDocument', document)

    expect(store.state.starred.documents).toEqual([])
    expect(filter.starredDocuments).toEqual([])
  })

  it('should set the starredDocuments property of the filter', () => {
    store.commit('starred/documents', [
      { index, id: 'doc_01' },
      { index, id: 'doc_02' }
    ])
    expect(filter.starredDocuments).toEqual([
      { index, id: 'doc_01' },
      { index, id: 'doc_02' }
    ])
  })

  it('should star a batch of documents', async () => {
    await letData(es).have(new IndexedDocument('doc_01', index).withContent('test').withNer('ner_01')).commit()
    await letData(es).have(new IndexedDocument('doc_02', index).withNer('ner_02')).commit()
    await letData(es).have(new IndexedDocument('doc_03', index).withNer('test')).commit()

    await store.dispatch('starred/starDocuments', [
      { index, id: 'doc_01' },
      { index, id: 'doc_03' }
    ])

    expect(store.state.starred.documents).toEqual([
      { index, id: 'doc_01' },
      { index, id: 'doc_03' }
    ])
  })

  it('should unstar a batch of documents', async () => {
    await letData(es).have(new IndexedDocument('doc_01', index).withContent('test').withNer('ner_01')).commit()
    await letData(es).have(new IndexedDocument('doc_02', index).withNer('ner_02')).commit()
    await letData(es).have(new IndexedDocument('doc_03', index).withNer('test')).commit()

    await store.dispatch('starred/starDocuments', [
      { index, id: 'doc_01' },
      { index, id: 'doc_03' }
    ])

    await store.dispatch('starred/unstarDocuments', [
      { index, id: 'doc_01' }])

    expect(store.state.starred.documents).toEqual([
      { index, id: 'doc_03' }
    ])
  })
})
