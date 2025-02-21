import { setActivePinia, createPinia } from 'pinia'

import { IndexedDocument, letData } from '~tests/unit/es_utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import { useStarredStore, useSearchStore } from '@/store/modules'

describe('StarredStore', () => {
  const { index, es } = esConnectionHelper.build()
  let starredStore, searchStore, filter, api

  beforeEach(() => {
    setActivePinia(createPinia())
    api = { getStarredDocuments: vi.fn(), starDocuments: vi.fn(), unstarDocuments: vi.fn() }
    starredStore = useStarredStore(api)
    searchStore = useSearchStore()
    // Get the starred filter from the search store to test the interaction between the two stores
    filter = searchStore.getFilter({ name: 'starred' })
  })

  it('should not reset the starredDocuments from the filter', async () => {
    starredStore.setDocuments([
      { index, id: 'document_01' },
      { index, id: 'document_02' }
    ])
    expect(filter.starredDocuments).toEqual([
      { index, id: 'document_01' },
      { index, id: 'document_02' }
    ])
  })

  it('should not reset the starredDocuments', async () => {
    starredStore.setDocuments([
      { index, id: 'document_01' },
      { index, id: 'document_02' }
    ])
    expect(starredStore.documents).toEqual([
      { index, id: 'document_01' },
      { index, id: 'document_02' }
    ])
  })

  it('should not change the starredDocuments on updateFromRouteQuery', async () => {
    starredStore.setDocuments([
      { index, id: 'document_01' },
      { index, id: 'document_02' }
    ])
    searchStore.updateFromRouteQuery({})
    expect(starredStore.documents).toEqual([
      { index, id: 'document_01' },
      { index, id: 'document_02' }
    ])
  })

  it('should return the list of the starredDocuments', async () => {
    api.getStarredDocuments.mockResolvedValue([12])
    await starredStore.fetchIndicesStarredDocuments(index)
    expect(starredStore.documents).toEqual([{ index, id: 12 }])
    expect(filter.starredDocuments).toEqual([{ index, id: 12 }])
    api.getStarredDocuments.mockClear()
  })

  it('should remove a documentId from the list of the starredDocuments', () => {
    starredStore.setDocuments([
      { index, id: 12 },
      { index, id: 42 }
    ])
    starredStore.removeDocuments([{ index, id: 42 }])
    expect(starredStore.documents).toEqual([{ index, id: 12 }])
  })

  it('should push a documentId from the list of the starredDocuments', () => {
    starredStore.setDocuments([{ index, id: 12 }])
    starredStore.pushDocuments([{ index, id: 42 }])
    expect(starredStore.documents).toEqual([
      { index, id: 12 },
      { index, id: 42 }
    ])
  })

  it('should push a documentId from the list of the starredDocuments only if it does not exist', () => {
    starredStore.pushDocuments([{ index, id: 12 }])
    starredStore.pushDocuments([{ index, id: 42 }])
    starredStore.pushDocuments([{ index, id: 42 }])
    starredStore.pushDocuments([{ index, id: 42 }])

    expect(starredStore.documents).toEqual([
      { index, id: 12 },
      { index, id: 42 }
    ])
  })

  it('should toggle a starred documentId, push it if it is not starred', async () => {
    const document = { index, id: 45 }
    starredStore.reset()
    await starredStore.toggleStarDocument(document)

    expect(starredStore.documents).toEqual([document])
    expect(filter.starredDocuments).toEqual([document])
  })

  it('should toggle a starred documentId, remove it if it is starred', async () => {
    const document = { index, id: 48 }
    starredStore.setDocuments([document])
    await starredStore.toggleStarDocument(document)

    expect(starredStore.documents).toEqual([])
    expect(filter.starredDocuments).toEqual([])
  })

  it('should set the starredDocuments property of the filter', () => {
    starredStore.setDocuments([
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

    await starredStore.starDocuments([
      { index, id: 'doc_01' },
      { index, id: 'doc_03' }
    ])
    expect(starredStore.documents).toEqual([
      { index, id: 'doc_01' },
      { index, id: 'doc_03' }
    ])
  })

  it('should unstar a batch of documents', async () => {
    await letData(es).have(new IndexedDocument('doc_01', index).withContent('test').withNer('ner_01')).commit()
    await letData(es).have(new IndexedDocument('doc_02', index).withNer('ner_02')).commit()
    await letData(es).have(new IndexedDocument('doc_03', index).withNer('test')).commit()

    await starredStore.starDocuments([
      { index, id: 'doc_01' },
      { index, id: 'doc_03' }
    ])
    await starredStore.unstarDocuments([{ index, id: 'doc_01' }])

    expect(starredStore.documents).toEqual([{ index, id: 'doc_03' }])
  })
})
