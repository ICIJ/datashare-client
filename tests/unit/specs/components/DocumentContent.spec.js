import DocumentContent from '@/components/DocumentContent'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import Murmur from '@icij/murmur'
import store from '@/store'
import VueI18n from 'vue-i18n'
import Vuex from 'vuex'
import BootstrapVue from 'bootstrap-vue'
import messages from '@/lang/en'
import VueShortkey from 'vue-shortkey'
import { getOS } from '@/utils/utils'

jest.mock('@/utils/utils', () => {
  return {
    getOS: jest.fn()
  }
})

const localVue = createLocalVue()
localVue.use(Murmur)
localVue.use(VueI18n)
localVue.use(BootstrapVue)
localVue.use(Vuex)
localVue.use(VueShortkey)

const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

window.HTMLElement.prototype.scrollIntoView = jest.fn()

describe('DocumentContent.vue', () => {
  esConnectionHelper()
  const es = esConnectionHelper.es

  beforeAll(() => store.commit('search/index', process.env.VUE_APP_ES_INDEX))

  beforeEach(() => getOS.mockReset())

  afterEach(() => {
    store.commit('document/reset')
    store.commit('search/reset')
  })

  describe('the extracted text content', () => {
    it('should mark named entities in the extracted text tab', async () => {
      const id = 'doc'
      await letData(es).have(new IndexedDocument(id)
        .withContent('content')
        .withNer('ner_01', 2, 'PERSON')
        .withNer('ner_02', 17, 'LOCATION'))
        .commit()
      await store.dispatch('document/get', { id })
      await store.dispatch('document/getFirstPageForNamedEntityInAllCategories')
      await store.commit('document/toggleShowNamedEntities', true)
      const wrapper = shallowMount(DocumentContent, {
        localVue,
        store,
        i18n,
        propsData: {
          document: store.state.document.doc
        }
      })

      await wrapper.vm.transformContent()

      expect(wrapper.findAll('mark')).toHaveLength(2)
      expect(wrapper.findAll('mark').at(0).text()).toEqual('ner_01')
      expect(wrapper.findAll('mark').at(0).classes()).toContain('ner--category-person')
      expect(wrapper.findAll('mark').at(1).text()).toEqual('ner_02')
      expect(wrapper.findAll('mark').at(1).classes()).toContain('ner--category-location')
    })

    it('should sanitize the HTML in the extracted text', async () => {
      const id = 'doc'
      await letData(es).have(new IndexedDocument(id)
        .withContent('this is a <span>content</span> with some <img src="this.is.a.source" alt="alt" title="title" />images and <a href="this.is.an.href" target="_blank">links</a>'))
        .commit()
      await store.dispatch('document/get', { id })
      await store.dispatch('document/getFirstPageForNamedEntityInAllCategories')
      await store.commit('document/toggleShowNamedEntities', true)
      const wrapper = shallowMount(DocumentContent, {
        localVue,
        store,
        i18n,
        propsData: {
          document: store.state.document.doc
        }
      })

      await wrapper.vm.transformContent()
      expect(wrapper.find('.document-content__body p').html()).toEqual('<p>this is a content with some images and links</p>')
    })

    it('should not sanitize the <mark /> tags in the extracted text', async () => {
      const id = 'doc'
      await letData(es).have(new IndexedDocument(id)
        .withContent('this is a <mark>document</mark>'))
        .commit()
      await store.dispatch('document/get', { id })
      await store.dispatch('document/getFirstPageForNamedEntityInAllCategories')
      await store.commit('document/toggleShowNamedEntities', true)
      const wrapper = shallowMount(DocumentContent, {
        localVue,
        store,
        i18n,
        propsData: {
          document: store.state.document.doc
        }
      })

      await wrapper.vm.transformContent()
      expect(wrapper.find('.document-content__body p').html()).toEqual('<p>this is a <mark>document</mark></p>')
    })
  })

  describe('the "Show named entities" toggle', () => {
    it('should contain a "Show named entities" toggle', async () => {
      const id = 'document-yy'
      await letData(es).have(new IndexedDocument(id)
        .withContent('content')
        .withNer('ner', 2, 'PERSON'))
        .commit()
      await store.dispatch('document/get', { id })
      await store.dispatch('document/getFirstPageForNamedEntityInAllCategories')
      const wrapper = shallowMount(DocumentContent, {
        localVue,
        store,
        i18n,
        propsData: {
          document: store.state.document.doc
        }
      })

      expect(wrapper.exists('.document-content__ner-toggler')).toBeTruthy()
    })

    it('should not contain a "Show named entities" toggle if there is no named entities', async () => {
      const id = 'doc'
      await letData(es).have(new IndexedDocument(id)
        .withContent('content'))
        .commit()
      await store.dispatch('document/get', { id })
      const wrapper = shallowMount(DocumentContent, {
        localVue,
        store,
        i18n,
        propsData: {
          document: store.state.document.doc
        }
      })

      await wrapper.vm.transformContent()
      expect(wrapper.exists('.document-content__ner-toggler')).toBeTruthy()
    })

    it('should change the document state of showNamedEntities', async () => {
      const id = 'document-zu'
      await letData(es).have(new IndexedDocument(id)
        .withContent('content')
        .withNer('ner', 2, 'PERSON'))
        .commit()
      await store.dispatch('document/get', { id })
      await store.dispatch('document/getFirstPageForNamedEntityInCategory', 'PERSON')
      store.commit('document/toggleShowNamedEntities', true)
      const wrapper = shallowMount(DocumentContent, {
        localVue,
        store,
        i18n,
        propsData: {
          document: store.state.document.doc
        }
      })

      expect(store.state.document.showNamedEntities).toBeTruthy()
      wrapper.find('.document-content__ner-toggler label').trigger('click')
      expect(store.state.document.showNamedEntities).toBeFalsy()
    })

    it('should display a document without named entities', async () => {
      const id = 'document-ry'
      await letData(es).have(new IndexedDocument(id)
        .withContent('content')
        .withNer('tent', 3, 'PERSON'))
        .commit()
      await store.dispatch('document/get', { id })
      console.log('okj')
      await store.dispatch('document/getFirstPageForNamedEntityInAllCategories')
      store.commit('document/toggleShowNamedEntities', false)
      const wrapper = shallowMount(DocumentContent, {
        localVue,
        store,
        i18n,
        propsData: {
          document: store.state.document.doc
        }
      })

      await wrapper.vm.$nextTick()
      expect(wrapper.findAll('mark')).toHaveLength(0)
    })
  })

  describe('search term', () => {
    it('should not sticky the toolbox by default', async () => {
      const id = 'document-z'
      await letData(es).have(new IndexedDocument(id)
        .withContent('this is a full full content')
        .withNer('ner', 0))
        .commit()
      await store.dispatch('document/get', { id })
      await store.dispatch('document/getFirstPageForNamedEntityInAllCategories')
      await store.commit('document/toggleShowNamedEntities', true)
      const wrapper = shallowMount(DocumentContent, {
        localVue,
        store,
        i18n,
        propsData: {
          document: store.state.document.doc
        }
      })

      await wrapper.vm.$nextTick()
      expect(wrapper.find('.document-content__toolbox--sticky').exists()).toBeFalsy()
    })

    it('should highlight the first occurrence of the searched term', async () => {
      const id = 'doc'
      await letData(es).have(new IndexedDocument(id)
        .withContent('this is a full full content'))
        .commit()
      await store.dispatch('document/get', { id })
      const wrapper = shallowMount(DocumentContent, {
        localVue,
        store,
        i18n,
        propsData: {
          document: store.state.document.doc
        }
      })

      wrapper.vm.$set(wrapper.vm, 'localSearchTerm', 'full')
      await wrapper.vm.transformContent()

      expect(wrapper.find('.document-content__body').element.innerHTML).toEqual('<p>this is a <mark class="local-search-term">full</mark> <mark class="local-search-term">full</mark> content</p>')
    })

    it('should be case insensitive', async () => {
      const id = 'doc'
      await letData(es).have(new IndexedDocument(id)
        .withContent('this is a full FulL content fuLL'))
        .commit()
      await store.dispatch('document/get', { id })
      const wrapper = shallowMount(DocumentContent, {
        localVue,
        store,
        i18n,
        propsData: {
          document: store.state.document.doc
        }
      })

      wrapper.vm.$set(wrapper.vm, 'localSearchTerm', 'full')
      await wrapper.vm.transformContent()

      expect(wrapper.vm.localSearchOccurrences).toEqual(3)
    })

    it('should find the previous and next occurrence, as a loop', async () => {
      const id = 'doc'
      await letData(es).have(new IndexedDocument(id)
        .withContent('this is a full full content'))
        .commit()
      await store.dispatch('document/get', { id })
      const wrapper = shallowMount(DocumentContent, {
        localVue,
        store,
        i18n,
        propsData: {
          document: store.state.document.doc
        }
      })

      wrapper.vm.$set(wrapper.vm, 'localSearchTerm', 'full')
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
  })
})
