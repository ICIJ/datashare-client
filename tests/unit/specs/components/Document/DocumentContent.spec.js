import { config, enableAutoUnmount, mount, shallowMount, flushPromises } from '@vue/test-utils'
import { PaginationTiny } from '@icij/murmur'

import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import { IndexedDocument, letData } from '~tests/unit/es_utils'
import { letTextContent } from '~tests/unit/api_mock'
import CoreSetup from '~tests/unit/CoreSetup'
import DocumentContent from '@/components/Document/DocumentContent'
import DocumentContentDropdown from '@/components/Document/DocumentContentDropdown'
import DocumentLocalSearch from '@/components/Document/DocumentLocalSearch/DocumentLocalSearch'
import Hook from '@/components/Hook/Hook'
import { apiInstance as api } from '@/api/apiInstance'
import { useDocumentStore } from '@/store/modules'

vi.mock('@/api/apiInstance', async (importOriginal) => {
  const { apiInstance } = await importOriginal()

  return {
    apiInstance: {
      ...apiInstance,
      getDocumentSlice: vi.fn(),
      getPages: vi.fn().mockResolvedValue([]),
      searchDocument: vi.fn(),
      getStructureManifest: vi.fn().mockResolvedValue(null),
      getStructurePage: vi.fn().mockResolvedValue(''),
      searchStructurePages: vi.fn().mockResolvedValue({ count: 0, pages: 0, scanned: 0, hits: [] }),
      // Only consulted by `sameTikaVersion` when a document is a PDF; the
      // resolved version must match the `PDF_ARTIFACT_TIKA_VERSION` metadata
      // set by `withPdfArtifactMetadata` below for `mustSyncPages` to pass.
      getVersion: vi.fn().mockResolvedValue({ ds: { extractorVersion: '1.2.3' } })
    }
  }
})

window.HTMLElement.prototype.scrollIntoView = vi.fn()

// A wrapper left mounted keeps re-rendering in later tests, where Vue Test
// Utils no longer stubs its children: a shallow-mounted document then fires a
// real attachments query for a document that only existed in its own test.
enableAutoUnmount(afterEach)

// The view dropdown is passed to the toolbox as a slot, so a shallow mount has
// to render the toolbox for real to reach it.
config.global.stubs = { ...config.global.stubs, DocumentToolbox: false }

// The local search debounces the term before it searches it.
async function flushLocalSearch() {
  await vi.advanceTimersByTimeAsync(300)
  await flushPromises()
}

// A promise whose resolution is controlled from the outside, so a test can
// resolve two competing requests in a deterministic, arbitrary order instead
// of relying on timers.
function createDeferredPromise() {
  const deferred = {}
  deferred.promise = new Promise((resolve) => {
    deferred.resolve = resolve
  })
  return deferred
}

