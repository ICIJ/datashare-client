import { flushPromises, shallowMount } from '@vue/test-utils'
import { beforeAll } from 'vitest'

import CoreSetup from '~tests/unit/CoreSetup'
import DocumentPathBanners from '@/components/Document/DocumentPathBanners'
import { useDocumentStore, useDocumentPathBannersStore, useSearchStore } from '@/store/modules'
import { apiInstance as api } from '@/api/apiInstance'

vi.mock('@/api/apiInstance', async () => {
  return {
    apiInstance: {
      getPathBanners: vi.fn()
    }
  }
})

describe('DocumentPathBanners.vue', () => {
  const path = '/this/is/a/'
  const project = 'banana-papers'
  const document = { path, project }
  const pathBanner1 = { note: 'This is a note', project, path: '/this/is/a/', variant: 'warning' }
  const pathBanner2 = { note: 'This is a second note', project, path: '/this/is/', variant: 'error' }

  let core, wrapper, plugins, documentStore, documentPathBannersStore, searchStore

  beforeAll(() => {
    api.getPathBanners.mockResolvedValue([])
  })

  beforeEach(() => {
    core = CoreSetup.init().useAll()
    plugins = core.plugins
    searchStore = useSearchStore()
    searchStore.setIndex(project)
    documentPathBannersStore = useDocumentPathBannersStore()
    documentPathBannersStore.reset()
    documentStore = useDocumentStore()
    documentStore.setDocument({ _id: 'foo', _index: 'bar' })
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  it('should NOT display path banner on document', () => {
    wrapper = shallowMount(DocumentPathBanners, { global: { plugins }, props: { document } })
    expect(wrapper.find('b-alert-stub').exists()).toBeFalsy()
  })

  it('should display path banner on document', async () => {
    const pathBanners = [pathBanner1]
    api.getPathBanners.mockResolvedValue(pathBanners)
    wrapper = shallowMount(DocumentPathBanners, { global: { plugins }, props: { document } })
    await flushPromises()
    expect(wrapper.find('b-alert-stub').exists()).toBeTruthy()
  })

  it('should display 2 path banners on document', async () => {
    const pathBanners = [pathBanner1, pathBanner2]
    api.getPathBanners.mockResolvedValue(pathBanners)
    wrapper = shallowMount(DocumentPathBanners, { global: { plugins }, props: { document } })
    await flushPromises()
    expect(wrapper.findAll('b-alert-stub')).toHaveLength(2)
  })

  it('should display path banner on document with default variant: warning', async () => {
    const pathBannerNoVariant = { note: 'This is note without variant', project, path: '/this/is/a/' }

    const pathBanners = [pathBannerNoVariant]
    api.getPathBanners.mockResolvedValue(pathBanners)
    wrapper = shallowMount(DocumentPathBanners, { global: { plugins }, props: { document } })
    await flushPromises()
    expect(wrapper.find('b-alert-stub').exists()).toBeTruthy()
    expect(wrapper.find('b-alert-stub').attributes('variant')).toBe('warning')
  })
})
