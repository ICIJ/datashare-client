import { flushPromises, shallowMount } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'

import CoreSetup from '~tests/unit/CoreSetup'
import DocumentViewerPdf from '@/components/Document/DocumentViewer/DocumentViewerPdf'
import DocumentToolbox from '@/components/Document/DocumentToolbox/DocumentToolbox'
import DocumentViewerPdfEmbedded from '@/components/Document/DocumentViewer/DocumentViewerPdf/DocumentViewerPdfEmbedded'
import { useDocumentViewStore } from '@/store/modules/documentView'

const findHighlights = vi.fn().mockResolvedValue([])
const pdf = ref(null)
const sizes = ref([])
const error = ref(null)
let usePDFSrc = null
let usePDFOptions = null

// @tato30/vue-pdf bundles its own pdfjs-dist copy, which constructs a
// DOMMatrix at module scope; jsdom has no DOMMatrix, so merely importing the
// PDF page component (even stubbed by shallowMount) crashes the test file.
vi.mock('@tato30/vue-pdf', () => ({ VuePDF: {} }))

// The component fetches path banners on mount to decide whether to blur the
// preview; left unmocked it fires a real request that fails in jsdom.
vi.mock('@/api/apiInstance', () => ({
  apiInstance: {
    getPathBanners: vi.fn().mockResolvedValue([])
  }
}))

vi.mock('@/composables/usePDF', () => {
  return {
    usePDF: (src, options) => {
      usePDFSrc = src
      usePDFOptions = options
      return {
        error,
        findHighlights,
        load: vi.fn(),
        isLoading: { value: false },
        loaderId: 'pdf',
        pdf,
        pdfDoc: { value: null },
        numPages: ref(3),
        sizes
      }
    }
  }
})

describe('DocumentViewerPdf.vue', () => {
  const document = {
    index: 'foo',
    id: 'doc-id',
    routing: 'root-id',
    fullUrl: 'http://localhost/doc.pdf',
    source: { metadata: {} },
    tags: []
  }

  function mountViewer(stubs = {}, props = {}) {
    const { plugins } = CoreSetup.init().useAll()
    return shallowMount(DocumentViewerPdf, {
      props: { document, ...props },
      global: { plugins, renderStubDefaultSlot: true, stubs: { DocumentToolbox: false, ...stubs } }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ shouldAdvanceTime: true })
    pdf.value = null
    sizes.value = []
    error.value = null
    usePDFSrc = null
    findHighlights.mockResolvedValue([])
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // The local search debounces the term before it searches it.
  async function search(wrapper, value) {
    wrapper.findComponent(DocumentToolbox).vm.$emit('update:modelValue', value)
    await vi.advanceTimersByTimeAsync(300)
    await flushPromises()
  }

  it('renders its header with the shared toolbox', () => {
    const wrapper = mountViewer()
    expect(wrapper.findComponent(DocumentToolbox).exists()).toBe(true)
  })

  it('gives the toolbox the number of PDF pages', () => {
    const wrapper = mountViewer()
    expect(wrapper.findComponent(DocumentToolbox).props('totalPages')).toBe(3)
  })

  it('registers no hook position', () => {
    const wrapper = mountViewer()
    expect(wrapper.findComponent(DocumentToolbox).props('hookPrefix')).toBe(null)
  })

  it('hides the occurrence count of the global search terms', () => {
    const wrapper = mountViewer()
    expect(wrapper.findComponent(DocumentToolbox).props('noCount')).toBe(true)
  })

  it('puts the PDF dropdown in the toolbox dropdown slot', () => {
    const wrapper = mountViewer()
    expect(wrapper.findComponent({ name: 'DocumentViewerPdfDropdown' }).exists()).toBe(true)
  })

  it('searches the term again when another PDF is loaded', async () => {
    const wrapper = mountViewer()
    findHighlights.mockResolvedValue([{ page: 1 }, { page: 2 }])
    await search(wrapper, 'invoice')
    expect(wrapper.findComponent(DocumentToolbox).props('occurrences')).toBe(2)
    findHighlights.mockResolvedValue([{ page: 3 }])
    pdf.value = {}
    await flushPromises()
    expect(wrapper.findComponent(DocumentToolbox).props('occurrences')).toBe(1)
  })

  it('asks the page holding a single highlight to apply it again', async () => {
    const applyHighlight = vi.fn()
    const DocumentViewerPdfPage = defineComponent({
      props: { page: { type: Number, default: 0 } },
      setup(props, { expose }) {
        expose({ applyHighlight: () => applyHighlight(props.page) })
        return () => h('div')
      }
    })
    sizes.value = [{ page: 1 }, { page: 2 }]
    const wrapper = mountViewer({ DocumentViewerPdfPage })
    findHighlights.mockResolvedValue([{ page: 2 }])
    pdf.value = {}
    await search(wrapper, 'invoice')
    await wrapper.findComponent(DocumentToolbox).vm.$emit('reactivate')
    expect(applyHighlight).toHaveBeenCalledExactlyOnceWith(2)
  })

  it('offsets the pages by the height the toolbox reports', async () => {
    const wrapper = mountViewer()
    expect(wrapper.vm.toolboxHeight).toBe(0)
  })

  it('loads the document URL when no src is given', () => {
    mountViewer()
    expect(usePDFSrc.value).toBe('http://localhost/doc.pdf')
  })

  it('loads the given src', () => {
    mountViewer({}, { src: 'http://preview/api/v1/pdf/foo/doc-id?routing=root-id' })
    expect(usePDFSrc.value).toBe('http://preview/api/v1/pdf/foo/doc-id?routing=root-id')
  })

  it('sends no session header for the document URL', () => {
    mountViewer()
    expect(usePDFOptions.httpHeaders.value).toBeNull()
  })

  it('sends the session header with the given src', () => {
    mountViewer({}, { src: 'http://preview/api/v1/pdf/foo/doc-id?routing=root-id' })
    expect(Object.keys(usePDFOptions.httpHeaders.value)[0]).toMatch(/^X-/)
  })

  it('emits error when the PDF fails to load', async () => {
    const wrapper = mountViewer()
    error.value = new Error('415')
    await flushPromises()
    expect(wrapper.emitted('error')[0][0].message).toBe('415')
  })

  describe('in embedded mode', () => {
    afterEach(() => {
      useDocumentViewStore().embeddedPdf = false
    })

    it('renders the embedded viewer for the document URL', () => {
      const { plugins } = CoreSetup.init().useAll()
      useDocumentViewStore().embeddedPdf = true
      const wrapper = shallowMount(DocumentViewerPdf, { props: { document }, global: { plugins } })
      expect(wrapper.findComponent(DocumentViewerPdfEmbedded).exists()).toBe(true)
    })

    it('loads the given src with PDF.js instead of embedding it', () => {
      const { plugins } = CoreSetup.init().useAll()
      useDocumentViewStore().embeddedPdf = true
      const props = { document, src: 'http://preview/api/v1/pdf/foo/doc-id?routing=root-id' }
      const wrapper = shallowMount(DocumentViewerPdf, { props, global: { plugins } })
      expect(wrapper.findComponent(DocumentViewerPdfEmbedded).exists()).toBe(false)
      expect(usePDFSrc.value).toBe('http://preview/api/v1/pdf/foo/doc-id?routing=root-id')
    })
  })
})
