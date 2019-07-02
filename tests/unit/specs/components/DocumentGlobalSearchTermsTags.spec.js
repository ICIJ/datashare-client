import DocumentGlobalSearchTermsTags from '@/components/DocumentGlobalSearchTermsTags'
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

const localVue = createLocalVue()
localVue.use(Murmur)
localVue.use(VueI18n)
localVue.use(BootstrapVue)
localVue.use(Vuex)
localVue.use(VueShortkey)

const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

describe('DocumentGlobalSearchTermsTags.vue', () => {
  esConnectionHelper()
  const es = esConnectionHelper.es

  beforeAll(() => store.commit('search/index', process.env.VUE_APP_ES_INDEX))

  afterEach(() => {
    store.commit('document/reset')
    store.commit('search/reset')
  })

  describe('lists the query terms but the ones about specific field other than "content"', () => {
    it('should display query terms with occurrences in decreasing order', async () => {
      const id = 'doc'
      await letData(es).have(new IndexedDocument(id).withContent('document result test document test test ')).commit()
      await store.dispatch('document/get', { id })
      store.commit('search/query', 'result test document')
      const wrapper = shallowMount(DocumentGlobalSearchTermsTags, {
        localVue,
        store,
        i18n,
        propsData: {
          document: store.state.document.doc
        }
      })

      expect(wrapper.findAll('.document-global-search-terms-tags__item')).toHaveLength(3)
      expect(wrapper.findAll('.document-global-search-terms-tags__item__label').at(0).text()).toEqual('test')
      expect(wrapper.findAll('.document-global-search-terms-tags__item__count').at(0).text()).toEqual('3')
      expect(wrapper.findAll('.document-global-search-terms-tags__item__label').at(1).text()).toEqual('document')
      expect(wrapper.findAll('.document-global-search-terms-tags__item__count').at(1).text()).toEqual('2')
      expect(wrapper.findAll('.document-global-search-terms-tags__item__label').at(2).text()).toEqual('result')
      expect(wrapper.findAll('.document-global-search-terms-tags__item__count').at(2).text()).toEqual('1')
    })

    it('should not display the query terms on a specific field but content', async () => {
      const id = 'doc'
      await letData(es).have(new IndexedDocument(id).withContent('term_01')).commit()
      await store.dispatch('document/get', { id })
      store.commit('search/query', 'content:term_01 field_name:term_02')
      const wrapper = shallowMount(DocumentGlobalSearchTermsTags, {
        localVue,
        store,
        i18n,
        propsData: {
          document: store.state.document.doc
        }
      })

      expect(wrapper.findAll('.document-global-search-terms-tags__item__label').at(0).text()).toEqual('term_01')
      expect(wrapper.findAll('.document-global-search-terms-tags__item__count').at(0).text()).toEqual('1')
    })

    it('should stroke the negative query terms', async () => {
      const id = 'doc'
      await letData(es).have(new IndexedDocument(id).withContent('term_01')).commit()
      await store.dispatch('document/get', { id })
      store.commit('search/query', '-term_02')
      const wrapper = shallowMount(DocumentGlobalSearchTermsTags, {
        localVue,
        store,
        i18n,
        propsData: {
          document: store.state.document.doc
        }
      })

      expect(wrapper.findAll('.document-global-search-terms-tags__item--negation')).toHaveLength(1)
    })

    it('should highlight the query terms with the same color than in the list', async () => {
      const id = 'doc'
      await letData(es).have(new IndexedDocument(id).withContent('this is a full full content')).commit()
      await store.dispatch('document/get', { id })
      store.commit('search/query', 'full content')

      const wrapper = shallowMount(DocumentGlobalSearchTermsTags, {
        localVue,
        store,
        i18n,
        propsData: {
          document: store.state.document.doc
        }
      })

      expect(wrapper.findAll('.document-global-search-terms-tags__item--index-0')).toHaveLength(1)
      expect(wrapper.find('.document-global-search-terms-tags__item--index-0 .document-global-search-terms-tags__item__label').text()).toBe('full')

      expect(wrapper.findAll('.document-global-search-terms-tags__item--index-1')).toHaveLength(1)
      expect(wrapper.find('.document-global-search-terms-tags__item--index-1 .document-global-search-terms-tags__item__label').text()).toBe('content')
    })
  })
})
