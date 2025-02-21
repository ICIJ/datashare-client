import { setActivePinia, createPinia } from 'pinia'

import { useDownloadsStore, useSearchStore } from '@/store/modules'

describe('DownloadsStore', () => {
  const index = 'downloadStoreFoo'
  const anotherIndex = 'downloadStoreBar'
  let downloadsStore, searchStore

  beforeEach(() => {
    setActivePinia(createPinia())
    downloadsStore = useDownloadsStore({ isDownloadAllowed: () => true })
    searchStore = useSearchStore()
    searchStore = useSearchStore()
    searchStore.setIndex(index)
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
})
