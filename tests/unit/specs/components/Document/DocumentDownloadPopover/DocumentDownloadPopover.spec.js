import { shallowMount, flushPromises } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import Document from '@/api/resources/Document'
import DocumentDownloadPopover from '@/components/Document/DocumentDownloadPopover/DocumentDownloadPopover'
import { apiInstance } from '@/api/apiInstance'

describe('DocumentDownloadPopover.vue', () => {
  let core, plugins

  beforeAll(() => {
    core = CoreSetup.init().useAll()
  })

  beforeEach(() => {
    core.createPinia()
    plugins = core.plugins
    URL.createObjectURL = vi.fn().mockReturnValue('blob:fake-url')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  function createDocument(overrides = {}) {
    return new Document({
      _id: 'test-doc-id',
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
    const doc = createDocument()
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
    const doc = createDocument()
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
    const doc = createDocument({
      content_translated: [{ content: 'translated text', target_language: 'ENGLISH' }]
    })

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
})
