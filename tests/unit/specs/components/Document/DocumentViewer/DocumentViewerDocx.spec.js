import { readFileSync } from 'fs'
import { resolve } from 'path'

import { flushPromises, shallowMount } from '@vue/test-utils'
import { renderAsync } from 'docx-preview'

import CoreSetup from '~tests/unit/CoreSetup'
import DocumentViewerDocx from '@/components/Document/DocumentViewer/DocumentViewerDocx'
import DocumentToolbox from '@/components/Document/DocumentToolbox/DocumentToolbox'
import DismissableContentWarningToggler from '@/components/Dismissable/DismissableContentWarningToggler'
import { useDocumentPathBannersStore } from '@/store/modules'

vi.mock('docx-preview', () => ({ renderAsync: vi.fn() }))

vi.stubGlobal('IntersectionObserver', class {
  observe() {}
  disconnect() {}
})

const getSource = vi.fn()
const toastError = vi.fn()

vi.mock('@/composables/useToast', () => ({
  useToast: () => ({ toast: { error: toastError } })
}))

vi.mock('@/api/apiInstance', async (importOriginal) => {
  const { apiInstance } = await importOriginal()
  return { apiInstance: { ...apiInstance, getSource: (...args) => getSource(...args) } }
})

describe('DocumentViewerDocx.vue', () => {
  const document = {
    index: 'foo',
    id: 'doc-id',
    routing: 'root-id',
    project: 'foo',
    path: '/leaks/medical/report.docx',
    source: { metadata: {} },
    tags: []
  }
  const blob = new Blob(['docx'])

  // `renderAsync` writes into the container the component passes it; this is the
  // only thing the component knows about the library's output.
  function renderSections(...contents) {
    renderAsync.mockImplementation(async (source, container) => {
      container.innerHTML = contents.map(html => `<section class="docx">${html}</section>`).join('')
    })
  }

  // The path banners are cached per project, so seeding the store keeps the blur
  // decision out of the network and away from the other tests' cache.
  function mountViewer(pathBanners = []) {
    const { plugins } = CoreSetup.init().useAll()
    useDocumentPathBannersStore().set({ project: 'foo', pathBanners })
    return shallowMount(DocumentViewerDocx, {
      props: { document },
      attachTo: window.document.body,
      global: { plugins, renderStubDefaultSlot: true }
    })
  }

  // The local search debounces the term before it searches it.
  async function flushLocalSearch() {
    await vi.advanceTimersByTimeAsync(300)
    await flushPromises()
  }

  async function search(wrapper, value) {
    wrapper.findComponent(DocumentToolbox).vm.$emit('update:modelValue', value)
    await flushLocalSearch()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ shouldAdvanceTime: true })
    getSource.mockResolvedValue(blob)
    renderSections('<p>hello world</p>')
    window.HTMLElement.prototype.scrollIntoView = vi.fn()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('fetches the source as a blob', async () => {
    mountViewer()
    await flushPromises()
    expect(getSource).toHaveBeenCalledWith(document, { responseType: 'blob' })
  })

  it('renders the blob into its own container', async () => {
    const wrapper = mountViewer()
    await flushPromises()
    const [source, container] = renderAsync.mock.calls[0]
    expect(source).toBe(blob)
    expect(container).toBe(wrapper.find('.document-viewer-docx__container').element)
  })

  it('asks the library not to ignore the last rendered page breaks', async () => {
    mountViewer()
    await flushPromises()
    const options = renderAsync.mock.calls[0][3]
    expect(options).toEqual({ ignoreLastRenderedPageBreak: false, inWrapper: true })
  })

  it('counts one page per rendered section', async () => {
    renderSections('<p>one</p>', '<p>two</p>', '<p>three</p>')
    const wrapper = mountViewer()
    await flushPromises()
    expect(wrapper.findComponent(DocumentToolbox).props('totalPages')).toBe(3)
  })

  it('counts one page when nothing was rendered', async () => {
    renderAsync.mockResolvedValue(undefined)
    const wrapper = mountViewer()
    await flushPromises()
    expect(wrapper.findComponent(DocumentToolbox).props('totalPages')).toBe(1)
  })

  it('marks every occurrence of the search term', async () => {
    renderSections('<p>needle and needle</p>', '<p>a needle</p>')
    const wrapper = mountViewer()
    await flushPromises()
    const matches = await wrapper.vm.findMatches('needle')
    expect(matches).toHaveLength(3)
    expect(wrapper.findAll('mark.local-search-term')).toHaveLength(3)
  })

  it('folds accents the way the content tab does', async () => {
    renderSections('<p>Crème brûlée</p>')
    const wrapper = mountViewer()
    await flushPromises()
    const matches = await wrapper.vm.findMatches('creme')
    expect(matches).toHaveLength(1)
  })

  it('reports the section an occurrence belongs to as its page', async () => {
    renderSections('<p>a needle</p>', '<p>another needle</p>')
    const wrapper = mountViewer()
    await flushPromises()
    const matches = await wrapper.vm.findMatches('needle')
    expect(matches.map(({ page }) => page)).toEqual([1, 2])
  })

  it('re-marks from the original html rather than from marked html', async () => {
    renderSections('<p>needle</p>')
    const wrapper = mountViewer()
    await flushPromises()
    await wrapper.vm.findMatches('needle')
    await wrapper.vm.findMatches('need')
    expect(wrapper.findAll('mark.local-search-term')).toHaveLength(1)
    expect(wrapper.find('.document-viewer-docx__container').html()).toContain('>need</mark>le')
  })

  it('shows the page of the active occurrence', async () => {
    renderSections('<p>a needle</p>', '<p>another needle</p>')
    const wrapper = mountViewer()
    await flushPromises()
    await search(wrapper, 'needle')
    wrapper.findComponent(DocumentToolbox).vm.$emit('update:activeIndex', 2)
    await flushPromises()
    expect(wrapper.findComponent(DocumentToolbox).props('page')).toBe(2)
  })

  it('shows the unavailable message rather than the library message when rendering fails', async () => {
    renderAsync.mockRejectedValue(new Error('Can\'t find end of central directory : is this a zip file ?'))
    const wrapper = mountViewer()
    await flushPromises()
    expect(wrapper.find('.document-viewer-docx__error').text()).toBe('Preview is not available for this document type.')
    expect(toastError).toHaveBeenCalledWith('Preview is not available for this document type.')
  })

  it('drops the sections of the previous render when a re-render fails', async () => {
    renderSections('<p>one</p>', '<p>two</p>')
    const wrapper = mountViewer()
    await flushPromises()
    expect(wrapper.vm.sections).toHaveLength(2)
    renderAsync.mockRejectedValue(new Error('corrupt'))
    await wrapper.setProps({ document: { ...document, id: 'other-id' } })
    await flushPromises()
    expect(wrapper.vm.sections).toHaveLength(0)
  })

  it('hides the occurrence count of the global search terms', async () => {
    const wrapper = mountViewer()
    await flushPromises()
    expect(wrapper.findComponent(DocumentToolbox).props('noCount')).toBe(true)
  })

  it('leaves the document visible when no path banner blurs it', async () => {
    const wrapper = mountViewer()
    await flushPromises()
    expect(wrapper.findComponent(DismissableContentWarningToggler).exists()).toBe(false)
    expect(wrapper.findComponent(DocumentToolbox).props('disabled')).toBe(false)
  })

  it('hides the document behind a content warning under a blurring path banner', async () => {
    const wrapper = mountViewer([{ path: '/leaks/medical/', blurSensitiveMedia: true, note: 'Sensitive' }])
    await flushPromises()
    const toggler = wrapper.findComponent(DismissableContentWarningToggler)
    expect(toggler.exists()).toBe(true)
    expect(toggler.props('description')).toBe('Sensitive')
    expect(wrapper.findComponent(DocumentToolbox).props('disabled')).toBe(true)
    expect(wrapper.find('.document-viewer-docx__container').attributes('style')).toContain('display: none')
  })

  it('takes the marks down when the search field is cleared', async () => {
    renderSections('<p>a needle</p>')
    const wrapper = mountViewer()
    await flushPromises()
    await search(wrapper, 'needle')
    expect(wrapper.findAll('mark.local-search-term')).toHaveLength(1)
    await search(wrapper, '')
    expect(wrapper.findAll('mark.local-search-term')).toHaveLength(0)
  })

  it('activates the first occurrence of every new term', async () => {
    renderSections('<p>alpha</p>', '<p>beta</p>')
    const wrapper = mountViewer()
    await flushPromises()
    await search(wrapper, 'alpha')
    expect(wrapper.find('mark.local-search-term--active').text()).toBe('alpha')
    await search(wrapper, 'beta')
    expect(wrapper.find('mark.local-search-term--active').text()).toBe('beta')
  })

  it('searches the term again when another document is rendered', async () => {
    renderSections('<p>a needle</p>')
    const wrapper = mountViewer()
    await flushPromises()
    await search(wrapper, 'needle')
    renderSections('<p>another needle</p>', '<p>a third needle</p>')
    await wrapper.setProps({ document: { ...document, id: 'other-id' } })
    await flushPromises()
    expect(wrapper.findComponent(DocumentToolbox).props('occurrences')).toBe(2)
    expect(wrapper.findAll('mark.local-search-term')).toHaveLength(2)
  })

  it('shows the not-found message when the source is gone', async () => {
    getSource.mockRejectedValue({ response: { status: 404 } })
    const wrapper = mountViewer()
    await flushPromises()
    expect(wrapper.find('.document-viewer-docx__error').text()).toBe('Your document was indexed in Datashare but the original is no longer in your Datashare folder on your computer. Preview is thus not available.')
  })
})

