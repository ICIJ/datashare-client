import { indexOf, orderBy, uniqueId } from 'lodash'
import { setActivePinia, createPinia } from 'pinia'

import { IndexedDocument, letData } from '~tests/unit/es_utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import { useDocumentStore } from '@/store/modules'
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
  let documentStore

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    documentStore = useDocumentStore()
    vi.clearAllMocks()
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  it('should define a store module', () => {
    expect(documentStore).toBeDefined()
    expect(documentStore.document).toBeDefined()
  })

  it('should reset the store state', () => {
    documentStore.recommend(true)
    documentStore.reset()

    expect(documentStore.document).toEqual(null)
    expect(documentStore.idAndRouting).toEqual(null)
    expect(documentStore.isContentLoaded).toEqual(false)
    expect(documentStore.isRecommended).toEqual(false)
  })

  it('should get the document', async () => {
    await letData(es).have(new IndexedDocument(id, index)).commit()
    await documentStore.getDocument({ id, index })

    expect(documentStore.document.id).toBe(id)
  })

  it('should get the parent document', async () => {
    const routing = uniqueId('parent-')
    const id = uniqueId('child-')
    await letData(es).have(new IndexedDocument(routing, index)).commit()
    await letData(es).have(new IndexedDocument(id, index).withParent(routing)).commit()
    await documentStore.getDocument({ id, routing, index })
    await documentStore.getParentDocument()

    expect(documentStore.parentDocument.id).toBe(routing)
  })

  it("should get the document's named entities", async () => {
    await letData(es).have(new IndexedDocument(id, index).withNer('naz')).commit()
    await documentStore.getDocument({ id, index })
    await documentStore.getFirstPageForNamedEntityInAllCategories()

    expect(documentStore.namedEntities[0].raw._source.mention).toBe('naz')
    expect(documentStore.namedEntities[0].raw._routing).toBe(id)
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
    await documentStore.getDocument({ id, index })

    await documentStore.getFirstPageForNamedEntityInAllCategories()

    expect(documentStore.namedEntities).toHaveLength(2)
    expect(documentStore.namedEntities[0].raw._source.mention).toBe('entity_01')
    expect(documentStore.namedEntities[0].raw._routing).toBe(id)
    expect(documentStore.namedEntities[1].raw._source.mention).toBe('entity_03')
    expect(documentStore.namedEntities[1].raw._routing).toBe(id)
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
      await documentStore.getDocument({ id, index })
      await documentStore.getTags()
      expect(documentStore.tags).toEqual(tags)
    })

    it('should tag multiple documents and not refresh', async () => {
      await letData(es).have(new IndexedDocument('doc_01', index)).commit()
      await letData(es).have(new IndexedDocument('doc_02', index)).commit()
      await documentStore.getDocument({ id: 'doc_01', index })

      await documentStore.addTag({
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
      await documentStore.getDocument({ id: 'doc_01', index })
      const document01 = documentStore.document
      await documentStore.getDocument({ id: 'doc_02', index })
      const document02 = documentStore.document

      // no document is selected
      documentStore.reset()

      // WHEN
      api.tagDocuments.mockResolvedValue({})
      await documentStore.addTag({ documents: [document01, document02], label: 'tag_01 tag_02 tag_03' })

      // THEN
      expect(api.tagDocuments).toBeCalledTimes(1)
      expect(api.tagDocuments).toBeCalledWith(index, ['doc_01', 'doc_02'], ['tag_01', 'tag_02', 'tag_03'])
    })

    it('should call deleteTag from 1 document', async () => {
      await letData(es).have(new IndexedDocument('doc_01', index)).commit()
      await letData(es).have(new IndexedDocument('doc_02', index)).commit()
      await documentStore.getDocument({ id: 'doc_01', index })

      api.untagDocuments.mockResolvedValue({})

      const document = await documentStore.getDocument({ id: 'doc_01', index })
      await documentStore.deleteTag({ documents: [document], label: 'tag_01' })

      expect(api.untagDocuments).toBeCalledTimes(1)
      expect(api.untagDocuments).toBeCalledWith(index, ['doc_01'], ['tag_01'])
    })

    it('should add tags to the store', async () => {
      await letData(es).have(new IndexedDocument('doc_01', index)).commit()
      await documentStore.getDocument({ id: 'doc_01', index })

      const tags = [{ label: 'tag_01' }, { label: 'tag_02' }]
      api.getTags.mockResolvedValue(tags)
      await documentStore.addTag({ label: 'tag_01      tag_01 tag_02', userId: 'user' })

      expect(documentStore.tags).toHaveLength(2)
      expect(orderBy(documentStore.tags, ['label'])[0].label).toBe('tag_01')
      expect(orderBy(documentStore.tags, ['label'])[1].label).toBe('tag_02')
    })
  })

  describe('Manage isRecommended status', () => {
    it('should change isRecommended status to true', () => {
      documentStore.isRecommended = false
      documentStore.recommend(true)
      expect(documentStore.isRecommended).toBeTruthy()
    })

    it('should change isRecommended status to false', () => {
      documentStore.isRecommended = true
      documentStore.recommend(false)
      expect(documentStore.isRecommended).toBeFalsy()
    })

    it('should add user in recommendedBy array', () => {
      const userId = 'Jean-Michel'
      documentStore.markAsRecommended(userId)
      expect(indexOf(documentStore.recommendedBy, userId)).toBeGreaterThan(-1)
    })

    it('should remove user from recommendedBy array', () => {
      const userId = 'Jean-Michel'
      documentStore.markAsRecommended(userId)
      documentStore.unmarkAsRecommended(userId)
      expect(indexOf(documentStore.recommendedBy, userId)).toBe(-1)
    })

    it('should MARK these documents as recommended', async () => {
      const userId = 'Jean-Michel'
      await letData(es).have(new IndexedDocument('doc_01', index)).commit()
      await letData(es).have(new IndexedDocument('doc_02', index)).commit()
      await documentStore.getDocument({ id: 'doc_01', index })
      documentStore.isRecommended = false
      api.setMarkAsRecommended.mockResolvedValue({})

      await documentStore.toggleAsRecommended(userId)

      expect(api.setMarkAsRecommended).toBeCalledTimes(1)
      expect(api.setMarkAsRecommended).toBeCalledWith(index, ['doc_01'])
    })

    it('should UNMARK these documents as recommended', async () => {
      const userId = 'Jean-Michel'
      await letData(es).have(new IndexedDocument('doc_01', index)).commit()
      await letData(es).have(new IndexedDocument('doc_02', index)).commit()
      await documentStore.getDocument({ id: 'doc_01', index })
      documentStore.isRecommended = true

      api.setUnmarkAsRecommended.mockResolvedValue({})

      await documentStore.toggleAsRecommended(userId)

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
      await documentStore.getDocument({ id: 'doc_01', index })
      await documentStore.getRecommendationsByDocuments()

      expect(api.getRecommendationsByDocuments).toBeCalledTimes(1)
      expect(api.getRecommendationsByDocuments).toBeCalledWith(index, 'doc_01')
      expect(documentStore.recommendedBy).toEqual(['user_01', 'user_02'])
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
      await documentStore.getDocument({ id: 'doc_01', index })
      await documentStore.getRecommendationsByDocuments()

      expect(documentStore.recommendedBy).toEqual(['user_01', 'user_02', 'user_03'])
    })
  })
})
