import { indexOf, orderBy, uniqueId } from 'lodash'
import { setActivePinia, createPinia } from 'pinia'

import { IndexedDocument, letData } from '~tests/unit/es_utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import { useDocumentStore } from '@/store/modules/document'
import { apiInstance as api } from '@/api/apiInstance'

vi.mock('@/api/apiInstance', async (importOriginal) => {
  const { apiInstance } = await importOriginal()
  return {
    apiInstance: {
      ...apiInstance,
      getTags: vi.fn(),
      tagDocuments: vi.fn(),
      untagDocuments: vi.fn(),
      setMarkAsRecommended: vi.fn(),
      setUnmarkAsRecommended: vi.fn(),
      getRecommendationsByDocuments: vi.fn()
    }
  }
})

describe('DocumentStore', () => {
  const { index, es } = esConnectionHelper.build()
  const id = 'document'
  let store

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    store = useDocumentStore()
    vi.clearAllMocks()
  })

  it('should define a store module', () => {
    expect(store).toBeDefined()
    expect(store.doc).toBeDefined()
  })

  it('should reset the store state', () => {
    store.recommend(true)
    store.reset()

    expect(store.doc).toEqual(null)
    expect(store.idAndRouting).toEqual(null)
    expect(store.isContentLoaded).toEqual(false)
    expect(store.isRecommended).toEqual(false)
  })

  it('should get the document', async () => {
    await letData(es).have(new IndexedDocument(id, index)).commit()
    await store.getDocument({ id, index })

    expect(store.doc.id).toBe(id)
  })

  it('should get the parent document', async () => {
    const routing = uniqueId('parent-')
    const id = uniqueId('child-')
    await letData(es).have(new IndexedDocument(routing, index)).commit()
    await letData(es).have(new IndexedDocument(id, index).withParent(routing)).commit()
    await store.getDocument({ id, routing, index })
    await store.getParent()

    expect(store.parentDocument.id).toBe(routing)
  })

  it("should get the document's named entities", async () => {
    await letData(es).have(new IndexedDocument(id, index).withNer('naz')).commit()
    await store.getDocument({ id, index })
    await store.getFirstPageForNamedEntityInAllCategories()

    expect(store.namedEntities[0].raw._source.mention).toBe('naz')
    expect(store.namedEntities[0].raw._routing).toBe(id)
  })

  it("should get only the not hidden document's named entities", async () => {
    await letData(es)
      .have(
        new IndexedDocument(id, index)
          .withNer('entity_01', 42, 'ORGANIZATION', false)
          .withNer('entity_02', 43, 'ORGANIZATION', true)
          .withNer('entity_03', 44, 'ORGANIZATION', false)
      )
      .commit()
    await store.getDocument({ id, index })

    await store.getFirstPageForNamedEntityInAllCategories()

    expect(store.namedEntities).toHaveLength(2)
    expect(store.namedEntities[0].raw._source.mention).toBe('entity_01')
    expect(store.namedEntities[0].raw._routing).toBe(id)
    expect(store.namedEntities[1].raw._source.mention).toBe('entity_03')
    expect(store.namedEntities[1].raw._routing).toBe(id)
  })

  describe('Manage tags', () => {
    beforeEach(() => {
      api.tagDocuments.mockResolvedValue({})
    })

    it("should get the document's tags", async () => {
      const tags = [{ label: 'tag_01' }, { label: 'tag_02' }]
      api.getTags.mockResolvedValue(tags)
      await letData(es)
        .have(new IndexedDocument(id, index).withTags(['tag_01', 'tag_02']))
        .commit()
      await store.getDocument({ id, index })
      await store.getTags()
      expect(store.tags).toEqual(tags)
    })

    it('should tag multiple documents and not refresh', async () => {
      await letData(es).have(new IndexedDocument('doc_01', index)).commit()
      await letData(es).have(new IndexedDocument('doc_02', index)).commit()
      await store.getDocument({ id: 'doc_01', index })

      await store.addTagAction({
        documents: [
          { id: 'doc_01', index },
          { id: 'doc_02', index }
        ],
        label: 'tag_01 tag_02 tag_03'
      })

      expect(api.tagDocuments).toBeCalledTimes(1)
      expect(api.tagDocuments).toBeCalledWith(index, ['doc_01', 'doc_02'], ['tag_01', 'tag_02', 'tag_03'])
    })

    it('should tag multiple documents and not refresh and no document is selected in the store', async () => {
      await letData(es).have(new IndexedDocument('doc_01', index)).commit()
      await letData(es).have(new IndexedDocument('doc_02', index)).commit()

      // Retrieve documents
      await store.getDocument({ id: 'doc_01', index })
      const document01 = store.doc
      await store.getDocument({ id: 'doc_02', index })
      const document02 = store.doc

      // no document is selected
      store.reset()

      // WHEN
      api.tagDocuments.mockResolvedValue({})
      await store.addTagAction({ documents: [document01, document02], label: 'tag_01 tag_02 tag_03' })

      // THEN
      expect(api.tagDocuments).toBeCalledTimes(1)
      expect(api.tagDocuments).toBeCalledWith(index, ['doc_01', 'doc_02'], ['tag_01', 'tag_02', 'tag_03'])
    })

    it('should call deleteTag from 1 document', async () => {
      await letData(es).have(new IndexedDocument('doc_01', index)).commit()
      await letData(es).have(new IndexedDocument('doc_02', index)).commit()
      await store.getDocument({ id: 'doc_01', index })

      api.untagDocuments.mockResolvedValue({})

      const document = await store.getDocument({ id: 'doc_01', index })
      await store.deleteTagAction({ documents: [document], label: 'tag_01' })

      expect(api.untagDocuments).toBeCalledTimes(1)
      expect(api.untagDocuments).toBeCalledWith(index, ['doc_01'], ['tag_01'])
    })

    it('should add tags to the store', async () => {
      await letData(es).have(new IndexedDocument('doc_01', index)).commit()
      await store.getDocument({ id: 'doc_01', index })

      const tags = [{ label: 'tag_01' }, { label: 'tag_02' }]
      api.getTags.mockResolvedValue(tags)
      await store.addTagAction({ label: 'tag_01      tag_01 tag_02', userId: 'user' })

      expect(store.tags).toHaveLength(2)
      expect(orderBy(store.tags, ['label'])[0].label).toBe('tag_01')
      expect(orderBy(store.tags, ['label'])[1].label).toBe('tag_02')
    })
  })

  describe('Manage isRecommended status', () => {
    it('should change isRecommended status to true', () => {
      store.isRecommended = false
      store.recommend(true)
      expect(store.isRecommended).toBeTruthy()
    })

    it('should change isRecommended status to false', () => {
      store.isRecommended = true
      store.recommend(false)
      expect(store.isRecommended).toBeFalsy()
    })

    it('should add user in recommendedBy array', () => {
      const userId = 'Jean-Michel'
      store.markAsRecommended(userId)
      expect(indexOf(store.recommendedBy, userId)).toBeGreaterThan(-1)
    })

    it('should remove user from recommendedBy array', () => {
      const userId = 'Jean-Michel'
      store.markAsRecommended(userId)
      store.unmarkAsRecommended(userId)
      expect(indexOf(store.recommendedBy, userId)).toBe(-1)
    })

    it('should MARK these documents as recommended', async () => {
      const userId = 'Jean-Michel'
      await letData(es).have(new IndexedDocument('doc_01', index)).commit()
      await letData(es).have(new IndexedDocument('doc_02', index)).commit()
      await store.getDocument({ id: 'doc_01', index })
      store.isRecommended = false
      api.setMarkAsRecommended.mockResolvedValue({})

      await store.toggleAsRecommended(userId)

      expect(api.setMarkAsRecommended).toBeCalledTimes(1)
      expect(api.setMarkAsRecommended).toBeCalledWith(index, ['doc_01'])
    })

    it('should UNMARK these documents as recommended', async () => {
      const userId = 'Jean-Michel'
      await letData(es).have(new IndexedDocument('doc_01', index)).commit()
      await letData(es).have(new IndexedDocument('doc_02', index)).commit()
      await store.getDocument({ id: 'doc_01', index })
      store.isRecommended = true

      api.setUnmarkAsRecommended.mockResolvedValue({})

      await store.toggleAsRecommended(userId)

      expect(api.setUnmarkAsRecommended).toBeCalledTimes(1)
      expect(api.setUnmarkAsRecommended).toBeCalledWith(index, ['doc_01'])
    })

    it('should retrieve the list of users who recommended it and set it to the store', async () => {
      const users = {
        aggregates: [
          { item: { id: 'user_01' }, doc_count: 1 },
          { item: { id: 'user_02' }, doc_count: 1 }
        ]
      }
      api.getRecommendationsByDocuments.mockResolvedValue(users)

      await letData(es).have(new IndexedDocument('doc_01', index)).commit()
      await store.getDocument({ id: 'doc_01', index })
      await store.getRecommendationsByDocuments()

      expect(api.getRecommendationsByDocuments).toBeCalledTimes(1)
      expect(api.getRecommendationsByDocuments).toBeCalledWith(index, 'doc_01')
      expect(store.recommendedBy).toEqual(['user_01', 'user_02'])
    })

    it('should sort users by alphabetical order of id', async () => {
      const users = {
        aggregates: [
          { item: { id: 'user_01' }, doc_count: 1 },
          { item: { id: 'user_03' }, doc_count: 1 },
          { item: { id: 'user_02' }, doc_count: 1 }
        ]
      }
      api.getRecommendationsByDocuments.mockResolvedValue(users)

      await letData(es).have(new IndexedDocument('doc_01', index)).commit()
      await store.getDocument({ id: 'doc_01', index })
      await store.getRecommendationsByDocuments()

      expect(store.recommendedBy).toEqual(['user_01', 'user_02', 'user_03'])
    })
  })
})
