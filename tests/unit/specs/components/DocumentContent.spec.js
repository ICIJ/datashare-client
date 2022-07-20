import { toLower } from 'lodash'
import { createLocalVue, shallowMount } from '@vue/test-utils'

import Api from '@/api'
import { Core } from '@/core'
import DocumentContent from '@/components/DocumentContent'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import { getOS } from '@/utils/utils'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import { letTextContent } from 'tests/unit/api_mock'

jest.mock('axios')
jest.mock('@/utils/utils', () => {
  return {
    getOS: jest.fn()
  }
})

// Disable lodash throttle to avoid side-effets
jest.mock('lodash', () => {
  return {
    ...jest.requireActual('lodash'),
    throttle: cb => cb
  }
})

window.HTMLElement.prototype.scrollIntoView = jest.fn()

describe('DocumentContent.vue', () => {
  const index = toLower('DocumentContent')
  esConnectionHelper(index)
  const es = esConnectionHelper.es
  const id = 'document'
  const { i18n, localVue, store } = Core.init(createLocalVue()).useAll()

  beforeEach(() => getOS.mockReset())

  afterEach(() => {
    store.commit('document/reset')
    store.commit('search/reset')
  })

  afterAll(() => jest.unmock('@/utils/utils'))

  describe('the extracted text content', () => {
    it('should sanitize the HTML in the extracted text', async () => {
      await letData(es).have(new IndexedDocument(id, index)
        .withContent('this is a <span>content</span> with some <img src="this.is.a.source" alt="alt" title="title" />images and <a href="this.is.an.href" target="_blank">links</a>'))
        .commit()
      await store.dispatch('document/get', { id, index })
      await store.dispatch('document/getContent')
      await store.dispatch('document/getFirstPageForNamedEntityInAllCategories')
      const wrapper = shallowMount(DocumentContent, {
        i18n,
        localVue,
        store,
        propsData: {
          document: store.state.document.doc
        }
      })

      await wrapper.vm.transformContent()
      expect(wrapper.find('.document-content__body p').html()).toEqual('<p>this is a content with some images and links</p>')
    })

    it('should not sanitize the <mark /> tags in the extracted text', async () => {
      await letData(es).have(new IndexedDocument(id, index)
        .withContent('this is a <mark>document</mark>'))
        .commit()
      await store.dispatch('document/get', { id, index })
      await store.dispatch('document/getContent')
      await store.dispatch('document/getFirstPageForNamedEntityInAllCategories')
      const wrapper = shallowMount(DocumentContent, {
        i18n,
        localVue,
        store,
        propsData: {
          document: store.state.document.doc
        }
      })

      await wrapper.vm.transformContent()
      expect(wrapper.find('.document-content__body p').html()).toEqual('<p>this is a <mark>document</mark></p>')
    })

    it('should display the text right to left depending on the language', async () => {
      await letData(es).have(new IndexedDocument(id, index)
        .withContent('المنال ويتلذذ بالآلام، الألم هو الألم ولكن نتيجة لظروف ما قد تكمن السعاده فيما نتحمله من كد وأسي.')
        .withLanguage('ARABIC'))
        .commit()
      await store.dispatch('document/get', { id, index })
      await store.dispatch('document/getContent')
      await store.dispatch('document/getFirstPageForNamedEntityInAllCategories')
      const wrapper = shallowMount(DocumentContent, {
        i18n,
        localVue,
        store,
        propsData: {
          document: store.state.document.doc
        }
      })

      await wrapper.vm.transformContent()
      expect(wrapper.find('.document-content__body').html()).toContain('--rtl')
    })

    it('should NOT display the text right to left depending on the language', async () => {
      await letData(es).have(new IndexedDocument(id, index)
        .withContent('This text must be displayed in left to right.'))
        .commit()
      await store.dispatch('document/get', { id, index })
      await store.dispatch('document/getContent')
      await store.dispatch('document/getFirstPageForNamedEntityInAllCategories')
      const wrapper = shallowMount(DocumentContent, {
        i18n,
        localVue,
        store,
        propsData: {
          document: store.state.document.doc
        }
      })

      await wrapper.vm.transformContent()
      expect(wrapper.find('.document-content__body').html()).not.toContain('--rtl')
    })
  })

  describe('search term', () => {
    describe('witg 1 occurence', () => {
      beforeAll(() => {
        jest.spyOn(Api.prototype, 'searchDocument')
          .mockImplementation(() => {
            return Promise.resolve({ count: 1, offsets: [10] })
          })
      })

      afterAll(async () => {
        // Ensure all promise are flushed before clearing the mocks
        await new Promise(resolve => setTimeout(resolve, 0))
        jest.clearAllMocks()
      })

      it('should support regex', async () => {
        await letData(es).have(new IndexedDocument(id, index)
          .withContent('this is a test.\nFor testing purpose.'))
          .commit()
        await store.dispatch('document/get', { id, index })
        await store.dispatch('document/getContent')
        const wrapper = shallowMount(DocumentContent, {
          i18n,
          localVue,
          store,
          propsData: {
            document: store.state.document.doc
          }
        })

        wrapper.vm.$set(wrapper.vm, 'localSearchTerm', { label: 'test.*', regex: true })
        await wrapper.vm.transformContent()

        expect(wrapper.vm.localSearchOccurrences).toEqual(1)
      })
    })

    describe('with 2 occurences', () => {
      let wrapper

      beforeAll(() => {
        jest.spyOn(Api.prototype, 'searchDocument')
          .mockImplementation(() => {
            return Promise.resolve({ count: 2, offsets: [10, 15] })
          })
      })

      beforeEach(async () => {
        // Create a document
        await letData(es).have(new IndexedDocument(id, index)
          .withContent('this is a full full content'))
          .commit()
        // Get the document and its content
        await store.dispatch('document/get', { id, index })
        await store.dispatch('document/getContent')
        // Mount the DocumentContent with this specific document
        const document = store.state.document.doc
        const propsData = { document }
        wrapper = shallowMount(DocumentContent, { i18n, localVue, store, propsData })
        // Use vm.$set method to set nested value reactivly
        wrapper.vm.$set(wrapper.vm, 'localSearchTerm', { label: 'full' })
        await wrapper.vm.$nextTick()
      })

      afterAll(async () => {
        // Ensure all promise are flushed before clearing the mocks
        await new Promise(resolve => setTimeout(resolve, 0))
        jest.clearAllMocks()
      })

      it('should not sticky the toolbox by default', () => {
        expect(wrapper.find('.document-content__toolbox--sticky').exists()).toBeFalsy()
      })

      it('should highlight the first occurrence of the searched term', async () => {
        await wrapper.vm.transformContent()
        const { innerHTML } = wrapper.find('.document-content__body').element
        expect(innerHTML).toEqual('<p>this is a <mark class="local-search-term local-search-term--active">full</mark> <mark class="local-search-term">full</mark> content</p>')
      })

      it('should find the previous and next occurrence, as a loop', async () => {
        await wrapper.vm.transformContent()
        const { element } = wrapper.find('.document-content__body')

        expect(wrapper.vm.localSearchIndex).toEqual(1)
        expect(element.innerHTML).toEqual('<p>this is a <mark class="local-search-term local-search-term--active">full</mark> <mark class="local-search-term">full</mark> content</p>')

        wrapper.vm.findNextLocalSearchTerm()
        await wrapper.vm.$nextTick()

        expect(wrapper.vm.localSearchIndex).toEqual(2)
        expect(element.innerHTML).toEqual('<p>this is a <mark class="local-search-term">full</mark> <mark class="local-search-term local-search-term--active">full</mark> content</p>')

        wrapper.vm.findPreviousLocalSearchTerm()
        await wrapper.vm.$nextTick()

        expect(wrapper.vm.localSearchIndex).toEqual(1)
        expect(element.innerHTML).toEqual('<p>this is a <mark class="local-search-term local-search-term--active">full</mark> <mark class="local-search-term">full</mark> content</p>')

        wrapper.vm.findNextLocalSearchTerm()
        await wrapper.vm.$nextTick()

        expect(wrapper.vm.localSearchIndex).toEqual(2)
        expect(element.innerHTML).toEqual('<p>this is a <mark class="local-search-term">full</mark> <mark class="local-search-term local-search-term--active">full</mark> content</p>')
      })
    })

    describe('with 3 occurences', () => {
      beforeAll(() => {
        jest.spyOn(Api.prototype, 'searchDocument')
          .mockImplementation(() => {
            return Promise.resolve({ count: 3, offsets: [10, 15, 28] })
          })
      })

      afterAll(async () => {
        // Ensure all promise are flushed before clearing the mocks
        await new Promise(resolve => setTimeout(resolve, 0))
        jest.clearAllMocks()
      })

      it('should be case insensitive', async () => {
        // Create a document
        await letData(es).have(new IndexedDocument(id, index)
          .withContent('this is a full FulL content fuLL'))
          .commit()

        // Get the document and its content
        await store.dispatch('document/get', { id, index })
        await store.dispatch('document/getContent')

        // Mount the DocumentContent with this specific document
        const document = store.state.document.doc
        const propsData = { document }
        const wrapper = shallowMount(DocumentContent, { i18n, localVue, store, propsData })

        // Use vm.$set method to set nested value reactivly
        wrapper.vm.$set(wrapper.vm, 'localSearchTerm', { label: 'full' })
        await wrapper.vm.transformContent()

        expect(wrapper.vm.localSearchOccurrences).toEqual(3)
      })
    })
  })

  describe('document content lazy loading', () => {
    afterEach(async () => {
      // Ensure all promise are flushed before clearing the mocks
      await new Promise(resolve => setTimeout(resolve, 0))
      jest.clearAllMocks()
    })

    it('should lazy load the entire document', async () => {
      // Create a document with a small content text length
      const indexedDocument = new IndexedDocument(id, index)
      indexedDocument.withContent('this is a content')
      indexedDocument.setContentTextLength(20)

      // Save and get the document from Elasticsearch
      await letData(es).have(indexedDocument).commit()
      await store.dispatch('document/get', { id, index })
      await store.dispatch('document/setContent', null)

      // Build the wrapper with the created document
      const document = store.state.document.doc
      const propsData = { document }
      const wrapper = shallowMount(DocumentContent, { i18n, localVue, store, propsData })

      expect(document.content).toBeFalsy()
      await wrapper.vm.loadContent()
      expect(document.content).toBe('this is a content')
    })

    it('should lazy load 2 slices of 10 caracters of a long text document', async () => {
      // Create a document with a huge content text length
      const indexedDocument = new IndexedDocument(id, index)
        .withContent('this is a content from Elastic search doc')
        .setContentTextLength(2e5)

      // Save and get the document from Elasticsearch
      await letData(es).have(indexedDocument).commit()

      // Mock the first text content slice
      const firstContentSlice = letTextContent()
        .withContent('this is a ')
        .withLimit(10)
        .withMaxOffset(2e5)
        .getResponse()

      jest.spyOn(Api.prototype, 'getDocumentSlice')
        .mockImplementation(() => Promise.resolve(firstContentSlice))

      // Get the document fields (except content)
      await store.dispatch('document/get', { id, index })
      await store.dispatch('document/setContent', null)

      // Build the wrapper with the created document
      const document = store.state.document.doc
      // Limit the document
      const pageSize = 10
      const propsData = { document, pageSize }
      const wrapper = await shallowMount(DocumentContent, { i18n, localVue, store, propsData })

      // Load the first slice
      await wrapper.vm.loadContent()
      expect(document.content).toBe('this is a ')

      // Mock the second text content slice
      const secondContentSlice = letTextContent()
        .withContent('content fr')
        .withOffset(10)
        .withLimit(10)
        .withMaxOffset(2e5)
        .getResponse()

      jest.spyOn(Api.prototype, 'getDocumentSlice')
        .mockImplementation(() => Promise.resolve(secondContentSlice))

      // Continue to load content
      await wrapper.vm.loadContent()
      expect(document.content).toBe('this is a content fr')
    })

    it('should lazy load the entire text of a document', async () => {
      // Create a document with a small content text length
      const indexedDocument = new IndexedDocument(id, index)
        .withContent('this is a content lazy loaded from the mocked API')
        .setContentTextLength(25e5)

      // Save and get the document from Elasticsearch
      await letData(es).have(indexedDocument).commit()

      // Mock the first text content slice
      const firstContentSlice = letTextContent()
        .withContent('this is a content lazy loaded from the mocked API')
        .withMaxOffset(25e5)
        .getResponse()

      jest.spyOn(Api.prototype, 'getDocumentSlice')
        .mockImplementation(() => Promise.resolve(firstContentSlice))

      // Get the document fields (except content)
      await store.dispatch('document/get', { id, index })
      await store.dispatch('document/setContent', null)

      // Build the wrapper with the created document
      const document = store.state.document.doc
      const propsData = { document }
      const wrapper = shallowMount(DocumentContent, { i18n, localVue, store, propsData })

      expect(document.content).toBeFalsy()
      await wrapper.vm.loadContent()
      expect(document.content).toBe('this is a content lazy loaded from the mocked API')
    })
  })

  it('should emit an event "document::content-loaded" when document is loaded', async () => {
    // Create a document with a small content text length
    const indexedDocument = new IndexedDocument(id, index)
      .withContent('this is a content')
      .setContentTextLength(20)

    // Save and get the document from Elasticsearch
    await letData(es).have(indexedDocument).commit()
    await store.dispatch('document/get', { id, index })

    // Build the wrapper with the created document
    const document = store.state.document.doc
    const propsData = { document }
    const wrapper = shallowMount(DocumentContent, { i18n, localVue, store, propsData })

    const mockCallback = jest.fn()
    wrapper.vm.$root.$on('document::content-loaded', mockCallback)
    expect(mockCallback).not.toBeCalled()
    await wrapper.vm.loadContent()
    expect(mockCallback).toBeCalled()
  })
})
