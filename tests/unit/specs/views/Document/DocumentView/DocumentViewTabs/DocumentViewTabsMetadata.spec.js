import { mount } from '@vue/test-utils'

import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import CoreSetup from '~tests/unit/CoreSetup'
import { IndexedDocument, letData } from '~tests/unit/es_utils'
import DocumentViewTabsMetadata from '@/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsMetadata'
import { useDocumentStore } from '@/store/modules'

vi.mock('@/api/apiInstance', async (importOriginal) => {
  const { apiInstance } = await importOriginal()

  return {
    apiInstance: {
      ...apiInstance,
      retrieveNotes: vi.fn().mockResolvedValue([])
    }
  }
})

describe('DocumentViewTabsMetadata.vue', () => {
  const { index, es } = esConnectionHelper.build()
  let wrapper, core, documentStore

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

  it('should display document with 7 metadata', async () => {
    const id = '/home/datashare/data/foo.txt'
    await letData(es).have(new IndexedDocument(id, index)).commit()
    await documentStore.getDocument({ id, index })

    wrapper = mount(DocumentViewTabsMetadata, {
      global: {
        plugins: core.plugins
      }
    })

    const inputs = wrapper.findAll('.document-view-tabs-metadata__entry')
    expect(inputs).toHaveLength(7)
  })

  it('should display document with 7 metadata (including language)', async () => {
    const id = '/home/datashare/data/foo.txt'
    const document = new IndexedDocument(id, index).withLanguage('FRENCH')
    await letData(es).have(document).commit()
    await documentStore.getDocument({ id, index })

    wrapper = mount(DocumentViewTabsMetadata, {
      global: {
        plugins: core.plugins
      }
    })

    const inputs = wrapper.findAll('.document-metadata__value')
    const values = inputs.map(input => input.text())
    expect(values).toContain('French')
  })

  it('should filter the list with a query', async () => {
    const id = '/home/datashare/data/foo.txt'
    const document = new IndexedDocument(id, index)
    await letData(es).have(document).commit()
    await documentStore.getDocument({ id, index })

    wrapper = mount(DocumentViewTabsMetadata, {
      global: {
        plugins: core.plugins
      }
    })

    wrapper.vm.q = 'language'
    await wrapper.vm.$nextTick()
    const inputs = wrapper.findAll('.document-view-tabs-metadata__entry')
    expect(inputs).toHaveLength(7)
  })
})