describe('DocumentContent.vue', () => {
  let core, documentStore
  const { index, es } = esConnectionHelper.build()
  const id = 'document'

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ shouldAdvanceTime: true })
    core = CoreSetup.init().useAll()
    documentStore = useDocumentStore()
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  async function mockDocumentContentSlice(content = '', { language = 'ENGLISH', configureDocument = document => document } = {}) {
    const contentSlice = letTextContent().withContent(content).getResponse()
    // Index the document
    const indexedDocument = configureDocument(new IndexedDocument(id, index).withContent(content).withLanguage(language))
    await letData(es).have(indexedDocument).commit()
    // Mock the `getDocumentSlice` method
    api.getDocumentSlice.mockImplementation(async (project, documentId, offset, limit) => {
      // Modify the returned content according to passed parameters
      const content = contentSlice.content.substring(offset, offset + limit)
      return { ...contentSlice, content, offset, limit }
    })
    // Get the document from the store
    await documentStore.getDocument({ id, index })
    const document = documentStore.document
    // Finally flush all promises and return all necessary values
    await flushPromises()
    return { content, contentSlice, document }
  }

  afterEach(async () => {
    // Ensure all promise are flushed...
    await flushPromises()
    vi.useRealTimers()
    // Remove document
    documentStore.reset()
  })

  describe('the extracted text content', () => {
    it('should sanitize the HTML in the extracted text', async () => {
      const content
        = 'this is a <span>content</span> with some <img src="this.is.a.source" alt="alt" title="title" />images and <a href="this.is.an.href" target="_blank">links</a>'
      const { document } = await mockDocumentContentSlice(content)
      const { plugins } = core
      const props = { document }
      const wrapper = shallowMount(DocumentContent, { props, global: { plugins } })
      await flushPromises()
      await wrapper.vm.loadContentSlice()
      await wrapper.vm.cookAllContentSlices()
      expect(wrapper.vm.getContentSlice().cookedContent).toEqual('<p>this is a content with some images and links</p>')
    })

    it('should not sanitize the <mark /> tags in the extracted text', async () => {
      const content = 'this is a <mark>document</mark>'
      const { document } = await mockDocumentContentSlice(content)
      const props = { document }
      const { plugins } = core
      const wrapper = shallowMount(DocumentContent, { props, global: { plugins } })
      await flushPromises()
      await wrapper.vm.loadContentSlice()
      await wrapper.vm.cookAllContentSlices()
      expect(wrapper.vm.getContentSlice().cookedContent).toEqual('<p>this is a <mark>document</mark></p>')
    })

    it('should display the text right to left for arabic', async () => {
      const content
        = 'المنال ويتلذذ بالآلام، الألم هو الألم ولكن نتيجة لظروف ما قد تكمن السعاده فيما نتحمله من كد وأسي.'
      const { document } = await mockDocumentContentSlice(content, {
        language: 'ARABIC'
      })
      const props = { document }
      const { plugins } = core
      const wrapper = shallowMount(DocumentContent, { props, global: { plugins } })
      await flushPromises()
      await wrapper.vm.loadContentSlice()
      expect(wrapper.find('.document-content--rtl').exists()).toBeTruthy()
    })

    it('should NOT display the text right to left for english', async () => {
      const { document } = await mockDocumentContentSlice('foo')
      const { plugins } = core
      const props = { document }
      const wrapper = shallowMount(DocumentContent, { props, global: { plugins } })
      await flushPromises()
      await wrapper.vm.loadContentSlice()
      expect(wrapper.find('.document-content--rtl').exists()).toBeFalsy()
    })

    it('should display "No content extracted for this document" when the extracted text is empty', async () => {
      const { document } = await mockDocumentContentSlice('')
      const { plugins } = core
      const props = { document }
      const wrapper = shallowMount(DocumentContent, { props, global: { plugins, renderStubDefaultSlot: true } })
      await flushPromises()
      await wrapper.vm.loadContentSlice()
      const element = wrapper.find('.document-content__body--no-content')
      expect(element.exists()).toBeTruthy()
      expect(element.text()).toBe('No content extracted for this document')
    })
  })

  describe('search term', () => {
    describe('with 1 occurrence', () => {
      beforeEach(() => {
        api.searchDocument.mockImplementation(() => {
          return Promise.resolve({ count: 1, offsets: [10] })
        })
      })

      it('should not sticky the toolbox by default', async () => {
        const { document } = await mockDocumentContentSlice('')
        const { plugins } = core
        const props = { document }
        const wrapper = shallowMount(DocumentContent, { props, global: { plugins } })
        await flushPromises()
        expect(wrapper.find('.document-content__toolbox--sticky').exists()).toBeFalsy()
      })
    })

    describe('with 2 occurrences', () => {
      let wrapper
      let mockDocument
      beforeEach(async () => {
        api.searchDocument.mockImplementation(async () => ({ count: 2, offsets: [10, 15] }))
        mockDocument = await mockDocumentContentSlice('this is a full full content')
        const { plugins } = core
        const props = { document: mockDocument.document, q: 'full' }
        wrapper = mount(DocumentContent, { props, global: { plugins } })
        await flushLocalSearch()
        await wrapper.vm.loadContentSlice()
      })

      it('should highlight the first occurrence of the searched term', async () => {
        const { innerHTML } = wrapper.find('.document-content__body').element
        expect(wrapper.vm.localSearchIndex).toEqual(1)
        expect(innerHTML).toEqual(
          '<p>this is a <mark class="local-search-term local-search-term--active" data-offset="10">full</mark> <mark class="local-search-term" data-offset="15">full</mark> content</p>'
        )
      })

      it('should clean marks when updating search term', async () => {
        api.searchDocument.mockResolvedValue({ count: 1, offsets: [5] })
        const { innerHTML: firstSearch } = wrapper.find('.document-content__body').element
        expect(wrapper.vm.localSearchIndex).toEqual(1)
        expect(firstSearch).toEqual(
          '<p>this is a <mark class="local-search-term local-search-term--active" data-offset="10">full</mark> <mark class="local-search-term" data-offset="15">full</mark> content</p>'
        )

        await wrapper.setProps({ q: 'is' })
        await wrapper.vm.activateContentSliceAround()
        await flushLocalSearch()
        const { innerHTML: secondSearch } = wrapper.find('.document-content__body').element
        expect(wrapper.vm.localSearchIndex).toEqual(1)
        expect(secondSearch).toEqual(
          '<p>this <mark class="local-search-term local-search-term--active" data-offset="5">is</mark> a full full content</p>'
        )
      })

      it('should find the previous and next occurrence, as a loop', async () => {
        const { element } = wrapper.find('.document-content__body')

        expect(wrapper.vm.localSearchIndex).toEqual(1)
        expect(element.innerHTML).toEqual(
          '<p>this is a <mark class="local-search-term local-search-term--active" data-offset="10">full</mark> <mark class="local-search-term" data-offset="15">full</mark> content</p>'
        )

        wrapper.vm.localSearchIndex = 2
        await flushPromises()

        expect(element.innerHTML).toEqual(
          '<p>this is a <mark class="local-search-term" data-offset="10">full</mark> <mark class="local-search-term local-search-term--active" data-offset="15">full</mark> content</p>'
        )
      })
    })

    it('activates a content slice when the search resolves before the document is loaded', async () => {
      api.getStructureManifest.mockResolvedValue(null)
      api.searchDocument.mockResolvedValue({ count: 1, offsets: [0] })
      const { document, contentSlice } = await mockDocumentContentSlice('this is a full content')
      // The mount-time `maxOffset` probe is held open past the debounce, so the
      // matches land while the document is still loading.
      const maxOffsetProbe = createDeferredPromise()
      api.getDocumentSlice.mockImplementationOnce(() => maxOffsetProbe.promise)
      const { plugins } = core
      const wrapper = shallowMount(DocumentContent, { props: { document, q: 'full' }, global: { plugins } })
      await flushLocalSearch()
      maxOffsetProbe.resolve({ ...contentSlice, content: '', offset: 0, limit: 0 })
      await flushPromises()
      expect(wrapper.vm.currentContentPage).toContain('full content')
    })

    describe('with 3 occurrences', () => {
      let wrapper

      beforeEach(async () => {
        api.searchDocument.mockImplementation(async () => ({ count: 3, offsets: [10, 15, 28] }))
        const content = 'this is a full FulL content fuLL'
        const { document } = await mockDocumentContentSlice(content)
        const { plugins } = core
        const props = { document, q: 'full' }
        wrapper = mount(DocumentContent, { global: { plugins }, props })
        await flushLocalSearch()
        await wrapper.vm.loadContentSlice()
      })

      it('should be case insensitive', async () => {
        // Use vm.$set method to set nested value reactively
        await flushPromises()
        expect(wrapper.vm.localSearchOccurrences).toEqual(3)
      })
    })
  })

  describe('document content lazy loading', () => {
    it('should lazy load the entire document', async () => {
      // Create a document with a small content text length
      const content = 'this is a content'
      const { document } = await mockDocumentContentSlice(content)
      const { plugins } = core
      const props = { document }
      const wrapper = mount(DocumentContent, { global: { plugins }, props })
      await flushPromises()
      await wrapper.vm.loadContentSlice()
      expect(wrapper.vm.getContentSlice().content).toBe('this is a content')
    })

    it('should not carry the previous document page and slices over to the next one', async () => {
      const { document } = await mockDocumentContentSlice('a'.repeat(60))
      // Both documents are served by the same mock, keyed by id, so the
      // assertions below can tell whose slice ended up on screen.
      api.getDocumentSlice.mockImplementation(async (project, documentId, offset, limit) => {
        const content = (documentId === id ? 'a' : 'b').repeat(60)
        return { content: content.substring(offset, offset + limit), offset, limit, maxOffset: 60 }
      })
      const { plugins } = core
      const props = { document, pageSize: 10 }
      const wrapper = shallowMount(DocumentContent, { global: { plugins }, props })
      await flushPromises()
      wrapper.vm.page = 3
      await flushPromises()
      expect(wrapper.vm.activeContentSliceOffset).toBe(20)
      const other = { index: document.index, id: 'other-document-id', routing: 'other-document-id' }
      await wrapper.setProps({ document: other })
      await flushPromises()
      expect(wrapper.vm.page).toBe(1)
      expect(wrapper.vm.activeContentSliceOffset).toBe(0)
      expect(wrapper.vm.currentContentPage).toContain('bbbbbbbbbb')
      expect(wrapper.vm.currentContentPage).not.toContain('a')
      wrapper.unmount()
    })

    it('should lazy load 2 slices of 10 characters of a long text document', async () => {
      // Create a document with a small content text length
      const content = 'this is a content from Elastic Search doc which looks huge'
      const { document } = await mockDocumentContentSlice(content)
      const { plugins } = core
      const pageSize = 10
      const props = { document, pageSize }
      const wrapper = mount(DocumentContent, { global: { plugins }, props })
      await flushPromises()
      // Load the first slice
      await wrapper.vm.loadContentSlice({ offset: 0 })
      expect(wrapper.vm.getContentSlice({ offset: 0 }).content).toBe('this is a ')
      // Continue to load content
      await wrapper.vm.loadContentSlice({ offset: 10 })
      expect(wrapper.vm.getContentSlice({ offset: 10 }).content).toBe('content fr')
    })
  })

  describe('markdown mode', () => {
    beforeEach(() => {
      api.getStructureManifest.mockResolvedValue({ pages: 3, formats: ['md'] })
      api.getStructurePage.mockResolvedValue('# Hello world')
    })

    it('renders the markdown body by default when the document has markdown', async () => {
      const { document } = await mockDocumentContentSlice('Hello world')
      const { plugins } = core
      const wrapper = shallowMount(DocumentContent, { props: { document }, global: { plugins } })
      await flushPromises()
      expect(wrapper.findComponent({ name: 'DocumentContentMarkdown' }).exists()).toBe(true)
      expect(wrapper.find('div.document-content__body').exists()).toBe(false)
    })

    it('counts the occurrences it can navigate to, not the ones the backend reports', async () => {
      // `count` can exceed `hits` when the backend scans only part of the artifact:
      // counting the rest would leave next/previous with nowhere to go.
      api.searchStructurePages.mockResolvedValue({ count: 120, pages: 3, scanned: 1, hits: [{ page: 1, count: 2 }] })
      const { document } = await mockDocumentContentSlice('Hello world')
      const { plugins } = core
      const wrapper = shallowMount(DocumentContent, { props: { document, q: 'hello' }, global: { plugins } })
      await flushLocalSearch()
      expect(wrapper.findComponent(DocumentLocalSearch).props('occurrences')).toBe(2)
    })

    it('walks the occurrences in page order whatever order the response uses', async () => {
      const hits = [{ page: 3, count: 1 }, { page: 1, count: 1 }]
      api.searchStructurePages.mockResolvedValue({ count: 2, pages: 3, scanned: 3, hits })
      const { document } = await mockDocumentContentSlice('Hello world')
      const { plugins } = core
      const wrapper = shallowMount(DocumentContent, { props: { document, q: 'hello' }, global: { plugins } })
      await flushLocalSearch()
      expect(wrapper.vm.markdownPage).toBe(1)
      wrapper.vm.localSearchIndex = 2
      await flushPromises()
      expect(wrapper.vm.markdownPage).toBe(3)
    })

    it('renders the plain text body when the document has no markdown', async () => {
      api.getStructureManifest.mockResolvedValue(null)
      const { document } = await mockDocumentContentSlice('Hello world')
      const { plugins } = core
      const wrapper = shallowMount(DocumentContent, { props: { document }, global: { plugins } })
      await flushPromises()
      expect(wrapper.findComponent({ name: 'DocumentContentMarkdown' }).exists()).toBe(false)
      expect(wrapper.find('div.document-content__body').exists()).toBe(true)
    })

    it('shows the view dropdown only when the document has markdown', async () => {
      const { document } = await mockDocumentContentSlice('Hello world')
      const { plugins } = core
      const wrapper = shallowMount(DocumentContent, { props: { document }, global: { plugins } })
      await flushPromises()
      expect(wrapper.findComponent(DocumentContentDropdown).exists()).toBe(true)
    })

    it('hides the view dropdown when the document has no markdown', async () => {
      api.getStructureManifest.mockResolvedValue(null)
      const { document } = await mockDocumentContentSlice('Hello world')
      const { plugins } = core
      const wrapper = shallowMount(DocumentContent, { props: { document }, global: { plugins } })
      await flushPromises()
      expect(wrapper.findComponent(DocumentContentDropdown).exists()).toBe(false)
    })

    it('re-probes the manifest and drops the markdown state when the document changes', async () => {
      const { document } = await mockDocumentContentSlice('Hello world')
      const { plugins } = core
      const wrapper = shallowMount(DocumentContent, { props: { document }, global: { plugins } })
      await flushPromises()
      wrapper.vm.preferMarkdown = false
      wrapper.vm.markdownPage = 3
      await flushPromises()
      const other = { index: document.index, id: 'other-document-id', routing: 'other-document-id' }
      await wrapper.setProps({ document: other })
      await flushPromises()
      expect(api.getStructureManifest).toHaveBeenLastCalledWith(other.index, other.id, other.routing)
      expect(wrapper.vm.markdownPage).toBe(1)
      expect(wrapper.findComponent({ name: 'DocumentContentMarkdown' }).exists()).toBe(true)
    })

    it('renders the plain text body once the toggle is set to text', async () => {
      const { document } = await mockDocumentContentSlice('Hello world')
      const { plugins } = core
      const wrapper = shallowMount(DocumentContent, { props: { document }, global: { plugins } })
      await flushPromises()
      wrapper.vm.preferMarkdown = false
      await flushPromises()
      expect(wrapper.findComponent({ name: 'DocumentContentMarkdown' }).exists()).toBe(false)
      expect(wrapper.find('div.document-content__body').exists()).toBe(true)
    })

    it('forces the plain text body when a translation is selected', async () => {
      const { document } = await mockDocumentContentSlice('Hello world')
      const { plugins } = core
      const props = { document, targetLanguage: 'ENGLISH' }
      const wrapper = shallowMount(DocumentContent, { props, global: { plugins } })
      await flushPromises()
      expect(wrapper.findComponent({ name: 'DocumentContentMarkdown' }).exists()).toBe(false)
      // The dropdown must stay visible (so the user understands why they are
      // stuck in plain text) and say why, while a translation is selected.
      const dropdown = wrapper.findComponent(DocumentContentDropdown)
      expect(dropdown.exists()).toBe(true)
      expect(dropdown.props('translation')).toBe(true)
    })

    it('falls back to plain text and disables the formatted option when the only page is empty', async () => {
      api.getStructureManifest.mockResolvedValue({ pages: 1, formats: ['md'] })
      const { document } = await mockDocumentContentSlice('Hello world')
      const { plugins } = core
      const wrapper = shallowMount(DocumentContent, { props: { document }, global: { plugins } })
      await flushPromises()
      wrapper.findComponent({ name: 'DocumentContentMarkdown' }).vm.$emit('empty')
      await flushPromises()
      expect(wrapper.findComponent({ name: 'DocumentContentMarkdown' }).exists()).toBe(false)
      expect(wrapper.find('div.document-content__body').exists()).toBe(true)
      // The dropdown stays visible, only the formatted entry is out of reach.
      const dropdown = wrapper.findComponent(DocumentContentDropdown)
      expect(dropdown.exists()).toBe(true)
      expect(dropdown.props('markdownDisabled')).toBe(true)
    })

    it('keeps the formatted view when a single page of a multi-page artifact is empty', async () => {
      // A blank cover page in a scanned PDF says nothing about the other pages.
      const { document } = await mockDocumentContentSlice('Hello world')
      const { plugins } = core
      const wrapper = shallowMount(DocumentContent, { props: { document }, global: { plugins } })
      await flushPromises()
      wrapper.findComponent({ name: 'DocumentContentMarkdown' }).vm.$emit('empty')
      await flushPromises()
      expect(wrapper.findComponent({ name: 'DocumentContentMarkdown' }).exists()).toBe(true)
      expect(wrapper.findComponent(DocumentContentDropdown).props('markdownDisabled')).toBe(false)
    })

    it('keeps the formatted option available when the user falls back from a page error', async () => {
      const { document } = await mockDocumentContentSlice('Hello world')
      const { plugins } = core
      const wrapper = shallowMount(DocumentContent, { props: { document }, global: { plugins } })
      await flushPromises()
      wrapper.findComponent({ name: 'DocumentContentMarkdown' }).vm.$emit('fallback')
      await flushPromises()
      expect(wrapper.findComponent({ name: 'DocumentContentMarkdown' }).exists()).toBe(false)
      expect(wrapper.findComponent(DocumentContentDropdown).props('markdownDisabled')).toBe(false)
    })

    it('falls back to plain text on an oversized page, keeping the formatted option available', async () => {
      const { document } = await mockDocumentContentSlice('Hello world')
      const { plugins } = core
      const wrapper = shallowMount(DocumentContent, { props: { document }, global: { plugins } })
      await flushPromises()
      wrapper.findComponent({ name: 'DocumentContentMarkdown' }).vm.$emit('oversized')
      await flushPromises()
      expect(wrapper.findComponent({ name: 'DocumentContentMarkdown' }).exists()).toBe(false)
      expect(wrapper.find('div.document-content__body').exists()).toBe(true)
      expect(wrapper.findComponent(DocumentContentDropdown).props('markdownDisabled')).toBe(false)
      expect(wrapper.findComponent(DocumentContentDropdown).props('markdownSlow')).toBe(true)
    })

    it('renders the oversized page for real when the reader flips back to formatted', async () => {
      const { document } = await mockDocumentContentSlice('Hello world')
      const { plugins } = core
      const wrapper = shallowMount(DocumentContent, { props: { document }, global: { plugins } })
      await flushPromises()
      wrapper.findComponent({ name: 'DocumentContentMarkdown' }).vm.$emit('oversized')
      await flushPromises()
      wrapper.vm.preferMarkdown = true
      await flushPromises()
      const markdownBody = wrapper.findComponent({ name: 'DocumentContentMarkdown' })
      expect(markdownBody.exists()).toBe(true)
      expect(markdownBody.props('renderOversized')).toBe(true)
    })

    it('drops the oversized state when the reader moves to another page', async () => {
      const { document } = await mockDocumentContentSlice('Hello world')
      const { plugins } = core
      const wrapper = shallowMount(DocumentContent, { props: { document }, global: { plugins } })
      await flushPromises()
      wrapper.findComponent({ name: 'DocumentContentMarkdown' }).vm.$emit('oversized')
      await flushPromises()
      wrapper.vm.preferMarkdown = true
      await flushPromises()
      expect(wrapper.findComponent({ name: 'DocumentContentMarkdown' }).props('renderOversized')).toBe(true)
      wrapper.vm.markdownPage = 2
      await flushPromises()
      expect(wrapper.findComponent({ name: 'DocumentContentMarkdown' }).props('renderOversized')).toBe(false)
    })

    it('drops the oversized state when the document changes', async () => {
      const { document } = await mockDocumentContentSlice('Hello world')
      const { plugins } = core
      const wrapper = shallowMount(DocumentContent, { props: { document }, global: { plugins } })
      await flushPromises()
      wrapper.findComponent({ name: 'DocumentContentMarkdown' }).vm.$emit('oversized')
      await flushPromises()
      const other = { index: document.index, id: 'other-document-id', routing: 'other-document-id' }
      await wrapper.setProps({ document: other })
      await flushPromises()
      const markdownBody = wrapper.findComponent({ name: 'DocumentContentMarkdown' })
      expect(markdownBody.exists()).toBe(true)
      expect(markdownBody.props('renderOversized')).toBe(false)
    })

    it('keeps the page and the render consent when flipping back to formatted on an unaligned document', async () => {
      const { document } = await mockDocumentContentSlice('Hello world')
      const { plugins } = core
      const wrapper = shallowMount(DocumentContent, { props: { document }, global: { plugins } })
      await flushPromises()
      wrapper.vm.markdownPage = 3
      await flushPromises()
      wrapper.findComponent({ name: 'DocumentContentMarkdown' }).vm.$emit('oversized')
      await flushPromises()
      wrapper.vm.preferMarkdown = true
      await flushPromises()
      const markdownBody = wrapper.findComponent({ name: 'DocumentContentMarkdown' })
      expect(wrapper.vm.markdownPage).toBe(3)
      expect(markdownBody.props('renderOversized')).toBe(true)
    })

    it('clears the slow warning once the oversized page actually renders', async () => {
      const { document } = await mockDocumentContentSlice('Hello world')
      const { plugins } = core
      const wrapper = shallowMount(DocumentContent, { props: { document }, global: { plugins } })
      await flushPromises()
      wrapper.findComponent({ name: 'DocumentContentMarkdown' }).vm.$emit('oversized')
      await flushPromises()
      wrapper.vm.preferMarkdown = true
      await flushPromises()
      wrapper.findComponent({ name: 'DocumentContentMarkdown' }).vm.$emit('rendered')
      await flushPromises()
      expect(wrapper.findComponent(DocumentContentDropdown).props('markdownSlow')).toBe(false)
      expect(wrapper.findComponent({ name: 'DocumentContentMarkdown' }).exists()).toBe(true)
    })

    it('paginates by the manifest page count in markdown mode', async () => {
      const { document } = await mockDocumentContentSlice('Hello world')
      const { plugins } = core
      const wrapper = shallowMount(DocumentContent, { props: { document }, global: { plugins } })
      await flushPromises()
      expect(wrapper.vm.nbPages).toBe(3)
    })

    it('navigates markdown pages through the page model', async () => {
      const { document } = await mockDocumentContentSlice('Hello world')
      const { plugins } = core
      const wrapper = shallowMount(DocumentContent, { props: { document }, global: { plugins } })
      await flushPromises()
      wrapper.vm.page = 2
      await flushPromises()
      expect(wrapper.vm.markdownPage).toBe(2)
    })

    it('goes back to the first page when toggling to unaligned plain text', async () => {
      const { document } = await mockDocumentContentSlice('Hello world')
      const { plugins } = core
      const wrapper = shallowMount(DocumentContent, { props: { document }, global: { plugins } })
      await flushPromises()
      wrapper.vm.page = 2
      await flushPromises()
      wrapper.vm.preferMarkdown = false
      await flushPromises()
      expect(wrapper.vm.page).toBe(1)
    })

    it('does not fetch a text slice while paginating in markdown mode', async () => {
      const { document } = await mockDocumentContentSlice('Hello world')
      const { plugins } = core
      const wrapper = shallowMount(DocumentContent, { props: { document }, global: { plugins } })
      await flushPromises()
      const callsBeforePaginating = api.getDocumentSlice.mock.calls.length
      wrapper.vm.page = 2
      await flushPromises()
      expect(api.getDocumentSlice.mock.calls.length).toBe(callsBeforePaginating)
    })

    // The page-sync logic only ever runs against a real, non-empty
    // `syncedPages` when `mustSyncPages` gates it open, which requires a PDF
    // document, a configured `artifactDir`, and a Tika version matching the
    // mocked `getVersion` response. Without this, `syncedPages` stays `[]`
    // and every assertion below would hold trivially regardless of whether
    // the sync logic exists at all.
    describe('page position sync against a real pdf pagination', () => {
      const PDF_ARTIFACT_TIKA_VERSION = '1.2.3'

      function withPdfArtifactMetadata(document) {
        return document
          .withContentType('application/pdf')
          .withMetadata({ tika_metadata_tika_version: PDF_ARTIFACT_TIKA_VERSION })
      }

      beforeEach(() => {
        core.config.set('artifactDir', '/artifacts')
      })

      afterEach(() => {
        core.config.set('artifactDir', undefined)
      })

      it('keeps the page position when toggling to an aligned plain text pagination', async () => {
        api.getPages.mockResolvedValue({ pages: [[0, 19], [20, 39], [40, 59]] })
        const { document } = await mockDocumentContentSlice('x'.repeat(60), { configureDocument: withPdfArtifactMetadata })
        const { plugins } = core
        const wrapper = shallowMount(DocumentContent, { props: { document }, global: { plugins } })
        await flushPromises()
        wrapper.vm.page = 2
        await flushPromises()
        wrapper.vm.preferMarkdown = false
        await flushPromises()
        expect(wrapper.vm.page).toBe(2)
        // The kept page must also be the activated text slice, otherwise the
        // pagination says page 2 while the body still shows page 1.
        expect(wrapper.vm.activeContentSliceOffset).toBe(20)
      })

      it('resets an unaligned plain text pagination back to the first page', async () => {
        api.getPages.mockResolvedValue({ pages: [[0, 29], [30, 59]] })
        const { document } = await mockDocumentContentSlice('x'.repeat(60), { configureDocument: withPdfArtifactMetadata })
        const { plugins } = core
        const wrapper = shallowMount(DocumentContent, { props: { document }, global: { plugins } })
        await flushPromises()
        wrapper.vm.page = 2
        await flushPromises()
        // Manufacture a stale, non-zero offset a real navigation could have
        // left behind, so the assertion below actually exercises the reset
        // instead of trivially matching an offset that never moved.
        wrapper.vm.activeContentSliceOffset = 30
        wrapper.vm.preferMarkdown = false
        await flushPromises()
        expect(wrapper.vm.page).toBe(1)
        expect(wrapper.vm.activeContentSliceOffset).toBe(0)
      })
    })

    describe('local search', () => {
      beforeEach(() => {
        api.searchStructurePages.mockResolvedValue({
          count: 3,
          pages: 3,
          scanned: 3,
          hits: [
            { page: 2, count: 1 },
            { page: 3, count: 2 }
          ]
        })
      })

      it('searches the structure pages instead of the raw content', async () => {
        const { document } = await mockDocumentContentSlice('Hello world')
        const { plugins } = core
        const wrapper = shallowMount(DocumentContent, { props: { document, q: ' hello ' }, global: { plugins } })
        await flushLocalSearch()
        // Assert on the leading arguments only: the routing value depends on how the
        // fixture document was indexed, and this test is about the trimmed query.
        const [project, documentId, query] = api.searchStructurePages.mock.calls[0]
        expect([project, documentId, query]).toEqual([index, 'document', 'hello'])
        expect(api.searchDocument).not.toBeCalled()
        // A markdown document opened with `q` must search exactly once: the mode
        // watcher firing during `onMounted`'s manifest probe must not duplicate
        // the search `onMounted`'s own `q` branch already issues.
        expect(api.searchStructurePages).toBeCalledTimes(1)
        // The same trimmed term that was sent to the endpoint must be the one
        // used to mark matches, so the DOM marks match what the backend counted.
        const markdownBody = wrapper.findComponent({ name: 'DocumentContentMarkdown' })
        expect(markdownBody.props('term')).toBe('hello')
      })

      it('keeps the attachments block visible when markdown mode is entered through the q prop', async () => {
        const { document } = await mockDocumentContentSlice('Hello world')
        const { plugins } = core
        const wrapper = shallowMount(DocumentContent, { props: { document, q: 'hello' }, global: { plugins } })
        await flushLocalSearch()
        const attachments = wrapper.findComponent({ name: 'DocumentAttachments' })
        expect(attachments.exists()).toBe(true)
        expect(attachments.attributes('style')).not.toContain('display: none')
      })

      it('lands on the first hit page with the occurrences count', async () => {
        const { document } = await mockDocumentContentSlice('Hello world')
        const { plugins } = core
        const wrapper = shallowMount(DocumentContent, { props: { document, q: 'hello' }, global: { plugins } })
        await flushLocalSearch()
        expect(wrapper.vm.localSearchOccurrences).toBe(3)
        expect(wrapper.vm.localSearchIndex).toBe(1)
        expect(wrapper.vm.markdownPage).toBe(2)
      })

      it('navigates to the next occurrence page and match', async () => {
        const { document } = await mockDocumentContentSlice('Hello world')
        const { plugins } = core
        const wrapper = shallowMount(DocumentContent, { props: { document, q: 'hello' }, global: { plugins } })
        await flushLocalSearch()
        wrapper.vm.localSearchIndex = 2
        await flushPromises()
        expect(wrapper.vm.markdownPage).toBe(3)
        expect(wrapper.vm.activeMarkdownMatch).toBe(1)
        wrapper.vm.localSearchIndex = 3
        await flushPromises()
        expect(wrapper.vm.markdownPage).toBe(3)
        expect(wrapper.vm.activeMarkdownMatch).toBe(2)
      })

      it('degrades to zero occurrences when the search fails', async () => {
        api.searchStructurePages.mockRejectedValue(new Error('Network Error'))
        const { document } = await mockDocumentContentSlice('Hello world')
        const { plugins } = core
        const wrapper = shallowMount(DocumentContent, { props: { document, q: 'hello' }, global: { plugins } })
        await flushLocalSearch()
        expect(wrapper.vm.localSearchOccurrences).toBe(0)
        expect(wrapper.vm.localSearchIndex).toBe(0)
      })

      it('does not pass the search term down to the markdown body when the search finds zero occurrences', async () => {
        api.searchStructurePages.mockResolvedValue({ count: 0, pages: 0, scanned: 3, hits: [] })
        const { document } = await mockDocumentContentSlice('Hello world')
        const { plugins } = core
        const wrapper = shallowMount(DocumentContent, { props: { document, q: 'hello' }, global: { plugins } })
        await flushLocalSearch()
        expect(wrapper.vm.localSearchOccurrences).toBe(0)
        const markdownBody = wrapper.findComponent({ name: 'DocumentContentMarkdown' })
        expect(markdownBody.props('term')).toBe('')
      })

      it('marks the term of the newest search when two responses land out of order', async () => {
        const firstSearch = createDeferredPromise()
        const secondSearch = createDeferredPromise()
        api.searchStructurePages.mockReturnValueOnce(firstSearch.promise).mockReturnValueOnce(secondSearch.promise)
        const { document } = await mockDocumentContentSlice('Hello world')
        const { plugins } = core
        const wrapper = shallowMount(DocumentContent, { props: { document, q: 'foo' }, global: { plugins } })
        await flushLocalSearch()
        wrapper.vm.localSearchTerm = 'foobar'
        await flushLocalSearch()
        secondSearch.resolve({ count: 1, pages: 3, scanned: 3, hits: [{ page: 1, count: 1 }] })
        await flushPromises()
        // The superseded response lands last: it must not describe the marks.
        firstSearch.resolve({ count: 1, pages: 3, scanned: 3, hits: [{ page: 2, count: 1 }] })
        await flushPromises()
        const markdownBody = wrapper.findComponent({ name: 'DocumentContentMarkdown' })
        expect(markdownBody.props('term')).toBe('foobar')
      })

      it('re-runs the search through the raw content when toggling to plain text', async () => {
        api.searchDocument.mockResolvedValue({ count: 1, offsets: [0] })
        const { document } = await mockDocumentContentSlice('Hello world')
        const { plugins } = core
        const wrapper = shallowMount(DocumentContent, { props: { document, q: 'hello' }, global: { plugins } })
        await flushLocalSearch()
        wrapper.vm.preferMarkdown = false
        await flushPromises()
        const [project, documentId, query] = api.searchDocument.mock.calls[0]
        expect([project, documentId, query]).toEqual([index, 'document', 'hello'])
      })

      // Ruling 1's actual scenario: a translation forces text mode (rather than
      // the user toggling `preferMarkdown` directly), and the search MUST
      // switch from `searchStructurePages` back to `searchDocument`.
      it('re-runs the search through the raw content when a translation forces plain text', async () => {
        api.searchDocument.mockResolvedValue({ count: 1, offsets: [0] })
        const { document } = await mockDocumentContentSlice('Hello world')
        const { plugins } = core
        const wrapper = shallowMount(DocumentContent, { props: { document, q: 'hello' }, global: { plugins } })
        await flushLocalSearch()
        await wrapper.setProps({ targetLanguage: 'ENGLISH' })
        await flushPromises()
        expect(wrapper.vm.isMarkdownMode).toBe(false)
        const [project, documentId, query] = api.searchDocument.mock.calls[0]
        expect([project, documentId, query]).toEqual([index, 'document', 'hello'])
      })

      it('keeps only the newest occurrence retrieval when a mode flip interleaves two responses', async () => {
        const { document } = await mockDocumentContentSlice('Hello world')
        const { plugins } = core
        const wrapper = shallowMount(DocumentContent, { props: { document }, global: { plugins } })
        await flushPromises()

        const markdownDeferred = createDeferredPromise()
        const textDeferred = createDeferredPromise()
        api.searchStructurePages.mockReturnValue(markdownDeferred.promise)
        api.searchDocument.mockReturnValue(textDeferred.promise)

        // Start a markdown search that stays in flight (the server-side page
        // scan is slow)...
        wrapper.vm.localSearchTerm = 'foo'
        await flushLocalSearch()
        // ...then flip to plain text before it resolves: this starts a second,
        // competing retrieval through the raw-content endpoint.
        wrapper.vm.preferMarkdown = false
        await flushPromises()

        // The newer (text) request wins the race by resolving first.
        textDeferred.resolve({ count: 1, offsets: [5] })
        await flushPromises()
        // The stale markdown response lands after: it must not clobber the
        // already-written, consistent text-mode result.
        markdownDeferred.resolve({ count: 9, pages: 9, scanned: 9, hits: [{ page: 1, count: 9 }] })
        await flushPromises()

        expect(wrapper.vm.localSearchOccurrences).toBe(1)
        expect(wrapper.vm.localSearchIndexes).toEqual([5])
        expect(wrapper.vm.localSearchIndex).toBe(1)
      })

      it('still re-runs a later mode-flip search even if the initial mount sequence failed', async () => {
        const { document } = await mockDocumentContentSlice('Hello world')
        const { plugins } = core
        // A transient mount-time failure (here, `loadMaxOffset`'s own call to
        // `getDocumentSlice`, which is awaited inside `onMounted`'s
        // `Promise.all` with no catch) must not permanently disable later,
        // legitimate mode-flip searches. `onMounted`'s rejection is expected
        // and asserted below through an app-level error handler, rather than
        // left to escape as an unhandled rejection: Vue delivers it there
        // (`runtime-core.cjs.js`'s `handleError`) before it would otherwise
        // log-and-rethrow.
        api.getDocumentSlice.mockRejectedValueOnce(new Error('Network Error'))
        api.searchDocument.mockResolvedValue({ count: 1, offsets: [0] })
        const errorHandler = vi.fn()
        const global = { plugins, config: { errorHandler } }
        const wrapper = shallowMount(DocumentContent, { props: { document, q: 'hello' }, global })
        await flushLocalSearch()
        expect(errorHandler).toBeCalledWith(new Error('Network Error'), expect.anything(), expect.anything())
        // A second, unrelated Vue-dispatched error inside this test must not
        // slip by unnoticed just because the expected error also occurred.
        expect(errorHandler).toBeCalledTimes(1)
        wrapper.vm.preferMarkdown = false
        await flushPromises()
        const [project, documentId, query] = api.searchDocument.mock.calls[0]
        expect([project, documentId, query]).toEqual([index, 'document', 'hello'])
      })
    })
  })

  describe('the toolbox', () => {
    // `clearAllMocks` keeps the implementations the markdown describe installed,
    // so plain text mode has to be asked for again here.
    beforeEach(() => {
      api.getStructureManifest.mockResolvedValue(null)
      api.getStructurePage.mockResolvedValue('')
    })

    it('renders every hook position under the document.content prefix', async () => {
      const { document } = await mockDocumentContentSlice('Hello world')
      const { plugins } = core
      const wrapper = mount(DocumentContent, { props: { document }, global: { plugins } })
      await flushPromises()
      const names = wrapper.findAllComponents(Hook).map(hook => hook.props('name'))
      expect(names).toContain('document.content.toolbox:before')
      expect(names).toContain('document.content.toolbox.local-search:before')
      expect(names).toContain('document.content.toolbox.local-search:after')
      expect(names).toContain('document.content.toolbox.before:before')
      expect(names).toContain('document.content.toolbox.pagination:after')
      expect(names).toContain('document.content.toolbox:after')
    })

    it('holds the paginator back until a content slice has landed', async () => {
      const { document } = await mockDocumentContentSlice('a'.repeat(60))
      const deferred = createDeferredPromise()
      // The `maxOffset` probe asks for no content at all; every other call is a
      // slice, and holding it pending leaves the body empty with the page count known.
      api.getDocumentSlice.mockImplementation(async (project, documentId, offset, limit) => {
        if (limit === 0) {
          return { content: '', maxOffset: 60, offset, limit }
        }
        return deferred.promise
      })
      const { plugins } = core
      const props = { document, pageSize: 10 }
      const wrapper = mount(DocumentContent, { props, global: { plugins } })
      await flushPromises()
      expect(wrapper.vm.nbPages).toBe(7)
      expect(wrapper.findComponent(PaginationTiny).exists()).toBe(false)
      expect(wrapper.findComponent(DocumentLocalSearch).props('loading')).toBe(true)
      deferred.resolve({ content: 'a'.repeat(10), maxOffset: 60, offset: 0, limit: 10 })
      await flushPromises()
      expect(wrapper.findComponent(PaginationTiny).exists()).toBe(true)
      expect(wrapper.findComponent(DocumentLocalSearch).props('loading')).toBe(false)
    })

    it('hides the paginator on a single page document', async () => {
      const { document } = await mockDocumentContentSlice('short')
      const { plugins } = core
      const wrapper = mount(DocumentContent, { props: { document }, global: { plugins } })
      await flushPromises()
      expect(wrapper.findComponent(PaginationTiny).exists()).toBe(false)
    })

    it('pages the markdown artifact through the toolbox paginator', async () => {
      api.getStructureManifest.mockResolvedValue({ pages: 3, formats: ['md'] })
      api.getStructurePage.mockResolvedValue('# Hello world')
      const { document } = await mockDocumentContentSlice('Hello world')
      const { plugins } = core
      const wrapper = mount(DocumentContent, { props: { document }, global: { plugins } })
      await flushPromises()
      expect(wrapper.findComponent(PaginationTiny).props('totalRows')).toBe(3)
      wrapper.findComponent(PaginationTiny).vm.$emit('update:modelValue', 2)
      await flushPromises()
      expect(wrapper.vm.markdownPage).toBe(2)
    })

    it('pages the plain text slices through the toolbox paginator', async () => {
      const { document } = await mockDocumentContentSlice('a'.repeat(60))
      const { plugins } = core
      const props = { document, pageSize: 10 }
      const wrapper = mount(DocumentContent, { props, global: { plugins } })
      await flushPromises()
      // `nbPages` counts `maxOffset / pageSize + 1`, one more than the six
      // slices `offsets` actually holds for a 60 character document.
      expect(wrapper.findComponent(PaginationTiny).props('totalRows')).toBe(7)
      wrapper.findComponent(PaginationTiny).vm.$emit('update:modelValue', 3)
      await flushPromises()
      expect(wrapper.vm.activeContentSliceOffset).toBe(20)
    })

    it('keeps the dropdown in the toolbox when the document has markdown', async () => {
      api.getStructureManifest.mockResolvedValue({ pages: 3, formats: ['md'] })
      api.getStructurePage.mockResolvedValue('# Hello world')
      const { document } = await mockDocumentContentSlice('Hello world')
      const { plugins } = core
      const wrapper = mount(DocumentContent, { props: { document }, global: { plugins } })
      await flushPromises()
      expect(wrapper.findComponent(DocumentContentDropdown).exists()).toBe(true)
    })
  })
})
