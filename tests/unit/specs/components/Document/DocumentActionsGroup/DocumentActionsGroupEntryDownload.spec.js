import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import Document from '@/api/resources/Document'
import DocumentActionsGroupEntryDownload from '@/components/Document/DocumentActionsGroup/DocumentActionsGroupEntryDownload'
import { apiInstance } from '@/api/apiInstance'
import { useDocumentDownloadStore } from '@/store/modules'

describe('DocumentActionsGroupEntryDownload.vue', () => {
  let core, plugins

  beforeEach(() => {
    core = CoreSetup.init().useAll()
    core.createPinia()
    plugins = core.plugins
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

  // The real popover isn't relevant here: it's stubbed with a template that
  // renders its "target" slot so the download button (rendered inside it)
  // shows up in the shallow-mounted tree, mirroring DocumentDownloadPopover.spec.js
  const DocumentDownloadPopoverStub = {
    name: 'DocumentDownloadPopover',
    template: '<div><slot name="target" /></div>'
  }

  function mountDownload(document) {
    return shallowMount(DocumentActionsGroupEntryDownload, {
      global: {
        plugins,
        stubs: {
          DocumentDownloadPopover: DocumentDownloadPopoverStub
        }
      },
      props: { document }
    })
  }

  function findButton(wrapper) {
    return wrapper.find('.document-actions-group-entry-download')
  }

  it('should set the download href while the HEAD probe is still in flight', () => {
    apiInstance.isDocumentDownloadable = vi.fn(() => new Promise(() => {}))
    const doc = createDocument()
    const wrapper = mountDownload(doc)
    expect(findButton(wrapper).attributes('href')).toBe(doc.fullUrl)
  })

  it('should clear the download href when the backend refuses the download', async () => {
    apiInstance.isDocumentDownloadable = vi.fn().mockResolvedValue(false)
    const doc = createDocument()
    await useDocumentDownloadStore().fetchDocumentStatus(doc)
    const wrapper = mountDownload(doc)
    expect(findButton(wrapper).attributes('href')).toBeFalsy()
  })

  it('should set the download href when the backend allows the download', async () => {
    apiInstance.isDocumentDownloadable = vi.fn().mockResolvedValue(true)
    const doc = createDocument()
    await useDocumentDownloadStore().fetchDocumentStatus(doc)
    const wrapper = mountDownload(doc)
    expect(findButton(wrapper).attributes('href')).toBe(doc.fullUrl)
  })

  // The button is the popover's trigger: the popover still offers the extracted
  // text, the translations and the root document when the source is refused, so
  // disabling the trigger would put those out of reach.
  it('should never disable the download button, even when the backend refuses the download', async () => {
    apiInstance.isDocumentDownloadable = vi.fn().mockResolvedValue(false)
    const doc = createDocument()
    await useDocumentDownloadStore().fetchDocumentStatus(doc)
    const wrapper = mountDownload(doc)
    expect(findButton(wrapper).attributes('disabled')).toBe('false')
  })

  it('should follow the document when a recycled row is handed another one', async () => {
    apiInstance.isDocumentDownloadable = vi.fn().mockResolvedValue(true)
    const doc = createDocument()
    const otherDoc = new Document({
      _id: 'other-doc-id',
      _index: 'test-index',
      _source: { title: 'other-doc', contentType: 'application/pdf' }
    })
    const wrapper = mountDownload(doc)
    await wrapper.setProps({ document: otherDoc })
    expect(findButton(wrapper).attributes('href')).toBe(otherDoc.fullUrl)
  })
})
