import { shallowMount } from '@vue/test-utils'

import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import CoreSetup from '~tests/unit/CoreSetup'
import { IndexedDocument, letData } from '~tests/unit/es_utils'
import DocumentViewTabsViewer from '@/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsViewer'

describe('DocumentViewTabsViewer.vue', () => {
  const { index, es } = esConnectionHelper.build()
  const id = 'document'
  const disabled = true
  let core

  beforeEach(() => {
    core = CoreSetup.init().useAll()
  })

  it('should call the DocumentViewerLegacySpreadsheet component for XLSX document', async () => {
    const document = await letData(es)
      .have(
        new IndexedDocument(id, index).withContentType(
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
      )
      .commitAndGetLastDocument()

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

    const wrapper = shallowMount(DocumentViewTabsViewer, {
      global: {
        plugins: core.plugins,
        renderStubDefaultSlot: true
      },
      props: { document, disabled }
    })
    expect(wrapper.vm.previewComponent).toBe('DocumentViewerLegacySpreadsheet')
  })

  it('should call the DocumentViewerPaginated component for PDF document', async () => {
    const document = await letData(es)
      .have(new IndexedDocument(id, index).withContentType('application/pdf'))
      .commitAndGetLastDocument()

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
