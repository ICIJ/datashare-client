import { shallowMount, flushPromises } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import Document from '@/api/resources/Document'
import DocumentDownloadPopover from '@/components/Document/DocumentDownloadPopover/DocumentDownloadPopover'
import { apiInstance } from '@/api/apiInstance'

describe('DocumentDownloadPopover.vue', () => {
  let core, plugins

  beforeEach(() => {
    core = CoreSetup.init().useAll()
    core.createPinia()
    plugins = core.plugins
    URL.createObjectURL = vi.fn().mockReturnValue('blob:fake-url')
    apiInstance.getStructureManifest = vi.fn().mockResolvedValue(null)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  function createDocument(overrides = {}, id = 'test-doc-id') {
    return new Document({
      _id: id,
      _index: 'test-index',
      _source: {
        title: 'test-doc',
        path: '/path/to/test-doc.pdf',
        contentType: 'application/pdf',
        content: 'some content',
        ...overrides
      }
    })
  }

  const AppPopoverStub = {
    name: 'AppPopover',
    template: '<div><slot name="target" /><slot /></div>'
  }

  function mountPopover(document) {
    return shallowMount(DocumentDownloadPopover, {
      global: {
        plugins,
        stubs: {
          AppPopover: AppPopoverStub
        }
      },
      props: { document }
    })
  }

  it('should show the translation download button when document has translations', async () => {
    apiInstance.elasticsearch.getSource = vi.fn().mockResolvedValue({
      content_translated: [{ target_language: 'ENGLISH' }]
    })
    apiInstance.isDocumentDownloadable = vi.fn().mockResolvedValue(true)
    const doc = createDocument({}, 'test-doc-id-with-translations')
    const wrapper = mountPopover(doc)
    await flushPromises()
    const buttons = wrapper.findAll('.document-download-popover__body__button')
    const labels = buttons.map(btn => btn.attributes('label'))
    expect(labels).toContain('Download text translation')
  })

  it('should not show the translation download button when document has no translations', async () => {
    apiInstance.elasticsearch.getSource = vi.fn().mockResolvedValue({
      content_translated: []
    })
    apiInstance.isDocumentDownloadable = vi.fn().mockResolvedValue(true)
    const doc = createDocument({}, 'test-doc-id-without-translations')
    const wrapper = mountPopover(doc)
    await flushPromises()
    const buttons = wrapper.findAll('.document-download-popover__body__button')
    const labels = buttons.map(btn => btn.attributes('label'))
    expect(labels).not.toContain('Download text translation')
  })

  it('should trigger download when the translation button is clicked', async () => {
    apiInstance.elasticsearch.getSource = vi.fn().mockResolvedValue({
      content_translated: [{ target_language: 'ENGLISH' }]
    })
    apiInstance.isDocumentDownloadable = vi.fn().mockResolvedValue(true)
    const doc = createDocument(
      { content_translated: [{ content: 'translated text', target_language: 'ENGLISH' }] },
      'test-doc-id-translation-click'
    )

    const fakeAnchor = { href: '', download: '', click: vi.fn() }
    const originalCreateElement = window.document.createElement.bind(window.document)
    vi.spyOn(window.document, 'createElement').mockImplementation((tag) => {
      if (tag === 'a') return fakeAnchor
      return originalCreateElement(tag)
    })

    const wrapper = mountPopover(doc)
    await flushPromises()
    const buttons = wrapper.findAll('.document-download-popover__body__button')
    const translationButton = buttons.find(btn => btn.attributes('label') === 'Download text translation')
    expect(translationButton.exists()).toBe(true)
    await translationButton.trigger('click')
    expect(fakeAnchor.click).toHaveBeenCalled()
  })

  it('should enable the download button while the download status is unknown', async () => {
    apiInstance.elasticsearch.getSource = vi.fn().mockResolvedValue({ content_translated: [] })
    apiInstance.isDocumentDownloadable = vi.fn(() => new Promise(() => {}))
    const wrapper = mountPopover(createDocument())
    const buttons = wrapper.findAll('.document-download-popover__body__button')
    const downloadButton = buttons.find(btn => btn.attributes('label') === 'Download')
    expect(downloadButton.attributes('disabled')).toBe('false')
  })

  it('should disable the download button when the backend refuses the download', async () => {
    apiInstance.elasticsearch.getSource = vi.fn().mockResolvedValue({ content_translated: [] })
    apiInstance.isDocumentDownloadable = vi.fn().mockResolvedValue(false)
    const wrapper = mountPopover(createDocument())
    await flushPromises()
    const buttons = wrapper.findAll('.document-download-popover__body__button')
    const downloadButton = buttons.find(btn => btn.attributes('label') === 'Download')
    expect(downloadButton.attributes('disabled')).toBe('true')
  })

  // It targets the same source endpoint as the main download button, only with
  // filter_metadata=true, so the backend refuses it for the same reasons.
  it('should disable the download-without-metadata button when the backend refuses the download', async () => {
    apiInstance.elasticsearch.getSource = vi.fn().mockResolvedValue({ content_translated: [] })
    apiInstance.isDocumentDownloadable = vi.fn().mockResolvedValue(false)
    const wrapper = mountPopover(createDocument())
    await flushPromises()
    const buttons = wrapper.findAll('.document-download-popover__body__button')
    const label = 'Download without metadata'
    const withoutMetadataButton = buttons.find(btn => btn.attributes('label') === label)
    expect(withoutMetadataButton.exists()).toBe(true)
    expect(withoutMetadataButton.attributes('disabled')).toBe('true')
  })

  it('should keep the download button enabled when the backend allows the download', async () => {
    apiInstance.elasticsearch.getSource = vi.fn().mockResolvedValue({ content_translated: [] })
    apiInstance.isDocumentDownloadable = vi.fn().mockResolvedValue(true)
    const wrapper = mountPopover(createDocument())
    await flushPromises()
    const buttons = wrapper.findAll('.document-download-popover__body__button')
    const downloadButton = buttons.find(btn => btn.attributes('label') === 'Download')
    expect(downloadButton.attributes('disabled')).toBe('false')
  })

  it('should show the markdown download button when the document has a markdown artifact', async () => {
    apiInstance.elasticsearch.getSource = vi.fn().mockResolvedValue({ content_translated: [] })
    apiInstance.isDocumentDownloadable = vi.fn().mockResolvedValue(true)
    apiInstance.getStructureManifest = vi.fn().mockResolvedValue({ pages: 1, formats: ['md'] })
    const wrapper = mountPopover(createDocument({}, 'test-doc-id-with-markdown'))
    await flushPromises()
    const buttons = wrapper.findAll('.document-download-popover__body__button')
    const labels = buttons.map(btn => btn.attributes('label'))
    expect(labels).toContain('Download markdown')
  })

  it('should not show the markdown download button when the document has no markdown artifact', async () => {
    apiInstance.elasticsearch.getSource = vi.fn().mockResolvedValue({ content_translated: [] })
    apiInstance.isDocumentDownloadable = vi.fn().mockResolvedValue(true)
    apiInstance.getStructureManifest = vi.fn().mockResolvedValue(null)
    const wrapper = mountPopover(createDocument({}, 'test-doc-id-without-markdown'))
    await flushPromises()
    const buttons = wrapper.findAll('.document-download-popover__body__button')
    const labels = buttons.map(btn => btn.attributes('label'))
    expect(labels).not.toContain('Download markdown')
  })

  it('should trigger a download when the markdown button is clicked', async () => {
    apiInstance.elasticsearch.getSource = vi.fn().mockResolvedValue({ content_translated: [] })
    apiInstance.isDocumentDownloadable = vi.fn().mockResolvedValue(true)
    apiInstance.getStructureManifest = vi.fn().mockResolvedValue({ pages: 1, formats: ['md'] })
    apiInstance.getStructurePage = vi.fn().mockResolvedValue('# Hello')

    const fakeAnchor = { href: '', download: '', click: vi.fn() }
    const originalCreateElement = window.document.createElement.bind(window.document)
    vi.spyOn(window.document, 'createElement').mockImplementation((tag) => {
      if (tag === 'a') return fakeAnchor
      return originalCreateElement(tag)
    })

    const wrapper = mountPopover(createDocument({}, 'test-doc-id-markdown-click'))
    await flushPromises()
    const buttons = wrapper.findAll('.document-download-popover__body__button')
    const markdownButton = buttons.find(btn => btn.attributes('label') === 'Download markdown')
    expect(markdownButton.exists()).toBe(true)
    await markdownButton.trigger('click')
    await flushPromises()
    expect(fakeAnchor.click).toHaveBeenCalled()
  })
})