// The other tests here replace `renderAsync` with a stand-in writing the sections
// they need; these run the library itself through the same spy, so the options the
// component passes reach the real code at least once.
describe('DocumentViewerDocx.vue with the real docx-preview', () => {
  const document = {
    index: 'foo',
    id: 'doc-id',
    routing: 'root-id',
    project: 'foo',
    path: '/leaks/report.docx',
    source: { metadata: {} },
    tags: []
  }
  const fixture = resolve(__dirname, '../../../../resources/document.docx')

  // Unzipping and parsing the file takes more ticks than `flushPromises` covers.
  async function mountRendered() {
    const { plugins } = CoreSetup.init().useAll()
    useDocumentPathBannersStore().set({ project: 'foo', pathBanners: [] })
    const wrapper = shallowMount(DocumentViewerDocx, {
      props: { document },
      attachTo: window.document.body,
      global: { plugins, renderStubDefaultSlot: true }
    })
    await vi.waitUntil(() => wrapper.vm.sections.length || wrapper.vm.error)
    await flushPromises()
    return wrapper
  }

  beforeEach(async () => {
    vi.clearAllMocks()
    const { renderAsync: actual } = await vi.importActual('docx-preview')
    renderAsync.mockImplementation(actual)
    getSource.mockResolvedValue(new Blob([readFileSync(fixture)]))
    window.HTMLElement.prototype.scrollIntoView = vi.fn()
  })

  it('renders the text of a real docx file', async () => {
    const wrapper = await mountRendered()
    expect(wrapper.vm.error).toBeNull()
    expect(wrapper.find('.document-viewer-docx__container').text()).toContain('This is a Datashare test document.')
  })

  it('counts a page for the last rendered page break of a real docx file', async () => {
    const wrapper = await mountRendered()
    expect(wrapper.findComponent(DocumentToolbox).props('totalPages')).toBe(2)
  })

  it('marks a term of a real docx file on the page holding it', async () => {
    const wrapper = await mountRendered()
    const matches = await wrapper.vm.findMatches('needle')
    expect(matches).toEqual([{ page: 1 }])
    expect(wrapper.find('mark.local-search-term').text()).toBe('needle')
  })
})
