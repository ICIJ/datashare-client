import { mount } from '@vue/test-utils'
import { dirname } from 'path'

import CoreSetup from '~tests/unit/CoreSetup'
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

  function makeRawDoc(overrides = {}) {
    return {
      _id: id,
      _index: index,
      _source: {
        type: 'Document',
        path: id,
        dirname: dirname(id),
        title: id,
        language: 'ENGLISH',
        extractionLevel: 0,
        metadata: {
          tika_metadata_resourcename: id,
          tika_metadata_another_metadata: null,
          tika_metadata_content_type: null,
          tika_metadata_dcterms_created: null,
          tika_metadata_dc_creator: null
        },
        ...overrides
      }
    }
  }

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
    documentStore.setDocument(makeRawDoc())

    wrapper = mount(DocumentViewTabsMetadata, { global: { plugins: core.plugins, stubs } })

    const inputs = wrapper.findAll('.document-view-tabs-metadata__entry')
    expect(inputs).toHaveLength(8)
  })

  it('should display "File on disk" when extractionLevel metadata is missing', () => {
    documentStore.setDocument(makeRawDoc())

    wrapper = mount(DocumentViewTabsMetadata, { global: { plugins: core.plugins, stubs } })

    const extractionLevelEntry = wrapper.findAll('.document-view-tabs-metadata__entry')
      .find(el => el.text().includes('Extraction level'))

    expect(extractionLevelEntry).toBeDefined()
    expect(extractionLevelEntry.text()).toContain('File on disk')
  })

  it('should display document with 8 metadata (including language)', () => {
    documentStore.setDocument(makeRawDoc({ language: 'FRENCH' }))

    wrapper = mount(DocumentViewTabsMetadata, { global: { plugins: core.plugins, stubs } })

    const inputs = wrapper.findAll('.document-metadata__value')
    const values = inputs.map(input => input.text())
    expect(values).toContain('French')
  })

  it('should filter the list with a query', async () => {
    documentStore.setDocument(makeRawDoc())

    wrapper = mount(DocumentViewTabsMetadata, { global: { plugins: core.plugins, stubs } })

    wrapper.vm.q = 'language'
    await wrapper.vm.$nextTick()
    const inputs = wrapper.findAll('.document-view-tabs-metadata__entry')
    expect(inputs).toHaveLength(8)
  })
})
