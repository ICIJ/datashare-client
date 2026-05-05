import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import RawDocBuilder from '~tests/unit/RawDocBuilder'
import DocumentViewTabsMetadata from '@/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsMetadata'
import { useDocumentStore } from '@/store/modules'

vi.mock('@/api/apiInstance', async (importOriginal) => {
  const { apiInstance } = await importOriginal()

  return {
    apiInstance: {
      ...apiInstance,
      getPathBanners: vi.fn().mockResolvedValue([])
    }
  }
})

describe('DocumentViewTabsMetadata.vue', () => {
  const index = 'test-index'
  const id = '/home/datashare/data/foo.txt'
  let wrapper, core, documentStore

  const stubs = { DocumentViewTabsMetadataLinkedDocumentsCard: true }

  beforeAll(() => {
    core = CoreSetup.init().useAll()
    documentStore = useDocumentStore()
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    wrapper.unmount()
    documentStore.reset()
  })

  it('should display document with 8 metadata', () => {
    documentStore.setDocument(RawDocBuilder.build(id, index).toRaw())

    wrapper = mount(DocumentViewTabsMetadata, { global: { plugins: core.plugins, stubs } })

    const inputs = wrapper.findAll('.document-view-tabs-metadata__entry')
    expect(inputs).toHaveLength(8)
  })

  it('should display "File on disk" when extractionLevel metadata is missing', () => {
    documentStore.setDocument(RawDocBuilder.build(id, index).toRaw())

    wrapper = mount(DocumentViewTabsMetadata, { global: { plugins: core.plugins, stubs } })

    const extractionLevelEntry = wrapper.findAll('.document-view-tabs-metadata__entry')
      .find(el => el.text().includes('Extraction level'))

    expect(extractionLevelEntry).toBeDefined()
    expect(extractionLevelEntry.text()).toContain('File on disk')
  })

  it('should display document with 8 metadata (including language)', () => {
    documentStore.setDocument(RawDocBuilder.build(id, index).withLanguage('FRENCH').toRaw())

    wrapper = mount(DocumentViewTabsMetadata, { global: { plugins: core.plugins, stubs } })

    const inputs = wrapper.findAll('.document-metadata__value')
    const values = inputs.map(input => input.text())
    expect(values).toContain('French')
  })

  it('should filter the list with a query', async () => {
    documentStore.setDocument(RawDocBuilder.build(id, index).toRaw())

    wrapper = mount(DocumentViewTabsMetadata, { global: { plugins: core.plugins, stubs } })

    wrapper.vm.q = 'language'
    await wrapper.vm.$nextTick()
    const inputs = wrapper.findAll('.document-view-tabs-metadata__entry')
    expect(inputs).toHaveLength(8)
  })
})
