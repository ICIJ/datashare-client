import { setActivePinia, createPinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'

import { useDownloadsStore, useSearchStore } from '@/store/modules'
import { apiInstance as api } from '@/api/apiInstance'

vi.mock('@/api/apiInstance', () => {
  return {
    apiInstance: {
      isDownloadAllowed: vi.fn().mockResolvedValue()
    }
  }
})

describe('DownloadsStore', () => {
  const index = 'downloadStoreFoo'
  const anotherIndex = 'downloadStoreBar'
  let downloadsStore, searchStore

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    downloadsStore = useDownloadsStore()
    searchStore = useSearchStore()
    searchStore = useSearchStore()
    searchStore.setIndex(index)
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  describe('allowed download', () => {
    beforeEach(() => {
      api.isDownloadAllowed.mockResolvedValue()
    })

    it('should set the download status for the given index', async () => {
      expect(downloadsStore.isAllowed(index)).toBe(false)
      downloadsStore.allow({ index, allowed: true })
      expect(downloadsStore.isAllowed(index)).toBe(true)
    })

    it('should set the download statuses for the two given indices', async () => {
      expect(downloadsStore.isAllowed(index)).toBe(false)
      expect(downloadsStore.isAllowed(anotherIndex)).toBe(false)
      downloadsStore.allow({ index, allowed: true })
      downloadsStore.allow({ index: anotherIndex, allowed: true })
      expect(downloadsStore.isAllowed(index)).toBe(true)
      expect(downloadsStore.isAllowed(anotherIndex)).toBe(true)
    })

    it('should get the download status for the given index', async () => {
      expect(downloadsStore.isAllowed(index)).toBe(false)
      await downloadsStore.fetchIndicesStatus(index)
      expect(downloadsStore.isAllowed(index)).toBe(true)
    })

    it('should get the download statuses for the two given indices', async () => {
      expect(downloadsStore.isAllowed(index)).toBe(false)
      expect(downloadsStore.isAllowed(anotherIndex)).toBe(false)
      await downloadsStore.fetchIndicesStatus(index, anotherIndex)
      expect(downloadsStore.isAllowed(index)).toBe(true)
      expect(downloadsStore.isAllowed(anotherIndex)).toBe(true)
    })

    it('should get the download statuses for the two given indices in an array', async () => {
      expect(downloadsStore.isAllowed(index)).toBe(false)
      expect(downloadsStore.isAllowed(anotherIndex)).toBe(false)
      await downloadsStore.fetchIndicesStatus([index, anotherIndex])
      expect(downloadsStore.isAllowed(index)).toBe(true)
      expect(downloadsStore.isAllowed(anotherIndex)).toBe(true)
    })

    it('should get the download statuses for the given index only once', async () => {
      downloadsStore.fetchIndexStatus(index)
      downloadsStore.fetchIndexStatus(index)
      await flushPromises()
      expect(downloadsStore.isAllowed(index)).toBe(true)
      expect(api.isDownloadAllowed).toHaveBeenCalledTimes(1)
    })

    it('should get the download statuses for the two given indices only twice', async () => {
      downloadsStore.fetchIndicesStatus([index, anotherIndex])
      downloadsStore.fetchIndicesStatus([index, anotherIndex])
      await flushPromises()
      expect(downloadsStore.isAllowed(index)).toBe(true)
      expect(api.isDownloadAllowed).toHaveBeenCalledTimes(2)
    })
  })

  describe('not allowed download', () => {
    beforeEach(() => {
      api.isDownloadAllowed.mockRejectedValue()
    })

    it('should set the download status for the given index', async () => {
      expect(downloadsStore.isAllowed(index)).toBe(false)
      downloadsStore.allow({ index, allowed: false })
      expect(downloadsStore.isAllowed(index)).toBe(false)
    })

    it('should set the download statuses for the two given indices', async () => {
      expect(downloadsStore.isAllowed(index)).toBe(false)
      expect(downloadsStore.isAllowed(anotherIndex)).toBe(false)
      downloadsStore.allow({ index, allowed: false })
      downloadsStore.allow({ index: anotherIndex, allowed: false })
      expect(downloadsStore.isAllowed(index)).toBe(false)
      expect(downloadsStore.isAllowed(anotherIndex)).toBe(false)
    })

    it('should get the download status for the given index', async () => {
      expect(downloadsStore.isAllowed(index)).toBe(false)
      await downloadsStore.fetchIndicesStatus(index)
      expect(downloadsStore.isAllowed(index)).toBe(false)
    })

    it('should get the download statuses for the two given indices', async () => {
      expect(downloadsStore.isAllowed(index)).toBe(false)
      expect(downloadsStore.isAllowed(anotherIndex)).toBe(false)
      await downloadsStore.fetchIndicesStatus(index, anotherIndex)
      expect(downloadsStore.isAllowed(index)).toBe(false)
      expect(downloadsStore.isAllowed(anotherIndex)).toBe(false)
    })

    it('should get the download statuses for the two given indices in an array', async () => {
      expect(downloadsStore.isAllowed(index)).toBe(false)
      expect(downloadsStore.isAllowed(anotherIndex)).toBe(false)
      await downloadsStore.fetchIndicesStatus([index, anotherIndex])
      expect(downloadsStore.isAllowed(index)).toBe(false)
      expect(downloadsStore.isAllowed(anotherIndex)).toBe(false)
    })

    it('should get the download statuses for the given index only once', async () => {
      downloadsStore.fetchIndexStatus(index)
      downloadsStore.fetchIndexStatus(index)
      await flushPromises()
      expect(downloadsStore.isAllowed(index)).toBe(false)
      expect(api.isDownloadAllowed).toHaveBeenCalledTimes(1)
    })

    it('should get the download statuses for the two given indices only twice', async () => {
      downloadsStore.fetchIndicesStatus([index, anotherIndex])
      downloadsStore.fetchIndicesStatus([index, anotherIndex])
      await flushPromises()
      expect(downloadsStore.isAllowed(index)).toBe(false)
      expect(api.isDownloadAllowed).toHaveBeenCalledTimes(2)
    })
  })
})
