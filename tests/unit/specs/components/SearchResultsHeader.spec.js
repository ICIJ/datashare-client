import SearchResultsHeader from '@/components/SearchResultsHeader'
import { IndexedDocument, IndexedDocuments, letData } from 'tests/unit/es_utils'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import VueI18n from 'vue-i18n'
import Murmur from '@icij/murmur'
import messages from '@/lang/en'
import store from '@/store'
import router from '@/router'
import vBTooltip from 'bootstrap-vue/es/directives/tooltip/tooltip'
import { datashare } from '@/store/modules/search'
import { jsonOk } from 'tests/unit/tests_utils'

jest.mock('v-calendar/lib/v-calendar.min.css', () => {})

const localVue = createLocalVue()
localVue.use(VueI18n)
localVue.use(Murmur)
localVue.directive('b-tooltip', vBTooltip)
const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

describe('SearchResultsHeader.vue', () => {
  esConnectionHelper()
  const es = esConnectionHelper.es
  let wrapper

  beforeAll(() => store.commit('search/index', process.env.VUE_APP_ES_INDEX))

  beforeEach(() => {
    wrapper = shallowMount(SearchResultsHeader, { localVue, i18n, store, router })
    store.commit('search/reset')
    jest.spyOn(datashare, 'fetch')
    datashare.fetch.mockReturnValue(jsonOk())
  })

  afterAll(() => datashare.fetch.mockRestore())

  describe('progress', () => {
    it('should display one document', async () => {
      await letData(es).have(new IndexedDocument('doc.txt').withContent('bar')).commit()

      await store.dispatch('search/query', 'bar')
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.search-results-header__paging__progress__pagination').text()).toEqual('1 – 1')
      expect(wrapper.find('.search-results-header__paging__progress_number-of-results').text()).toEqual('on 1 document')
    })

    it('should display 2 documents', async () => {
      await letData(es).have(new IndexedDocument('doc_011.txt').withContent('bar')).commit()
      await letData(es).have(new IndexedDocument('doc_02.txt').withContent('bar')).commit()

      await store.dispatch('search/query', 'bar')
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.search-results-header__paging__progress__pagination').text()).toEqual('1 – 2')
      expect(wrapper.find('.search-results-header__paging__progress_number-of-results').text()).toEqual('on 2 documents')
    })
  })

  it('should display an applied filters component on top position', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('document').count(3)).commit()

    await store.dispatch('search/query', { query: '*', from: 0, size: 3 })
    wrapper.setProps({ position: 'top' })

    expect(wrapper.findAll('search-results-applied-filters-stub')).toHaveLength(1)
  })

  it('should not display an applied filters component on bottom position', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('document').count(3)).commit()

    await store.dispatch('search/query', { query: '*', from: 0, size: 3 })
    wrapper.setProps({ position: 'bottom' })

    expect(wrapper.findAll('search-results-applied-filters-stub')).toHaveLength(0)
  })
})
