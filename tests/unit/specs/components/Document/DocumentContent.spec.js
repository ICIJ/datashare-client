import { mount, shallowMount } from '@vue/test-utils'

import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import { IndexedDocument, letData } from '~tests/unit/es_utils'
import { letTextContent } from '~tests/unit/api_mock'
import { flushPromises } from '~tests/unit/tests_utils'
import CoreSetup from '~tests/unit/CoreSetup'
import DocumentContent from '@/components/Document/DocumentContent'
import { apiInstance as api } from '@/api/apiInstance'
import { useDocumentStore } from '@/store/modules/document'

// Disable lodash throttle to avoid side-effect
vi.mock('lodash', async (importOriginal) => {
  const { default: actual } = await importOriginal()
  return {
    ...actual,
    throttle: (cb) => cb
  }
})

vi.mock('@/utils/style', () => {
  return {
    hasOverflow: vi.fn().mockReturnValue(false),
    getTranslateValues: vi.fn().mockReturnValue({ y: 0, x: 0, z: 0 })
  }
})

vi.mock('@/api/apiInstance', async (importOriginal) => {
  const { apiInstance } = await importOriginal()

  return {
    apiInstance: {
      ...apiInstance,
      getDocumentSlice: vi.fn(),
      searchDocument: vi.fn()
    }
  }
})

window.HTMLElement.prototype.scrollIntoView = vi.fn()

describe('DocumentContent.vue', () => {
  let core, documentStore
  const { index, es } = esConnectionHelper.build()
  const id = 'document'

  beforeEach(() => {
    vi.clearAllMocks()
    core = CoreSetup.init().useAll()
    documentStore = useDocumentStore()
  })

  async function mockDocumentContentSlice(content = '', { language = 'ENGLISH' } = {}) {
    const contentSlice = letTextContent().withContent(content).getResponse()
    // Index the document
    await letData(es).have(new IndexedDocument(id, index).withContent(content).withLanguage(language)).commit()
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
    // Remove document
    documentStore.reset()
  })

  describe('the extracted text content', () => {
    it('should sanitize the HTML in the extracted text', async () => {
      const content =
        'this is a <span>content</span> with some <img src="this.is.a.source" alt="alt" title="title" />images and <a href="this.is.an.href" target="_blank">links</a>'
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
      const content =
        'المنال ويتلذذ بالآلام، الألم هو الألم ولكن نتيجة لظروف ما قد تكمن السعاده فيما نتحمله من كد وأسي.'
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

    it('should display "No content extracted for this document" and disable the search input when the extracted text is empty', async () => {
      const { document } = await mockDocumentContentSlice('')
      const { plugins } = core
      const props = { document }
      const wrapper = shallowMount(DocumentContent, { props, global: { plugins, renderStubDefaultSlot: true } })
      await flushPromises()
      await wrapper.vm.loadContentSlice()
      const element = wrapper.find('.document-content__body--no-content')
      expect(element.exists()).toBeTruthy()
      expect(element.text()).toBe('No content extracted for this document')
      const input = wrapper.find('document-local-search-stub')
      expect(input.exists()).toBeTruthy()
      expect(input.attributes('disabled')).toBe('true')
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
        await flushPromises()
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
        await flushPromises()
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

    describe('with 3 occurrences', () => {
      let wrapper

      beforeEach(async () => {
        api.searchDocument.mockImplementation(async () => ({ count: 3, offsets: [10, 15, 28] }))
        const content = 'this is a full FulL content fuLL'
        const { document } = await mockDocumentContentSlice(content)
        const { plugins } = core
        const props = { document, q: 'full' }
        wrapper = mount(DocumentContent, { global: { plugins }, props })
        await flushPromises()
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
})
