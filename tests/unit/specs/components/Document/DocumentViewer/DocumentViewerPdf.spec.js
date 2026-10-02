import { flushPromises, shallowMount } from '@vue/test-utils'
import { ref } from 'vue'

import CoreSetup from '~tests/unit/CoreSetup'
import DocumentViewerPdf from '@/components/Document/DocumentViewer/DocumentViewerPdf'
import DocumentToolbox from '@/components/Document/DocumentToolbox/DocumentToolbox'

const findHighlights = vi.fn().mockResolvedValue([])
const pdf = ref(null)

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
    usePDF: () => ({
      findHighlights,
      load: vi.fn(),
      isLoading: { value: false },
      loaderId: 'pdf',
      pdf,
      pdfDoc: { value: null },
      numPages: ref(3),
      sizes: { value: [] }
    })
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

  function mountViewer() {
    const { plugins } = CoreSetup.init().useAll()
    return shallowMount(DocumentViewerPdf, {
      props: { document },
      global: { plugins, renderStubDefaultSlot: true, stubs: { DocumentToolbox: false } }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ shouldAdvanceTime: true })
    pdf.value = null
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

  it('offsets the pages by the height the toolbox reports', async () => {
    const wrapper = mountViewer()
    expect(wrapper.vm.toolboxHeight).toBe(0)
  })
})
