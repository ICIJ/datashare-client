import { setActivePinia, createPinia } from 'pinia'

import { useDocumentPathBannersStore } from '@/store/modules'
import { apiInstance as api } from '@/api/apiInstance'

vi.mock('@/api/apiInstance', () => {
  return {
    apiInstance: {
      getPathBanners: vi.fn().mockResolvedValue([])
    }
  }
})

describe('DocumentPathBannersStore', () => {
  const project = 'projectName'
  let store

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    store = useDocumentPathBannersStore()
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  it('should call the getPathBanners url', async () => {
    await store.fetchPathBannersOnce({ project })

    expect(api.getPathBanners).toBeCalledTimes(1)
    expect(api.getPathBanners).toBeCalledWith(project)
  })

  it('should call the API endpoint only once', async () => {
    await store.fetchPathBannersOnce({ project })
    await store.fetchPathBannersOnce({ project })

    expect(api.getPathBanners).toBeCalledTimes(1)
    expect(api.getPathBanners).toBeCalledWith(project)
  })

  it('should call the API endpoint only once even with concurrent calls', async () => {
    await Promise.all([
      store.fetchPathBannersOnce({ project }),
      store.fetchPathBannersOnce({ project })
    ])

    expect(api.getPathBanners).toBeCalledTimes(1)
    expect(api.getPathBanners).toBeCalledWith(project)
  })

  it('should filter on document path', async () => {
    const note = 'note'
    const variant = 'variant'
    store.set({
      project,
      pathBanners: [
        { note, project, variant, path: '/this/is/a/' },
        { note, project, variant, path: '/this/is/a/path/to' },
        { note, project, variant, path: '/this/is/a/path/to/document.txt' },
        { note, project, variant, path: '/this/is/another/path' }
      ]
    })

    const pathBanners = await store.fetchPathBannersByPath({
      project,
      path: '/this/is/a/path/to/document.txt'
    })

    expect(pathBanners).toHaveLength(3)
  })
})
