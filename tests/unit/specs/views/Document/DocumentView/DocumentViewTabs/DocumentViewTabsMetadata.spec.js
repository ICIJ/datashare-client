import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import RawDocBuilder from '~tests/unit/RawDocBuilder'
import DocumentViewTabsMetadata from '@/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsMetadata'
import DocumentMetadata from '@/components/Document/DocumentMetadata/DocumentMetadata'
import { useDocumentStore } from '@/store/modules'

vi.mock('@/api/apiInstance', () => ({
  apiInstance: {
    getPathBanners: vi.fn().mockResolvedValue([])
  }
}))

describe('DocumentViewTabsMetadata.vue', () => {
  const index = 'test-index'
  const id = '/home/datashare/data/foo.txt'
  let wrapper, core, documentStore

  beforeAll(() => {
    core = CoreSetup.init().useAll()
  })

  beforeEach(() => {
    vi.useFakeTimers()
    core.createPinia()
    documentStore = useDocumentStore()
  })

  afterEach(() => {
    wrapper.unmount()
    documentStore.reset()
    vi.useRealTimers()
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  it('should display document with 8 metadata', () => {
    documentStore.setDocument(RawDocBuilder.build(id, index).toRaw())

    wrapper = shallowMount(DocumentViewTabsMetadata, { global: { plugins: core.plugins } })

    const inputs = wrapper.findAll('.document-view-tabs-metadata__entry')
    expect(inputs).toHaveLength(8)
  })

  it('should display "File on disk" when extractionLevel metadata is missing', () => {
    documentStore.setDocument(RawDocBuilder.build(id, index).toRaw())

    wrapper = shallowMount(DocumentViewTabsMetadata, { global: { plugins: core.plugins } })

    const entries = wrapper.findAllComponents(DocumentMetadata)
    const extractionLevelEntry = entries.find(c => c.props('name') === 'extractionLevel')
    expect(extractionLevelEntry).toBeDefined()
    expect(extractionLevelEntry.props('value')).toBe(0)
  })

  it('should display document with 8 metadata (including language)', () => {
    documentStore.setDocument(RawDocBuilder.build(id, index).withLanguage('FRENCH').toRaw())

    wrapper = shallowMount(DocumentViewTabsMetadata, { global: { plugins: core.plugins } })

    const entries = wrapper.findAllComponents(DocumentMetadata)
    const languageEntry = entries.find(c => c.props('name') === 'language')
    expect(languageEntry).toBeDefined()
    expect(languageEntry.props('value')).toBe('FRENCH')
  })

  it('should filter the list with a query', async () => {
    documentStore.setDocument(RawDocBuilder.build(id, index).toRaw())

    wrapper = shallowMount(DocumentViewTabsMetadata, { global: { plugins: core.plugins } })

    wrapper.vm.q = 'language'
    await wrapper.vm.$nextTick()
    const inputs = wrapper.findAll('.document-view-tabs-metadata__entry')
    expect(inputs).toHaveLength(8)
  })
})
