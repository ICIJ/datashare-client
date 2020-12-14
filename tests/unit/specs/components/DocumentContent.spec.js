import toLower from 'lodash/toLower'
import { createLocalVue, shallowMount } from '@vue/test-utils'

import { Core } from '@/core'
import ContentTextLengthWarning from '@/components/ContentTextLengthWarning'
import DocumentContent from '@/components/DocumentContent'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import { getOS } from '@/utils/utils'
import { IndexedDocument, letData } from 'tests/unit/es_utils'

jest.mock('@/utils/utils', () => {
  return {
    getOS: jest.fn()
  }
})

const { localVue, store } = Core.init(createLocalVue()).useAll()

window.HTMLElement.prototype.scrollIntoView = jest.fn()

describe('DocumentContent.vue', () => {
  const index = toLower('DocumentContent')
  esConnectionHelper(index)
  const es = esConnectionHelper.es
  const id = 'document'

  beforeEach(() => getOS.mockReset())

  afterEach(() => {
    store.commit('document/reset')
    store.commit('search/reset')
  })

  afterAll(() => jest.unmock('@/utils/utils'))

  describe('the extracted text content', () => {
    it('should mark named entities in the extracted text tab', async () => {
      await letData(es).have(new IndexedDocument(id, index)
        .withNer('ner_01', 2, 'PERSON')
        .withNer('ner_02', 17, 'LOCATION'))
        .commit()
      await store.dispatch('document/get', { id, index })
      await store.dispatch('document/getContent')
      await store.dispatch('document/getFirstPageForNamedEntityInAllCategories')
      await store.commit('document/toggleShowNamedEntities', true)
      const wrapper = shallowMount(DocumentContent, {
        localVue,
        store,
        propsData: {
          document: store.state.document.doc
        },
        mocks: { $t: msg => msg }
      })

      await wrapper.vm.transformContent()

      expect(wrapper.findAll('mark')).toHaveLength(2)
      expect(wrapper.findAll('mark').at(0).text()).toEqual('ner_01')
      expect(wrapper.findAll('mark').at(0).classes()).toContain('ner--category-person')
      expect(wrapper.findAll('mark').at(1).text()).toEqual('ner_02')
      expect(wrapper.findAll('mark').at(1).classes()).toContain('ner--category-location')
    })

    it('should sanitize the HTML in the extracted text', async () => {
      await letData(es).have(new IndexedDocument(id, index)
        .withContent('this is a <span>content</span> with some <img src="this.is.a.source" alt="alt" title="title" />images and <a href="this.is.an.href" target="_blank">links</a>'))
        .commit()
      await store.dispatch('document/get', { id, index })
      await store.dispatch('document/getContent')
      await store.dispatch('document/getFirstPageForNamedEntityInAllCategories')
      await store.commit('document/toggleShowNamedEntities', true)
      const wrapper = shallowMount(DocumentContent, {
        localVue,
        store,
        propsData: {
          document: store.state.document.doc
        },
        mocks: { $t: msg => msg }
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
      await store.commit('document/toggleShowNamedEntities', true)
      const wrapper = shallowMount(DocumentContent, {
        localVue,
        store,
        propsData: {
          document: store.state.document.doc
        },
        mocks: { $t: msg => msg }
      })

      await wrapper.vm.transformContent()
      expect(wrapper.find('.document-content__body p').html()).toEqual('<p>this is a <mark>document</mark></p>')
    })
  })

  describe('the "Show named entities" toggle', () => {
    it('should contain a "Show named entities" toggle', async () => {
      await letData(es).have(new IndexedDocument(id, index)
        .withContent('content')
        .withNer('ner', 2, 'PERSON'))
        .commit()
      await store.dispatch('document/get', { id, index })
      await store.dispatch('document/getContent')
      await store.dispatch('document/getFirstPageForNamedEntityInAllCategories')
      const wrapper = shallowMount(DocumentContent, {
        localVue,
        store,
        propsData: {
          document: store.state.document.doc
        },
        mocks: { $t: msg => msg }
      })

      expect(wrapper.exists('.document-content__ner-toggler')).toBeTruthy()
    })

    it('should not contain a "Show named entities" toggle if there is no named entities', async () => {
      await letData(es).have(new IndexedDocument(id, index)
        .withContent('content'))
        .commit()
      await store.dispatch('document/get', { id, index })
      await store.dispatch('document/getContent')
      const wrapper = shallowMount(DocumentContent, {
        localVue,
        store,
        propsData: {
          document: store.state.document.doc
        },
        mocks: { $t: msg => msg }
      })

      await wrapper.vm.transformContent()
      expect(wrapper.exists('.document-content__ner-toggler')).toBeTruthy()
    })

    it('should change the document state of showNamedEntities', async () => {
      await letData(es).have(new IndexedDocument(id, index)
        .withContent('content')
        .withNer('ner', 2, 'PERSON'))
        .commit()
      await store.dispatch('document/get', { id, index })
      await store.dispatch('document/getContent')
      await store.dispatch('document/getFirstPageForNamedEntityInCategory', 'PERSON')
      store.commit('document/toggleShowNamedEntities', true)
      const wrapper = await shallowMount(DocumentContent, {
        localVue,
        store,
        propsData: {
          document: store.state.document.doc
        },
        mocks: { $t: msg => msg }
      })

      expect(store.state.document.showNamedEntities).toBeTruthy()
      wrapper.find('.document-content__ner-toggler label').trigger('click')
      expect(store.state.document.showNamedEntities).toBeFalsy()
    })

    it('should display a document without named entities', async () => {
      await letData(es).have(new IndexedDocument(id, index)
        .withContent('content')
        .withNer('tent', 3, 'PERSON'))
        .commit()
      await store.dispatch('document/get', { id, index })
      await store.dispatch('document/getContent')
      await store.dispatch('document/getFirstPageForNamedEntityInAllCategories')
      store.commit('document/toggleShowNamedEntities', false)
      const wrapper = shallowMount(DocumentContent, {
        localVue,
        store,
        propsData: {
          document: store.state.document.doc
        },
        mocks: { $t: msg => msg }
      })

      await wrapper.vm.$nextTick()
      expect(wrapper.findAll('mark')).toHaveLength(0)
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
      await store.commit('document/toggleShowNamedEntities', true)
      const wrapper = shallowMount(DocumentContent, {
        localVue,
        store,
        propsData: {
          document: store.state.document.doc
        },
        mocks: { $t: msg => msg }
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
        localVue,
        store,
        propsData: {
          document: store.state.document.doc
        },
        mocks: { $t: msg => msg }
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
        localVue,
        store,
        propsData: {
          document: store.state.document.doc
        },
        mocks: { $t: msg => msg }
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
        localVue,
        store,
        propsData: {
          document: store.state.document.doc
        },
        mocks: { $t: msg => msg }
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
        localVue,
        store,
        propsData: {
          document: store.state.document.doc
        },
        mocks: { $t: msg => msg }
      })

      wrapper.vm.$set(wrapper.vm, 'localSearchTerm', { label: 'test.*', regex: true })
      await wrapper.vm.transformContent()

      expect(wrapper.vm.localSearchOccurrences).toEqual(1)
    })
  })

  describe('content text length warning', () => {
    it('should not show a warning', async () => {
      // Create a document with a small content text length
      const indexedDocument = new IndexedDocument(id, index)
      indexedDocument.withContent('this is a content')
      indexedDocument.setContentTextLength(20)

      // Save and get the document from Elasticsearch
      await letData(es).have(indexedDocument).commit()
      await store.dispatch('document/get', { id, index })

      // Build the wrapper with the created document
      const document = store.state.document.doc
      const mocks = { $t: msg => msg }
      const propsData = { document }
      const wrapper = shallowMount(DocumentContent, { localVue, store, propsData, mocks })

      expect(wrapper.findComponent(ContentTextLengthWarning).exists()).toBeFalsy()
    })

    it('should not show a warning', async () => {
      // Create a document with a big content text length
      const indexedDocument = new IndexedDocument(id, index)
      indexedDocument.withContent('this is a content')
      indexedDocument.setContentTextLength(2e4)

      // Save and get the document from Elasticsearch
      await letData(es).have(indexedDocument).commit()
      await store.dispatch('document/get', { id, index })

      // Build the wrapper with the created document
      const document = store.state.document.doc
      const mocks = { $t: msg => msg }
      const propsData = { document }
      const wrapper = shallowMount(DocumentContent, { localVue, store, propsData, mocks })

      expect(wrapper.findComponent(ContentTextLengthWarning).exists()).toBeTruthy()
    })
  })

  describe('document content lazy loading', () => {
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
      const mocks = { $t: msg => msg }
      const propsData = { document }
      const wrapper = shallowMount(DocumentContent, { localVue, store, propsData, mocks })

      expect(document.content).toBeFalsy()
      await wrapper.vm.loadContent()
      expect(document.content).toBe('this is a content')
    })

    it('should not load the document', async () => {
      // Create a document with a huge content text length
      const indexedDocument = new IndexedDocument(id, index)
      indexedDocument.withContent('this is a content')
      indexedDocument.setContentTextLength(2e4)

      // Save and get the document from Elasticsearch
      await letData(es).have(indexedDocument).commit()
      await store.dispatch('document/get', { id, index })

      // Build the wrapper with the created document
      const document = store.state.document.doc
      const mocks = { $t: msg => msg }
      const propsData = { document }
      const wrapper = shallowMount(DocumentContent, { localVue, store, propsData, mocks })

      expect(document.content).toBeFalsy()
      await wrapper.vm.loadContent()
      expect(document.content).toBeFalsy()
    })

    it('should load if the warning is ignored', async () => {
      // Create a document with a huge content text length
      const indexedDocument = new IndexedDocument(id, index)
      indexedDocument.withContent('this is a content')
      indexedDocument.setContentTextLength(2e4)

      // Save and get the document from Elasticsearch
      await letData(es).have(indexedDocument).commit()
      await store.dispatch('document/get', { id, index })

      // Build the wrapper with the created document
      const document = store.state.document.doc
      const mocks = { $t: msg => msg }
      const propsData = { document }
      const wrapper = shallowMount(DocumentContent, { localVue, store, propsData, mocks })

      expect(document.content).toBeFalsy()
      await store.commit('document/ignoreContentTextLengthWarning')
      await wrapper.vm.loadContent()
      expect(document.content).toBe('this is a content')
    })
  })
})
