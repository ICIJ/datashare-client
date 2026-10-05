import { nextTick } from 'vue'
import { flushPromises, shallowMount } from '@vue/test-utils'
import { LanguageDescription, language } from '@codemirror/language'
import { languages } from '@codemirror/language-data'
import { Decoration, EditorView } from '@codemirror/view'

import CoreSetup from '~tests/unit/CoreSetup'
import DismissableContentWarningToggler from '@/components/Dismissable/DismissableContentWarningToggler'
import DocumentToolbox from '@/components/Document/DocumentToolbox/DocumentToolbox'
import DocumentViewerCode from '@/components/Document/DocumentViewer/DocumentViewerCode'
import { findLanguage } from '@/utils/codeLanguage'
import { buildSearchIndex } from '@/utils/codeSearchIndex'
import { useDocumentPathBannersStore } from '@/store/modules'

vi.mock('@/utils/codeLanguage', () => ({ findLanguage: vi.fn() }))

vi.mock('@/utils/codeSearchIndex', async (importOriginal) => {
  const codeSearchIndex = await importOriginal()
  return { ...codeSearchIndex, buildSearchIndex: vi.fn(codeSearchIndex.buildSearchIndex) }
})

// CodeMirror measures the text it renders, and jsdom has no layout to measure.
Range.prototype.getClientRects = () => []
Range.prototype.getBoundingClientRect = () => ({ top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 })

const getSource = vi.fn()

function encode(text) {
  return new TextEncoder().encode(text).buffer
}

vi.mock('@/api/apiInstance', async (importOriginal) => {
  const { apiInstance } = await importOriginal()
  return { apiInstance: { ...apiInstance, getSource: (...args) => getSource(...args) } }
})

