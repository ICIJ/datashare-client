import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import RawDocBuilder from '~tests/unit/RawDocBuilder'
import DocumentViewTabsViewer from '@/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsViewer'
import { useDocumentStore } from '@/store/modules'

describe('DocumentViewTabsViewer.vue', () => {
  const index = 'test-index'
  const id = '/home/datashare/data/test.document'
  const disabled = true
  let core, documentStore

  beforeAll(() => {
    core = CoreSetup.init().useAll()
  })

  beforeEach(() => {
    core.createPinia()
    documentStore = useDocumentStore()
  })

  afterEach(() => {
    documentStore.reset()
  })

  it('should call the DocumentViewerLegacySpreadsheet component for XLSX document', () => {
    documentStore.setDocument(
      RawDocBuilder.build(id, index)
        .withContentType('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        .toRaw()
    )
    const document = documentStore.document
    const wrapper = shallowMount(DocumentViewTabsViewer, {
      global: { plugins: core.plugins, renderStubDefaultSlot: true },
      props: { document, disabled }
    })
    expect(wrapper.vm.previewComponent).toBe('DocumentViewerLegacySpreadsheet')
  })

  it('should call the DocumentViewerLegacySpreadsheet component for CSV document', () => {
    documentStore.setDocument(RawDocBuilder.build(id, index).withContentType('text/csv').toRaw())
    const document = documentStore.document
    const wrapper = shallowMount(DocumentViewTabsViewer, {
      global: { plugins: core.plugins, renderStubDefaultSlot: true },
      props: { document, disabled }
    })
    expect(wrapper.vm.previewComponent).toBe('DocumentViewerLegacySpreadsheet')
  })

  it('should call the DocumentViewerPaginated component for Word document', () => {
    documentStore.setDocument(RawDocBuilder.build(id, index).withContentType('application/msword').toRaw())
    const document = documentStore.document
    const wrapper = shallowMount(DocumentViewTabsViewer, {
      global: { plugins: core.plugins, renderStubDefaultSlot: true },
      props: { document, disabled }
    })
    expect(wrapper.vm.previewComponent).toBe('DocumentViewerPaginated')
  })

  it('should call the DocumentViewerTiff component for TIFF document', () => {
    documentStore.setDocument(RawDocBuilder.build(id, index).withContentType('image/tiff').toRaw())
    const document = documentStore.document
    const wrapper = shallowMount(DocumentViewTabsViewer, {
      global: { plugins: core.plugins, renderStubDefaultSlot: true },
      props: { document, disabled }
    })
    expect(wrapper.vm.previewComponent).toBe('DocumentViewerTiff')
  })

  it('should call the DocumentViewerAudio component for audio document', () => {
    documentStore.setDocument(RawDocBuilder.build(id, index).withContentType('audio/ogg').toRaw())
    const document = documentStore.document
    const wrapper = shallowMount(DocumentViewTabsViewer, {
      global: { plugins: core.plugins, renderStubDefaultSlot: true },
      props: { document, disabled }
    })
    expect(wrapper.vm.previewComponent).toBe('DocumentViewerAudio')
  })

  it('should call the DocumentViewerVideo component for video document', () => {
    documentStore.setDocument(RawDocBuilder.build(id, index).withContentType('video/mp4').toRaw())
    const document = documentStore.document
    const wrapper = shallowMount(DocumentViewTabsViewer, {
      global: { plugins: core.plugins, renderStubDefaultSlot: true },
      props: { document, disabled }
    })
    expect(wrapper.vm.previewComponent).toBe('DocumentViewerVideo')
  })
})
