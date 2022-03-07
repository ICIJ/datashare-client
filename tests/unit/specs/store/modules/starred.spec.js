import { find, toLower } from 'lodash'
import axios from 'axios'

import store from '@/store'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'

jest.mock('axios')

describe('SearchStore', () => {
  const project = toLower('SearchStore')
  const anotherProject = toLower('AnotherSearchStore')
  esConnectionHelper([project, anotherProject])
  const es = esConnectionHelper.es

  beforeEach(() => {
    store.commit('search/index', project)
    store.commit('starred/starredDocuments', [])
  })

  afterAll(() => jest.unmock('axios'))

  it('should define a store module', () => {
    expect(store.state.starred).not.toBeUndefined()
  })

  it('should not reset the starredDocuments from the filter', async () => {
    store.commit('starred/starredDocuments', ['document_01', 'document_02'])

    store.commit('search/reset', ['starredDocuments'])

    expect(find(store.getters['search/instantiatedFilters'], { name: 'starred' }).starredDocuments)
      .toEqual(['document_01', 'document_02'])
  })

  it('should not reset the starredDocuments', async () => {
    store.commit('starred/starredDocuments', ['document_01', 'document_02'])

    store.commit('search/reset', ['starredDocuments'])

    expect(store.state.starred.starredDocuments).toEqual(['document_01', 'document_02'])
  })

  it('should not change the starredDocuments on updateFromRouteQuery', async () => {
    store.commit('starred/starredDocuments', ['doc_01', 'doc_02'])
    await store.dispatch('search/updateFromRouteQuery', {})

    expect(store.state.starred.starredDocuments).toEqual(['doc_01', 'doc_02'])
  })

  it('should return the list of the starredDocuments', async () => {
    axios.request.mockResolvedValue({ data: [42] })
    await store.dispatch('starred/getStarredDocuments')

    expect(store.state.starred.starredDocuments).toEqual([42])
    expect(store.getters['search/getFilter']({ name: 'starred' }).starredDocuments).toEqual([42])
  })

  it('should remove a documentId from the list of the starredDocuments', () => {
    store.commit('starred/starredDocuments', [12, 42])
    store.commit('starred/removeFromStarredDocuments', [42])

    expect(store.state.starred.starredDocuments).toEqual([12])
  })

  it('should push a documentId from the list of the starredDocuments', () => {
    store.commit('starred/starredDocuments', [12])
    store.commit('starred/pushFromStarredDocuments', 42)

    expect(store.state.starred.starredDocuments).toEqual([12, 42])
  })

  it('should push a documentId from the list of the starredDocuments only if it does not exist', () => {
    store.commit('starred/pushFromStarredDocuments', 12)
    store.commit('starred/pushFromStarredDocuments', 42)
    store.commit('starred/pushFromStarredDocuments', 42)
    store.commit('starred/pushFromStarredDocuments', 42)

    expect(store.state.starred.starredDocuments).toEqual([12, 42])
  })

  it('should toggle a starred documentId, push it if it is not starred', async () => {
    store.commit('starred/starredDocuments', [])
    await store.dispatch('starred/toggleStarDocument', 45)

    expect(store.state.starred.starredDocuments).toEqual([45])
    expect(store.getters['search/getFilter']({ name: 'starred' }).starredDocuments).toEqual([45])
  })

  it('should toggle a starred documentId, remove it if it is starred', async () => {
    store.commit('starred/starredDocuments', [48])
    await store.dispatch('starred/toggleStarDocument', 48)

    expect(store.state.starred.starredDocuments).toEqual([])
    expect(store.getters['search/getFilter']({ name: 'starred' }).starredDocuments).toEqual([])
  })

  it('should set the starredDocuments property of the filter', () => {
    store.commit('starred/starredDocuments', ['doc_01', 'doc_02'])
    expect(store.getters['search/getFilter']({ name: 'starred' }).starredDocuments).toEqual(['doc_01', 'doc_02'])
  })

  it('should star a batch of documents', async () => {
    await letData(es).have(new IndexedDocument('doc_01', project).withContent('test').withNer('ner_01')).commit()
    await letData(es).have(new IndexedDocument('doc_02', project).withNer('ner_02')).commit()
    await letData(es).have(new IndexedDocument('doc_03', project).withNer('test')).commit()

    await store.dispatch('starred/starDocuments', [{ id: 'doc_01' }, { id: 'doc_03' }])

    expect(store.state.starred.starredDocuments).toEqual(['doc_01', 'doc_03'])
  })

  it('should unstar a batch of documents', async () => {
    await letData(es).have(new IndexedDocument('doc_01', project).withContent('test').withNer('ner_01')).commit()
    await letData(es).have(new IndexedDocument('doc_02', project).withNer('ner_02')).commit()
    await letData(es).have(new IndexedDocument('doc_03', project).withNer('test')).commit()

    await store.dispatch('starred/starDocuments', [{ id: 'doc_01' }, { id: 'doc_03' }])
    await store.dispatch('starred/unstarDocuments', [{ id: 'doc_01' }])

    expect(store.state.starred.starredDocuments).toEqual(['doc_03'])
  })
})