describe('DocumentViewerCode.vue', () => {
  const MB = 1024 * 1024
  const document = {
    index: 'foo',
    id: 'doc-id',
    routing: 'root-id',
    project: 'foo',
    path: '/leaks/code/Program.cs',
    basename: 'Program.cs',
    contentType: 'text/x-csharp',
    contentLength: 1024,
    source: { metadata: {} },
    tags: []
  }

  // The path banners are cached per project, so seeding the store keeps the blur
  // decision out of the network and away from the other tests' cache.
  function mountViewer({ pathBanners = [], ...overrides } = {}) {
    const { plugins } = CoreSetup.init().useAll()
    useDocumentPathBannersStore().set({ project: 'foo', pathBanners })
    return shallowMount(DocumentViewerCode, {
      props: { document: { ...document, ...overrides } },
      attachTo: window.document.body,
      global: { plugins, renderStubDefaultSlot: true }
    })
  }

  function editorView(wrapper) {
    return EditorView.findFromDOM(wrapper.find('.cm-editor').element)
  }

  function editorText(wrapper) {
    return editorView(wrapper).state.doc.toString()
  }

  // The local search debounces the term before it searches it.
  async function search(wrapper, value) {
    wrapper.findComponent(DocumentToolbox).vm.$emit('update:modelValue', value)
    await vi.advanceTimersByTimeAsync(300)
    await flushPromises()
  }

  async function mountWithSource(source, overrides) {
    getSource.mockResolvedValue(encode(source))
    const wrapper = mountViewer(overrides)
    await flushPromises()
    return wrapper
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ shouldAdvanceTime: true })
    getSource.mockResolvedValue(encode('hello world'))
    findLanguage.mockResolvedValue(null)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('fetches the source as bytes', async () => {
    mountViewer()
    await flushPromises()
    expect(getSource).toHaveBeenCalledWith(expect.objectContaining({ id: 'doc-id' }), expect.objectContaining({ responseType: 'arraybuffer' }))
  })

  it('decodes the source with the encoding detected at indexing', async () => {
    getSource.mockResolvedValue(new Uint8Array([0x63, 0x61, 0x66, 0xe9]).buffer)
    const wrapper = mountViewer({ source: { metadata: {}, contentEncoding: 'windows-1252' } })
    await flushPromises()
    expect(editorText(wrapper)).toBe('caf\u00e9')
  })

  it('decodes the source as UTF-8 when its encoding is unknown to the browser', async () => {
    getSource.mockResolvedValue(encode('caf\u00e9'))
    const wrapper = mountViewer({ source: { metadata: {}, contentEncoding: 'x-unknown' } })
    await flushPromises()
    expect(editorText(wrapper)).toBe('caf\u00e9')
  })

  it('shows the fetched source', async () => {
    const wrapper = mountViewer()
    await flushPromises()
    expect(editorText(wrapper)).toBe('hello world')
  })

  it.each([
    ['a\nb\n', 'a\nb'],
    ['a\r\nb\r\n', 'a\nb'],
    ['a\n\n', 'a\n'],
    ['a\nb', 'a\nb'],
    ['a\rb\r', 'a\nb']
  ])('drops one trailing line break of %j', async (source, shown) => {
    getSource.mockResolvedValue(encode(source))
    const wrapper = mountViewer()
    await flushPromises()
    expect(editorText(wrapper)).toBe(shown)
  })

  it('shows the source read-only', async () => {
    const wrapper = mountViewer()
    await flushPromises()
    const view = editorView(wrapper)
    expect(view.state.readOnly).toBe(true)
    expect(view.contentDOM.getAttribute('contenteditable')).toBe('false')
  })

  it('highlights the source with the language found for the document', async () => {
    findLanguage.mockResolvedValue(await LanguageDescription.matchLanguageName(languages, 'JSON').load())
    const wrapper = mountViewer()
    await flushPromises()
    expect(findLanguage).toHaveBeenCalledWith(expect.objectContaining({ id: 'doc-id' }))
    expect(editorView(wrapper).state.facet(language).name).toBe('json')
  })

  it('shows the source before its language pack is loaded', async () => {
    findLanguage.mockReturnValue(new Promise(() => {}))
    const wrapper = mountViewer()
    await flushPromises()
    expect(wrapper.find('.document-viewer-code__loading').exists()).toBe(false)
    expect(editorText(wrapper)).toBe('hello world')
  })

  it('does not fetch a document above 50 MB', async () => {
    const wrapper = mountViewer({ contentLength: 50 * MB + 1 })
    await flushPromises()
    expect(getSource).not.toHaveBeenCalled()
    expect(wrapper.find('.document-viewer-code__too-large').text()).toBe('This document is too large to preview.')
  })

  it('fetches a document of exactly 50 MB', async () => {
    mountViewer({ contentLength: 50 * MB })
    await flushPromises()
    expect(getSource).toHaveBeenCalled()
  })

  it('stops downloading a document of unknown length past 50 MB', async () => {
    getSource.mockImplementation((document, { signal, onDownloadProgress }) => {
      onDownloadProgress({ loaded: 50 * MB + 1 })
      return Promise.reject(new Error(signal.aborted ? 'canceled' : 'unexpected'))
    })
    const wrapper = mountViewer({ contentLength: -1 })
    await flushPromises()
    expect(wrapper.find('.document-viewer-code__too-large').text()).toBe('This document is too large to preview.')
  })

  it('fetches a document of unknown length', async () => {
    const wrapper = mountViewer({ contentLength: undefined })
    await flushPromises()
    expect(editorText(wrapper)).toBe('hello world')
  })

  it('shows the not-found message when the source is gone', async () => {
    getSource.mockRejectedValue({ response: { status: 404 } })
    const wrapper = mountViewer()
    await flushPromises()
    expect(wrapper.find('.document-viewer-code__error').text()).toBe('Your document was indexed in Datashare but the original is no longer in your Datashare folder on your computer. Preview is thus not available.')
  })

  it('replaces the text in the same editor when the document changes', async () => {
    const wrapper = mountViewer()
    await flushPromises()
    getSource.mockResolvedValue(encode('second'))
    await wrapper.setProps({ document: { ...document, id: 'other-id' } })
    await flushPromises()
    expect(wrapper.findAll('.cm-editor')).toHaveLength(1)
    expect(editorText(wrapper)).toBe('second')
  })

  it('does not let a superseded load write over the document on screen', async () => {
    let resolveFirst
    getSource.mockReturnValueOnce(new Promise((resolve) => {
      resolveFirst = resolve
    }))
    getSource.mockResolvedValue(encode('second'))
    const wrapper = mountViewer()
    await flushPromises()
    await wrapper.setProps({ document: { ...document, id: 'other-id' } })
    await flushPromises()
    resolveFirst(encode('first'))
    await flushPromises()
    expect(editorText(wrapper)).toBe('second')
  })

  it('does not let a superseded failure blank the document on screen', async () => {
    let rejectFirst
    getSource.mockReturnValueOnce(new Promise((resolve, reject) => {
      rejectFirst = reject
    }))
    getSource.mockResolvedValue(encode('second'))
    const wrapper = mountViewer()
    await flushPromises()
    await wrapper.setProps({ document: { ...document, id: 'other-id' } })
    await flushPromises()
    rejectFirst({ response: { status: 404 } })
    await flushPromises()
    expect(wrapper.find('.document-viewer-code__error').exists()).toBe(false)
    expect(editorText(wrapper)).toBe('second')
  })

  it('destroys the editor on unmount', async () => {
    const wrapper = mountViewer()
    await flushPromises()
    const destroy = vi.spyOn(editorView(wrapper), 'destroy')
    wrapper.unmount()
    expect(destroy).toHaveBeenCalled()
  })

  it('stops loading the source when unmounted before it arrives', async () => {
    let resolveSource
    getSource.mockReturnValue(new Promise((resolve) => {
      resolveSource = resolve
    }))
    const wrapper = mountViewer()
    await flushPromises()
    const [, { signal }] = getSource.mock.calls[0]
    const addEventListener = vi.spyOn(window.document, 'addEventListener')
    wrapper.unmount()
    resolveSource(encode('late'))
    await flushPromises()
    expect(signal.aborted).toBe(true)
    expect(addEventListener).not.toHaveBeenCalledWith('selectionchange', expect.anything())
  })

  it('finds matches across lines, ignoring case and accents', async () => {
    const wrapper = await mountWithSource('Cr\u00e8me\nfoo CREME cr\u00e8me')
    expect(wrapper.vm.findMatches('creme')).toEqual([
      { page: 1, from: 0, to: 5 },
      { page: 1, from: 10, to: 15 },
      { page: 1, from: 16, to: 21 }
    ])
  })

  it('counts a Windows line break as one position', async () => {
    const wrapper = await mountWithSource('a\r\nneedle')
    expect(wrapper.vm.findMatches('needle')).toEqual([{ page: 1, from: 2, to: 8 }])
  })

  it('finds nothing for a term that folds to nothing', async () => {
    const wrapper = await mountWithSource('cre\u0301me')
    expect(wrapper.vm.findMatches('\u0301')).toEqual([])
  })

  it('marks every occurrence in the editor', async () => {
    const wrapper = await mountWithSource('needle one\nneedle two')
    await search(wrapper, 'needle')
    expect(wrapper.findComponent(DocumentToolbox).props('occurrences')).toBe(2)
    expect(wrapper.findAll('.local-search-term')).toHaveLength(2)
  })

  it('marks the active occurrence', async () => {
    const wrapper = await mountWithSource('needle one\nneedle two')
    await search(wrapper, 'needle')
    wrapper.findComponent(DocumentToolbox).vm.$emit('update:activeIndex', 2)
    await nextTick()
    const lines = wrapper.findAll('.cm-line')
    expect(lines[0].find('.local-search-term--active').exists()).toBe(false)
    expect(lines[1].find('.local-search-term--active').exists()).toBe(true)
  })

  it('only repaints the active mark when moving to another occurrence', async () => {
    const wrapper = await mountWithSource('needle one\nneedle two\nneedle three')
    await search(wrapper, 'needle')
    const set = vi.spyOn(Decoration, 'set')
    wrapper.findComponent(DocumentToolbox).vm.$emit('update:activeIndex', 2)
    await nextTick()
    expect(set.mock.calls.every(([ranges]) => ranges.length <= 1)).toBe(true)
    expect(wrapper.findAll('.local-search-term')).toHaveLength(3)
    expect(wrapper.findAll('.cm-line')[1].find('.local-search-term .local-search-term--active').exists()).toBe(true)
  })

  it('takes the marks down when the search field is cleared', async () => {
    const wrapper = await mountWithSource('a needle')
    await search(wrapper, 'needle')
    expect(wrapper.findAll('.local-search-term')).toHaveLength(1)
    await search(wrapper, '')
    expect(wrapper.findAll('.local-search-term')).toHaveLength(0)
  })

  it('searches the term again when another document is shown', async () => {
    const wrapper = await mountWithSource('a needle')
    await search(wrapper, 'needle')
    getSource.mockResolvedValue(encode('needle and needle'))
    await wrapper.setProps({ document: { ...document, id: 'other-id' } })
    await flushPromises()
    expect(wrapper.findComponent(DocumentToolbox).props('occurrences')).toBe(2)
    expect(wrapper.findAll('.local-search-term')).toHaveLength(2)
  })

  it('drops the matches when the next document is too large', async () => {
    const wrapper = await mountWithSource('a needle')
    await search(wrapper, 'needle')
    await wrapper.setProps({ document: { ...document, id: 'other-id', contentLength: 50 * MB + 1 } })
    await flushPromises()
    expect(wrapper.findComponent(DocumentToolbox).props('occurrences')).toBe(0)
    expect(wrapper.vm.findMatches('needle')).toEqual([])
  })

  it('drops the matches when the next document fails to load', async () => {
    const wrapper = await mountWithSource('a needle')
    await search(wrapper, 'needle')
    getSource.mockRejectedValue({ response: { status: 404 } })
    await wrapper.setProps({ document: { ...document, id: 'other-id' } })
    await flushPromises()
    expect(wrapper.findComponent(DocumentToolbox).props('occurrences')).toBe(0)
  })

  it('leaves the document visible when no path banner blurs it', async () => {
    const wrapper = await mountWithSource('hello')
    expect(wrapper.findComponent(DismissableContentWarningToggler).exists()).toBe(false)
    expect(wrapper.findComponent(DocumentToolbox).props('disabled')).toBe(false)
  })

  it('hides the document behind a content warning under a blurring path banner', async () => {
    const pathBanners = [{ path: '/leaks/code/', blurSensitiveMedia: true, note: 'Sensitive' }]
    const wrapper = await mountWithSource('hello', { pathBanners })
    const toggler = wrapper.findComponent(DismissableContentWarningToggler)
    expect(toggler.props('description')).toBe('Sensitive')
    expect(wrapper.findComponent(DocumentToolbox).props('disabled')).toBe(true)
    expect(wrapper.find('.document-viewer-code__editor').attributes('style')).toContain('display: none')
  })

  it('does not let a superseded blur decision hide the document on screen', async () => {
    const { plugins } = CoreSetup.init().useAll()
    const store = useDocumentPathBannersStore()
    let resolveFirst
    const firstBanners = new Promise((resolve) => {
      resolveFirst = resolve
    })
    const blurring = [{ path: '/leaks/code/', blurSensitiveMedia: true, note: 'Sensitive' }]
    const fetchPathBannersByPath = vi.spyOn(store, 'fetchPathBannersByPath')
      .mockReturnValueOnce(firstBanners)
      .mockResolvedValue([])
    const wrapper = shallowMount(DocumentViewerCode, {
      props: { document },
      attachTo: window.document.body,
      global: { plugins, renderStubDefaultSlot: true }
    })
    await wrapper.setProps({ document: { ...document, id: 'other-id' } })
    await flushPromises()
    resolveFirst(blurring)
    await flushPromises()
    fetchPathBannersByPath.mockRestore()
    expect(wrapper.findComponent(DismissableContentWarningToggler).exists()).toBe(false)
    expect(wrapper.findComponent(DocumentToolbox).props('disabled')).toBe(false)
  })

  it('does not search a blurred document', async () => {
    const pathBanners = [{ path: '/leaks/code/', blurSensitiveMedia: true, note: 'Sensitive' }]
    const wrapper = await mountWithSource('hello', { pathBanners })
    await search(wrapper, 'hello')
    expect(wrapper.findComponent(DocumentToolbox).props('occurrences')).toBe(0)
  })

  it('searches the document once its content warning is dismissed', async () => {
    const pathBanners = [{ path: '/leaks/code/', blurSensitiveMedia: true, note: 'Sensitive' }]
    const wrapper = await mountWithSource('hello', { pathBanners })
    await search(wrapper, 'hello')
    wrapper.findComponent(DismissableContentWarningToggler).vm.$emit('update:modelValue', false)
    await flushPromises()
    expect(wrapper.findComponent(DocumentToolbox).props('occurrences')).toBe(1)
  })

  it('does not count the query terms in the extracted text', async () => {
    const wrapper = await mountWithSource('hello')
    expect(wrapper.findComponent(DocumentToolbox).props('noCount')).toBe(true)
  })

  it('does not index the source until a term is searched', async () => {
    const wrapper = await mountWithSource('a needle')
    expect(buildSearchIndex).not.toHaveBeenCalled()
    await search(wrapper, 'needle')
    expect(buildSearchIndex).toHaveBeenCalledTimes(1)
  })

  it('indexes the source once for every term searched in it', async () => {
    const wrapper = await mountWithSource('a needle')
    await search(wrapper, 'needle')
    await search(wrapper, 'nee')
    expect(buildSearchIndex).toHaveBeenCalledTimes(1)
  })
})
