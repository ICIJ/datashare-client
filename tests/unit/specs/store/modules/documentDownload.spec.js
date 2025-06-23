import { setActivePinia, createPinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'

import { useDocumentDownloadStore, useSearchStore } from '@/store/modules'
import { apiInstance as api } from '@/api/apiInstance'

vi.mock('@/api/apiInstance', () => {
  return {
    apiInstance: {
      isDownloadAllowed: vi.fn().mockResolvedValue()
    }
  }
})

describe('DocumentDownloadStore', () => {
  const index = 'downloadStoreFoo'
  const anotherIndex = 'downloadStoreBar'
  let documentDownloadStore, searchStore

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    documentDownloadStore = useDocumentDownloadStore()
    searchStore = useSearchStore()
    searchStore = useSearchStore()
    searchStore.setIndex(index)
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  describe('initial state', () => {
    beforeEach(() => {
      api.isDownloadAllowed.mockResolvedValue()
    })

    it('should be allowed by default', async () => {
      expect(documentDownloadStore.isAllowed(index)).toBe(true)
    })
  })

  describe('allowed download', () => {
    beforeEach(() => {
      api.isDownloadAllowed.mockResolvedValue()
      documentDownloadStore.allow({ index, allowed: false })
      documentDownloadStore.allow({ index: anotherIndex, allowed: false })
    })

    it('should set the download status for the given index', async () => {
      expect(documentDownloadStore.isAllowed(index)).toBe(false)
      documentDownloadStore.allow({ index, allowed: true })
      expect(documentDownloadStore.isAllowed(index)).toBe(true)
    })

    it('should set the download statuses for the two given indices', async () => {
      expect(documentDownloadStore.isAllowed(index)).toBe(false)
      expect(documentDownloadStore.isAllowed(anotherIndex)).toBe(false)
      documentDownloadStore.allow({ index, allowed: true })
      documentDownloadStore.allow({ index: anotherIndex, allowed: true })
      expect(documentDownloadStore.isAllowed(index)).toBe(true)
      expect(documentDownloadStore.isAllowed(anotherIndex)).toBe(true)
    })

    it('should get the download status for the given index', async () => {
      expect(documentDownloadStore.isAllowed(index)).toBe(false)
      await documentDownloadStore.fetchIndicesStatus(index)
      expect(documentDownloadStore.isAllowed(index)).toBe(true)
    })

    it('should get the download statuses for the two given indices', async () => {
      expect(documentDownloadStore.isAllowed(index)).toBe(false)
      expect(documentDownloadStore.isAllowed(anotherIndex)).toBe(false)
      await documentDownloadStore.fetchIndicesStatus(index, anotherIndex)
      expect(documentDownloadStore.isAllowed(index)).toBe(true)
      expect(documentDownloadStore.isAllowed(anotherIndex)).toBe(true)
    })

    it('should get the download statuses for the two given indices in an array', async () => {
      expect(documentDownloadStore.isAllowed(index)).toBe(false)
      expect(documentDownloadStore.isAllowed(anotherIndex)).toBe(false)
      await documentDownloadStore.fetchIndicesStatus([index, anotherIndex])
      expect(documentDownloadStore.isAllowed(index)).toBe(true)
      expect(documentDownloadStore.isAllowed(anotherIndex)).toBe(true)
    })

    it('should get the download statuses for the given index only once', async () => {
      documentDownloadStore.fetchIndexStatus(index)
      documentDownloadStore.fetchIndexStatus(index)
      await flushPromises()
      expect(documentDownloadStore.isAllowed(index)).toBe(true)
      expect(api.isDownloadAllowed).toHaveBeenCalledTimes(1)
    })

    it('should get the download statuses for the two given indices only twice', async () => {
      documentDownloadStore.fetchIndicesStatus([index, anotherIndex])
      documentDownloadStore.fetchIndicesStatus([index, anotherIndex])
      await flushPromises()
      expect(documentDownloadStore.isAllowed(index)).toBe(true)
      expect(api.isDownloadAllowed).toHaveBeenCalledTimes(2)
    })
  })

  describe('not allowed download', () => {
    beforeEach(() => {
      api.isDownloadAllowed.mockRejectedValue()
      documentDownloadStore.allow({ index, allowed: false })
      documentDownloadStore.allow({ index: anotherIndex, allowed: false })
    })

    it('should set the download status for the given index', async () => {
      expect(documentDownloadStore.isAllowed(index)).toBe(false)
      documentDownloadStore.allow({ index, allowed: false })
      expect(documentDownloadStore.isAllowed(index)).toBe(false)
    })

    it('should set the download statuses for the two given indices', async () => {
      expect(documentDownloadStore.isAllowed(index)).toBe(false)
      expect(documentDownloadStore.isAllowed(anotherIndex)).toBe(false)
      documentDownloadStore.allow({ index, allowed: false })
      documentDownloadStore.allow({ index: anotherIndex, allowed: false })
      expect(documentDownloadStore.isAllowed(index)).toBe(false)
      expect(documentDownloadStore.isAllowed(anotherIndex)).toBe(false)
    })

    it('should get the download status for the given index', async () => {
      expect(documentDownloadStore.isAllowed(index)).toBe(false)
      await documentDownloadStore.fetchIndicesStatus(index)
      expect(documentDownloadStore.isAllowed(index)).toBe(false)
    })

    it('should get the download statuses for the two given indices', async () => {
      expect(documentDownloadStore.isAllowed(index)).toBe(false)
      expect(documentDownloadStore.isAllowed(anotherIndex)).toBe(false)
      await documentDownloadStore.fetchIndicesStatus(index, anotherIndex)
      expect(documentDownloadStore.isAllowed(index)).toBe(false)
      expect(documentDownloadStore.isAllowed(anotherIndex)).toBe(false)
    })

    it('should get the download statuses for the two given indices in an array', async () => {
      expect(documentDownloadStore.isAllowed(index)).toBe(false)
      expect(documentDownloadStore.isAllowed(anotherIndex)).toBe(false)
      await documentDownloadStore.fetchIndicesStatus([index, anotherIndex])
      expect(documentDownloadStore.isAllowed(index)).toBe(false)
      expect(documentDownloadStore.isAllowed(anotherIndex)).toBe(false)
    })

    it('should get the download statuses for the given index only once', async () => {
      documentDownloadStore.fetchIndexStatus(index)
      documentDownloadStore.fetchIndexStatus(index)
      await flushPromises()
      expect(documentDownloadStore.isAllowed(index)).toBe(false)
      expect(api.isDownloadAllowed).toHaveBeenCalledTimes(1)
    })

    it('should get the download statuses for the two given indices only twice', async () => {
      documentDownloadStore.fetchIndicesStatus([index, anotherIndex])
      documentDownloadStore.fetchIndicesStatus([index, anotherIndex])
      await flushPromises()
      expect(documentDownloadStore.isAllowed(index)).toBe(false)
      expect(api.isDownloadAllowed).toHaveBeenCalledTimes(2)
    })
  })
})
