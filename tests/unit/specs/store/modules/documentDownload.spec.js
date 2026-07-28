import { setActivePinia, createPinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'

import { useDocumentDownloadStore } from '@/store/modules'
import { apiInstance as api } from '@/api/apiInstance'

vi.mock('@/api/apiInstance', () => {
  return {
    apiInstance: {
      isDocumentDownloadable: vi.fn().mockResolvedValue(true)
    }
  }
})

describe('DocumentDownloadStore', () => {
  const index = 'downloadStoreFoo'
  const document = { index, id: 'doc-one', routing: 'doc-one' }
  const anotherDocument = { index, id: 'doc-two', routing: 'doc-one' }
  let documentDownloadStore

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    documentDownloadStore = useDocumentDownloadStore()
  })

  describe('initial state', () => {
    it('should be downloadable by default, before the status is known', () => {
      expect(documentDownloadStore.isDownloadable(document)).toBe(true)
    })

    it('should not send any request until the status is fetched', () => {
      documentDownloadStore.isDownloadable(document)
      expect(api.isDocumentDownloadable).not.toBeCalled()
    })
  })

  describe('downloadable document', () => {
    beforeEach(() => {
      api.isDocumentDownloadable.mockResolvedValue(true)
    })

    it('should probe the document with its index, id and routing', async () => {
      await documentDownloadStore.fetchDocumentStatus(document)
      expect(api.isDocumentDownloadable).toBeCalledWith(index, 'doc-one', 'doc-one')
    })

    it('should stay downloadable once the status is fetched', async () => {
      await documentDownloadStore.fetchDocumentStatus(document)
      expect(documentDownloadStore.isDownloadable(document)).toBe(true)
    })
  })

  describe('not downloadable document', () => {
    beforeEach(() => {
      api.isDocumentDownloadable.mockResolvedValue(false)
    })

    it('should not be downloadable once the status is fetched', async () => {
      await documentDownloadStore.fetchDocumentStatus(document)
      expect(documentDownloadStore.isDownloadable(document)).toBe(false)
    })

    it('should not affect another document of the same index', async () => {
      await documentDownloadStore.fetchDocumentStatus(document)
      expect(documentDownloadStore.isDownloadable(anotherDocument)).toBe(true)
    })
  })

  describe('memoization', () => {
    beforeEach(() => {
      api.isDocumentDownloadable.mockResolvedValue(true)
    })

    it('should probe the same document only once', async () => {
      documentDownloadStore.fetchDocumentStatus(document)
      documentDownloadStore.fetchDocumentStatus(document)
      await flushPromises()
      expect(api.isDocumentDownloadable).toBeCalledTimes(1)
    })

    it('should probe two different documents twice', async () => {
      documentDownloadStore.fetchDocumentStatus(document)
      documentDownloadStore.fetchDocumentStatus(anotherDocument)
      await flushPromises()
      expect(api.isDocumentDownloadable).toBeCalledTimes(2)
    })

    it('should probe the same id in two different indices twice', async () => {
      const sameIdOtherIndex = { index: 'downloadStoreBar', id: 'doc-one', routing: 'doc-one' }
      documentDownloadStore.fetchDocumentStatus(document)
      documentDownloadStore.fetchDocumentStatus(sameIdOtherIndex)
      await flushPromises()
      expect(api.isDocumentDownloadable).toBeCalledTimes(2)
    })
  })
})
