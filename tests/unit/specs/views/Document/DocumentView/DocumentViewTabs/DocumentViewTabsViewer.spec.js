import { shallowMount } from '@vue/test-utils'

import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import CoreSetup from '~tests/unit/CoreSetup'
import { IndexedDocument, letData } from '~tests/unit/es_utils'
import DocumentViewTabsViewer from '@/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsViewer'
import { useDocumentStore } from '@/store/modules'

describe('DocumentViewTabsViewer.vue', () => {
  const { index, es } = esConnectionHelper.build()
  const id = 'document'
  const disabled = true
  let core, documentStore

  beforeEach(() => {
    core = CoreSetup.init().useAll()
    documentStore = useDocumentStore()
  })

  afterEach(() => {
    documentStore.reset()
  })

  it('should call the DocumentViewerLegacySpreadsheet component for XLSX document', async () => {
    const document = await letData(es)
      .have(
        new IndexedDocument(id, index).withContentType(
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
      )
      .commitAndGetLastDocument()

    await documentStore.getDocument({ id, index })

    const wrapper = shallowMount(DocumentViewTabsViewer, {
      global: {
        plugins: core.plugins,
        renderStubDefaultSlot: true
      },
      props: { document, disabled }
    })
    expect(wrapper.vm.previewComponent).toBe('DocumentViewerLegacySpreadsheet')
  })

  it('should call the DocumentViewerLegacySpreadsheet component for CSV document', async () => {
    const document = await letData(es)
      .have(new IndexedDocument(id, index).withContentType('text/csv'))
      .commitAndGetLastDocument()
    await documentStore.getDocument({ id, index })

    const wrapper = shallowMount(DocumentViewTabsViewer, {
      global: {
        plugins: core.plugins,
        renderStubDefaultSlot: true
      },
      props: { document, disabled }
    })
    expect(wrapper.vm.previewComponent).toBe('DocumentViewerLegacySpreadsheet')
  })

  it('should call the DocumentViewerPaginated component for Word document', async () => {
    const document = await letData(es)
      .have(new IndexedDocument(id, index).withContentType('application/msword'))
      .commitAndGetLastDocument()
    await documentStore.getDocument({ id, index })

    const wrapper = shallowMount(DocumentViewTabsViewer, {
      global: {
        plugins: core.plugins,
        renderStubDefaultSlot: true
      },
      props: { document, disabled }
    })
    expect(wrapper.vm.previewComponent).toBe('DocumentViewerPaginated')
  })

  it('should call the DocumentViewerTiff component for TIFF document', async () => {
    const document = await letData(es)
      .have(new IndexedDocument(id, index).withContentType('image/tiff'))
      .commitAndGetLastDocument()
    await documentStore.getDocument({ id, index })

    const wrapper = shallowMount(DocumentViewTabsViewer, {
      global: {
        plugins: core.plugins,
        renderStubDefaultSlot: true
      },
      props: { document, disabled }
    })
    expect(wrapper.vm.previewComponent).toBe('DocumentViewerTiff')
  })

  it('should call the DocumentViewerAudio component for audio document', async () => {
    const document = await letData(es)
      .have(new IndexedDocument(id, index).withContentType('audio/ogg'))
      .commitAndGetLastDocument()
    await documentStore.getDocument({ id, index })

    const wrapper = shallowMount(DocumentViewTabsViewer, {
      global: {
        plugins: core.plugins,
        renderStubDefaultSlot: true
      },
      props: { document, disabled }
    })

    expect(wrapper.vm.previewComponent).toBe('DocumentViewerAudio')
  })

  it('should call the DocumentViewerVideo component for video document', async () => {
    const document = await letData(es)
      .have(new IndexedDocument(id, index).withContentType('video/mp4'))
      .commitAndGetLastDocument()
    await documentStore.getDocument({ id, index })

    const wrapper = shallowMount(DocumentViewTabsViewer, {
      global: {
        plugins: core.plugins,
        renderStubDefaultSlot: true
      },
      props: { document, disabled }
    })

    expect(wrapper.vm.previewComponent).toBe('DocumentViewerVideo')
  })
})
