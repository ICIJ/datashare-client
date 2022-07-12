import { toLower } from 'lodash'
import { createLocalVue, shallowMount } from '@vue/test-utils'

import { Core } from '@/core'
import DocumentContent from '@/components/DocumentContent'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import { getOS } from '@/utils/utils'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import { letTextContent } from 'tests/unit/api_mock'
import axios from 'axios'

jest.mock('@/utils/utils', () => {
  return {
    getOS: jest.fn()
  }
})
jest.mock('axios')

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
    it('should not sticky the toolbox by default', async () => {
      await letData(es).have(new IndexedDocument(id, index)
        .withContent('this is a full full content')
        .withNer('ner', 0))
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

      await wrapper.vm.$nextTick()
      expect(wrapper.find('.document-content__toolbox--sticky').exists()).toBeFalsy()
    })

    it('should highlight the first occurrence of the searched term', async () => {
      await letData(es).have(new IndexedDocument(id, index)
        .withContent('this is a full full content'))
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

      wrapper.vm.$set(wrapper.vm, 'localSearchTerm', { label: 'full' })
      await wrapper.vm.transformContent()

      expect(wrapper.find('.document-content__body').element.innerHTML).toEqual('<p>this is a <mark class="local-search-term">full</mark> <mark class="local-search-term">full</mark> content</p>')
    })

    it('should be case insensitive', async () => {
      await letData(es).have(new IndexedDocument(id, index)
        .withContent('this is a full FulL content fuLL'))
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

      wrapper.vm.$set(wrapper.vm, 'localSearchTerm', { label: 'full' })
      await wrapper.vm.transformContent()

      expect(wrapper.vm.localSearchOccurrences).toEqual(3)
    })

    it('should find the previous and next occurrence, as a loop', async () => {
      await letData(es).have(new IndexedDocument(id, index)
        .withContent('this is a full full content'))
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

      wrapper.vm.$set(wrapper.vm, 'localSearchTerm', { label: 'full' })
      await wrapper.vm.transformContent()
      wrapper.vm.jumpToActiveLocalSearchTerm()

      expect(wrapper.vm.localSearchIndex).toEqual(1)
      expect(wrapper.find('.document-content__body').element.innerHTML).toEqual('<p>this is a <mark class="local-search-term local-search-term--active">full</mark> <mark class="local-search-term">full</mark> content</p>')

      wrapper.vm.findNextLocalSearchTerm()
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.localSearchIndex).toEqual(2)
      expect(wrapper.find('.document-content__body').element.innerHTML).toEqual('<p>this is a <mark class="local-search-term">full</mark> <mark class="local-search-term local-search-term--active">full</mark> content</p>')

      wrapper.vm.findPreviousLocalSearchTerm()
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.localSearchIndex).toEqual(1)
      expect(wrapper.find('.document-content__body').element.innerHTML).toEqual('<p>this is a <mark class="local-search-term local-search-term--active">full</mark> <mark class="local-search-term">full</mark> content</p>')

      wrapper.vm.findNextLocalSearchTerm()
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.localSearchIndex).toEqual(2)
      expect(wrapper.find('.document-content__body').element.innerHTML).toEqual('<p>this is a <mark class="local-search-term">full</mark> <mark class="local-search-term local-search-term--active">full</mark> content</p>')
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

  describe('document content lazy loading', () => {
    afterEach(() => {
      jest.unmock('axios')
    })

    it('should load the document', async () => {
      // Create a document with a small content text length
      const indexedDocument = new IndexedDocument(id, index)
      indexedDocument.withContent('this is a content')
      indexedDocument.setContentTextLength(20)

      // Save and get the document from Elasticsearch
      await letData(es).have(indexedDocument).commit()
      await store.dispatch('document/get', { id, index })

      // Build the wrapper with the created document
      const document = store.state.document.doc
      const propsData = { document }
      const wrapper = shallowMount(DocumentContent, { i18n, localVue, store, propsData })

      expect(document.content).toBeFalsy()
      await wrapper.vm.loadContent()
      expect(document.content).toBe('this is a content')
    })

    it('should lazy load 2 slices of 10 caracters of a long text document', async () => {
      const content = letTextContent()
        .withContent('this is a ')
        .withLimit(10)
        .withMaxOffset(2e5)
      axios.request.mockResolvedValue({ data: content.getResponse() })

      // Create a document with a huge content text length
      const indexedDocument = new IndexedDocument(id, index)
      indexedDocument.withContent('this is a content from Elastic search doc')
      indexedDocument.setContentTextLength(2e5)

      // Save and get the document from Elasticsearch
      await letData(es).have(indexedDocument).commit()
      await store.dispatch('document/get', { id, index })

      // Build the wrapper with the created document
      const document = store.state.document.doc
      const propsData = { document }

      const wrapper = await shallowMount(DocumentContent, { i18n, localVue, store, propsData })
      await wrapper.setData({
        pageSize: 10
      })
      expect(document.content).toBeFalsy()
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(document.content).toBe('this is a ')
      const nextSliceContent = letTextContent()
        .withContent('content fr')
        .withOffset(10)
        .withLimit(10)
        .withMaxOffset(2e5)
      axios.request.mockResolvedValue({ data: nextSliceContent.getResponse() })
      await wrapper.vm.loadContent()
      expect(document.content).toBe('this is a content fr')
    })

    it('should use Datashare API to lazy load the long text document', async () => {
      const content = letTextContent()
        .withContent('this is a content lazy loaded from the mocked API')
        .withMaxOffset(2e5)
      axios.request.mockResolvedValue({ data: content.getResponse() })

      // Create a document with a huge content text length and
      // Save and get the document from Elasticsearch
      await letData(es).have(new IndexedDocument(id, index)
        .withContent('this is a content from Elastic search doc')
        .setContentTextLength(2e5))
        .commit()
      await store.dispatch('document/get', { id, index })

      // Build the wrapper with the created document
      const document = store.state.document.doc
      const propsData = { document }
      shallowMount(DocumentContent, { i18n, localVue, store, propsData })
      expect(document.content).toBeFalsy()
      await new Promise(resolve => setTimeout(resolve, 0))
      expect(document.content).toBe('this is a content lazy loaded from the mocked API')
    })
  })

  it('should emit an event "document::content-loaded" when document is loaded', async () => {
    // Create a document with a small content text length
    const indexedDocument = new IndexedDocument(id, index)
    indexedDocument.withContent('this is a content')
    indexedDocument.setContentTextLength(20)

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
