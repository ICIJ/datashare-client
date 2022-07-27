import store from '@/store'

jest.mock('axios', () => {
  return {
    request: jest.fn().mockResolvedValue({ data: null })
  }
})

describe('DownloadsStore', () => {
  const index = 'downloadStoreFoo'
  const anotherIndex = 'downloadStoreBar'

  afterAll(() => jest.unmock('axios'))
  beforeAll(() => store.commit('search/indices', index))
  beforeEach(() => store.commit('downloads/clear'))

  describe('state', () => {
    it('should define a store module', () => {
      expect(store.state.downloads).toBeDefined()
    })
  })

  describe('mutations', () => {
    it('should set the download status for the given index', async () => {
      expect(store.state.downloads.allowedFor[index]).toBeUndefined()
      store.commit('downloads/allowedFor', { index, allowed: true })
      expect(store.state.downloads.allowedFor[index]).toBeDefined()
    })

    it('should set the download statuses for the two given indices', async () => {
      expect(store.state.downloads.allowedFor[index]).toBeUndefined()
      expect(store.state.downloads.allowedFor[anotherIndex]).toBeUndefined()
      store.commit('downloads/allowedFor', { index, allowed: true })
      store.commit('downloads/allowedFor', { index: anotherIndex, allowed: true })
      expect(store.state.downloads.allowedFor[index]).toBeDefined()
      expect(store.state.downloads.allowedFor[anotherIndex]).toBeDefined()
    })
  })

  describe('actions', () => {
    it('should get the download status for the given index', async () => {
      expect(store.state.downloads.allowedFor[index]).toBeUndefined()
      store.commit('search/indices', index)
      await store.dispatch('downloads/fetchIndicesStatus')
      expect(store.state.downloads.allowedFor[index]).toBeDefined()
    })

    it('should get the download statuses for the two given indices', async () => {
      expect(store.state.downloads.allowedFor[index]).toBeUndefined()
      expect(store.state.downloads.allowedFor[anotherIndex]).toBeUndefined()
      store.commit('search/indices', [index, anotherIndex])
      await store.dispatch('downloads/fetchIndicesStatus')
      expect(store.state.downloads.allowedFor[index]).toBeDefined()
      expect(store.state.downloads.allowedFor[anotherIndex]).toBeDefined()
    })
  })
})
