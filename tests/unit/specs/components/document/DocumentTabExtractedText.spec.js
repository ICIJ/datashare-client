import DocumentTabExtractedText from '@/components/document/DocumentTabExtractedText'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import Murmur from '@icij/murmur'
import store from '@/store'
import VueI18n from 'vue-i18n'
import BootstrapVue from 'bootstrap-vue'
import messages from '@/lang/en'
import VueShortkey from 'vue-shortkey'
import VueSanitize from 'vue-sanitize'
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
localVue.use(VueSanitize)
localVue.directive('shortkey', VueShortkey)
const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

window.HTMLElement.prototype.scrollIntoView = jest.fn()

describe('DocumentTabExtractedText.vue', () => {
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
        .withNer('ner_01', 2, 'person')
        .withNer('ner_02', 17, 'location'))
        .commit()
      await store.dispatch('document/get', { id }).then(() => store.dispatch('document/getNamedEntities'))
      const wrapper = shallowMount(DocumentTabExtractedText, {
        localVue,
        store,
        i18n,
        propsData: {
          document: store.state.document.doc,
          namedEntities: store.state.document.namedEntities
        }
      })

      await wrapper.vm.$nextTick()

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
      await store.dispatch('document/get', { id }).then(() => store.dispatch('document/getNamedEntities'))
      const wrapper = shallowMount(DocumentTabExtractedText, {
        localVue,
        store,
        i18n,
        propsData: {
          document: store.state.document.doc,
          namedEntities: store.state.document.namedEntities
        }
      })

      await wrapper.vm.$nextTick()

      expect(wrapper.find('.document__extracted-text__content').html()).toEqual('<div class="document__extracted-text__content p-3">this is a content with some images and links</div>')
    })
  })

  describe('the "Show named entities" toggle', () => {
    it('should contain a "Show named entities" toggle', async () => {
      const id = 'doc'
      await letData(es).have(new IndexedDocument(id)
        .withContent('content')
        .withNer('ner', 2))
        .commit()
      await store.dispatch('document/get', { id }).then(() => store.dispatch('document/getNamedEntities'))
      const wrapper = shallowMount(DocumentTabExtractedText, {
        localVue,
        store,
        i18n,
        propsData: {
          document: store.state.document.doc,
          namedEntities: store.state.document.namedEntities
        }
      })

      expect(wrapper.findAll('.document__extracted-text__header__see-highlights')).toHaveLength(1)
    })

    it('should not contain a "Show named entities" toggle if there is no named entities', async () => {
      const id = 'doc'
      await letData(es).have(new IndexedDocument(id)
        .withContent('content'))
        .commit()
      await store.dispatch('document/get', { id })
      const wrapper = shallowMount(DocumentTabExtractedText, {
        localVue,
        store,
        i18n,
        propsData: {
          document: store.state.document.doc,
          namedEntities: store.state.document.namedEntities
        }
      })

      expect(wrapper.findAll('.document__extracted-text__header__see-highlights')).toHaveLength(0)
    })

    it('should change the document state of showNamedEntities', async () => {
      const id = 'doc'
      await letData(es).have(new IndexedDocument(id)
        .withContent('content')
        .withNer('ner', 2))
        .commit()
      await store.dispatch('document/get', { id }).then(() => store.dispatch('document/getNamedEntities'))
      const wrapper = shallowMount(DocumentTabExtractedText, {
        localVue,
        store,
        i18n,
        propsData: {
          document: store.state.document.doc,
          namedEntities: store.state.document.namedEntities
        }
      })

      expect(wrapper.vm.showNamedEntities).toBeTruthy()

      wrapper.findAll('.document__extracted-text__header__see-highlights label').at(0).trigger('click')

      expect(wrapper.vm.showNamedEntities).toBeFalsy()
    })

    it('should display a document without named entities', async () => {
      const id = 'doc'
      await letData(es).have(new IndexedDocument(id)
        .withContent('content')
        .withNer('ner', 2))
        .commit()
      await store.dispatch('document/get', { id }).then(() => store.dispatch('document/getNamedEntities'))
      store.commit('document/toggleShowNamedEntities')
      const wrapper = shallowMount(DocumentTabExtractedText, {
        localVue,
        store,
        i18n,
        propsData: {
          document: store.state.document.doc,
          namedEntities: store.state.document.namedEntities
        }
      })

      expect(wrapper.findAll('mark')).toHaveLength(0)
    })
  })

  describe('lists the query terms but the ones about specific field other than "content"', () => {
    it('should display query terms with occurrences in decreasing order', async () => {
      const id = 'doc'
      await letData(es).have(new IndexedDocument(id)
        .withContent('document result test document test test '))
        .commit()
      await store.dispatch('document/get', { id })
      store.commit('search/query', 'result test document')
      const wrapper = shallowMount(DocumentTabExtractedText, {
        localVue,
        store,
        i18n,
        propsData: {
          document: store.state.document.doc,
          namedEntities: store.state.document.namedEntities
        }
      })

      expect(wrapper.findAll('.document__extracted-text__header__terms__item')).toHaveLength(3)
      expect(wrapper.findAll('.document__extracted-text__header__terms__item__label').at(0).text()).toEqual('test')
      expect(wrapper.findAll('.document__extracted-text__header__terms__item__count').at(0).text()).toEqual('3')
      expect(wrapper.findAll('.document__extracted-text__header__terms__item__label').at(1).text()).toEqual('document')
      expect(wrapper.findAll('.document__extracted-text__header__terms__item__count').at(1).text()).toEqual('2')
      expect(wrapper.findAll('.document__extracted-text__header__terms__item__label').at(2).text()).toEqual('result')
      expect(wrapper.findAll('.document__extracted-text__header__terms__item__count').at(2).text()).toEqual('1')
    })

    it('should not display the query terms on a specific field but content', async () => {
      const id = 'doc'
      await letData(es).have(new IndexedDocument(id)
        .withContent('term_01'))
        .commit()
      await store.dispatch('document/get', { id })
      store.commit('search/query', 'content:term_01 field_name:term_02')
      const wrapper = shallowMount(DocumentTabExtractedText, {
        localVue,
        store,
        i18n,
        propsData: {
          document: store.state.document.doc,
          namedEntities: store.state.document.namedEntities
        }
      })

      expect(wrapper.findAll('ul')).toHaveLength(1)
      expect(wrapper.findAll('ul li')).toHaveLength(1)
      expect(wrapper.findAll('.document__extracted-text__header__terms__item__label').at(0).text()).toEqual('term_01')
      expect(wrapper.findAll('.document__extracted-text__header__terms__item__count').at(0).text()).toEqual('1')
    })

    it('should stroke the negative query terms', async () => {
      const id = 'doc'
      await letData(es).have(new IndexedDocument(id)
        .withContent('term_01'))
        .commit()
      await store.dispatch('document/get', { id })
      store.commit('search/query', '-term_02')
      const wrapper = shallowMount(DocumentTabExtractedText, {
        localVue,
        store,
        i18n,
        propsData: {
          document: store.state.document.doc,
          namedEntities: store.state.document.namedEntities
        }
      })

      expect(wrapper.findAll('ul')).toHaveLength(1)
      expect(wrapper.findAll('ul li')).toHaveLength(1)
      expect(wrapper.findAll('.document__extracted-text__header__terms__item--negation')).toHaveLength(1)
    })

    it('should highlight the query terms with the same color than in the list', async () => {
      const id = 'doc'
      await letData(es).have(new IndexedDocument(id)
        .withContent('this is a full full content'))
        .commit()
      await store.dispatch('document/get', { id })
      store.commit('search/query', 'full content')
      const wrapper = shallowMount(DocumentTabExtractedText, {
        localVue,
        store,
        i18n,
        propsData: {
          document: store.state.document.doc,
          namedEntities: store.state.document.namedEntities
        }
      })

      expect(wrapper.findAll('.document__extracted-text__header__terms__item--index-0')).toHaveLength(1)
      expect(wrapper.find('.document__extracted-text__header__terms__item--index-0 .document__extracted-text__header__terms__item__label').text()).toBe('full')

      expect(wrapper.findAll('.document__extracted-text__header__terms__item--index-1')).toHaveLength(1)
      expect(wrapper.find('.document__extracted-text__header__terms__item--index-1 .document__extracted-text__header__terms__item__label').text()).toBe('content')
    })
  })

  describe('search term', () => {
    it('should hide the search term form by default', async () => {
      const id = 'doc'
      await letData(es).have(new IndexedDocument(id)
        .withContent('this is a full full content')
        .withNer('ner', 0))
        .commit()
      await store.dispatch('document/get', { id }).then(() => store.dispatch('document/getNamedEntities'))
      const wrapper = shallowMount(DocumentTabExtractedText, {
        localVue,
        store,
        i18n,
        propsData: {
          document: store.state.document.doc,
          namedEntities: store.state.document.namedEntities
        }
      })

      expect(wrapper.find('.document__extracted-text__search--visible').exists()).toBeFalsy()
    })

    it('should highlight the first occurrence of the searched term', async () => {
      const id = 'doc'
      await letData(es).have(new IndexedDocument(id)
        .withContent('this is a full full content'))
        .commit()
      await store.dispatch('document/get', { id })
      const wrapper = shallowMount(DocumentTabExtractedText, {
        localVue,
        store,
        i18n,
        propsData: {
          document: store.state.document.doc,
          namedEntities: store.state.document.namedEntities
        }
      })

      wrapper.vm.$set(wrapper.vm, 'searchTerm', 'full')
      wrapper.vm.startSearch()

      expect(wrapper.vm.content).toEqual('this is a <mark class="query-term yellow-search">full</mark> full content')
    })

    it('should be case insensitive', async () => {
      const id = 'doc'
      await letData(es).have(new IndexedDocument(id)
        .withContent('this is a full FulL content fuLL'))
        .commit()
      await store.dispatch('document/get', { id })
      const wrapper = shallowMount(DocumentTabExtractedText, {
        localVue,
        store,
        i18n,
        propsData: {
          document: store.state.document.doc,
          namedEntities: store.state.document.namedEntities
        }
      })

      wrapper.vm.$set(wrapper.vm, 'searchTerm', 'full')
      wrapper.vm.startSearch()

      expect(wrapper.vm.searchOccurrences).toEqual(3)
    })

    it('should find the previous and next occurrence, as a loop', async () => {
      const id = 'doc'
      await letData(es).have(new IndexedDocument(id)
        .withContent('this is a full full content'))
        .commit()
      await store.dispatch('document/get', { id })
      const wrapper = shallowMount(DocumentTabExtractedText, {
        localVue,
        store,
        i18n,
        propsData: {
          document: store.state.document.doc,
          namedEntities: store.state.document.namedEntities
        }
      })

      wrapper.vm.$set(wrapper.vm, 'searchTerm', 'full')
      wrapper.vm.startSearch()

      expect(wrapper.vm.searchIndex).toEqual(1)
      expect(wrapper.vm.content).toEqual('this is a <mark class="query-term yellow-search">full</mark> full content')

      wrapper.vm.findNextOccurrence()

      expect(wrapper.vm.searchIndex).toEqual(2)
      expect(wrapper.vm.content).toEqual('this is a full <mark class="query-term yellow-search">full</mark> content')

      wrapper.vm.findNextOccurrence()

      expect(wrapper.vm.searchIndex).toEqual(1)
      expect(wrapper.vm.content).toEqual('this is a <mark class="query-term yellow-search">full</mark> full content')

      wrapper.vm.findPreviousOccurrence()

      expect(wrapper.vm.searchIndex).toEqual(2)
      expect(wrapper.vm.content).toEqual('this is a full <mark class="query-term yellow-search">full</mark> content')
    })

    it('should return shortkeys for mac', async () => {
      getOS.mockImplementation(() => 'mac')
      const id = 'doc'
      await letData(es).have(new IndexedDocument(id)
        .withContent('content'))
        .commit()
      await store.dispatch('document/get', { id }).then(() => store.dispatch('document/getNamedEntities'))
      const wrapper = shallowMount(DocumentTabExtractedText, {
        localVue,
        store,
        i18n,
        propsData: {
          document: store.state.document.doc,
          namedEntities: []
        }
      })

      expect(wrapper.vm.getShortkey().showSearchBar).toEqual(['meta', 'f'])
    })

    it('should return shortkeys for other OS', async () => {
      const id = 'doc'
      await letData(es).have(new IndexedDocument(id)
        .withContent('content'))
        .commit()
      await store.dispatch('document/get', { id }).then(() => store.dispatch('document/getNamedEntities'))
      const wrapper = shallowMount(DocumentTabExtractedText, {
        localVue,
        store,
        i18n,
        propsData: {
          document: store.state.document.doc,
          namedEntities: []
        }
      })

      expect(wrapper.vm.getShortkey().showSearchBar).toEqual(['ctrl', 'f'])
    })
  })
})
