import { shallowMount } from '@vue/test-utils'

import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import CoreSetup from '~tests/unit/CoreSetup'
import { IndexedDocument, letData } from '~tests/unit/es_utils'
import DocumentTabPreview from '@/components/document/DocumentTabPreview'

describe('DocumentTabPreview.vue', () => {
  const { index, es } = esConnectionHelper.build()
  const id = 'document'
  const disabled = true
  let core

  beforeEach(() => {
    core = CoreSetup.init().useAll()
  })

  it('should call the LegacySpreadsheetViewer component for XLSX document', async () => {
    const document = await letData(es)
      .have(
        new IndexedDocument(id, index).withContentType(
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
      )
      .commitAndGetLastDocument()

    const wrapper = shallowMount(DocumentTabPreview, {
      global: {
        plugins: core.plugins,
        renderStubDefaultSlot: true
      },
      props: { document, disabled }
    })
    expect(wrapper.vm.previewComponent).toBe('LegacySpreadsheetViewer')
  })

  it('should call the LegacySpreadsheetViewer component for CSV document', async () => {
    const document = await letData(es)
      .have(new IndexedDocument(id, index).withContentType('text/csv'))
      .commitAndGetLastDocument()

    const wrapper = shallowMount(DocumentTabPreview, {
      global: {
        plugins: core.plugins,
        renderStubDefaultSlot: true
      },
      props: { document, disabled }
    })
    expect(wrapper.vm.previewComponent).toBe('LegacySpreadsheetViewer')
  })

  it('should call the PaginatedViewer component for PDF document', async () => {
    const document = await letData(es)
      .have(new IndexedDocument(id, index).withContentType('application/pdf'))
      .commitAndGetLastDocument()

    const wrapper = shallowMount(DocumentTabPreview, {
      global: {
        plugins: core.plugins,
        renderStubDefaultSlot: true
      },
      props: { document, disabled }
    })
    expect(wrapper.vm.previewComponent).toBe('PaginatedViewer')
  })

  it('should call the TiffViewer component for TIFF document', async () => {
    const document = await letData(es)
      .have(new IndexedDocument(id, index).withContentType('image/tiff'))
      .commitAndGetLastDocument()

    const wrapper = shallowMount(DocumentTabPreview, {
      global: {
        plugins: core.plugins,
        renderStubDefaultSlot: true
      },
      props: { document, disabled }
    })
    expect(wrapper.vm.previewComponent).toBe('TiffViewer')
  })

  it('should call the AudioViewer component for audio document', async () => {
    const document = await letData(es)
      .have(new IndexedDocument(id, index).withContentType('audio/ogg'))
      .commitAndGetLastDocument()

    const wrapper = shallowMount(DocumentTabPreview, {
      global: {
        plugins: core.plugins,
        renderStubDefaultSlot: true
      },
      props: { document, disabled }
    })

    expect(wrapper.vm.previewComponent).toBe('AudioViewer')
  })

  it('should call the VideoViewer component for video document', async () => {
    const document = await letData(es)
      .have(new IndexedDocument(id, index).withContentType('video/mp4'))
      .commitAndGetLastDocument()

    const wrapper = shallowMount(DocumentTabPreview, {
      global: {
        plugins: core.plugins,
        renderStubDefaultSlot: true
      },
      props: { document, disabled }
    })

    expect(wrapper.vm.previewComponent).toBe('VideoViewer')
  })
})
