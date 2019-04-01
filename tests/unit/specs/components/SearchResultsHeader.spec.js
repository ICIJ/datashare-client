import SearchResultsHeader from '@/components/SearchResultsHeader'
import { IndexedDocument, IndexedDocuments, letData } from 'tests/unit/es_utils'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import VueI18n from 'vue-i18n'
import Murmur from '@icij/murmur'
import messages from '@/lang/en'
import store from '@/store'
import vBTooltip from 'bootstrap-vue/es/components/tooltip/tooltip'

const localVue = createLocalVue()
localVue.use(VueI18n)
localVue.use(Murmur)
localVue.directive('b-tooltip', vBTooltip)
const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

describe('SearchResultsHeader.vue', () => {
  esConnectionHelper()
  const es = esConnectionHelper.es
  let wrapper

  beforeAll(() => {
    store.commit('search/index', process.env.VUE_APP_ES_INDEX)
  })

  beforeEach(() => {
    wrapper = shallowMount(SearchResultsHeader, { localVue, i18n, store, propsData: { response: store.state.search.response } })
    store.commit('search/reset')
  })

  it('should display one document found', async () => {
    await letData(es).have(new IndexedDocument('doc.txt').withContent('bar')).commit()

    await store.dispatch('search/query', 'bar')
    wrapper.setProps({ response: store.state.search.response })

    expect(wrapper.find('.search-results__header__paging__progress__pagination').text()).toEqual('1 - 1')
    expect(wrapper.find('.search-results__header__paging__progress_number-of-results').text()).toEqual('on 1 document found')
  })

  it('should display 2 documents found', async () => {
    await letData(es).have(new IndexedDocument('doc_011.txt').withContent('bar')).commit()
    await letData(es).have(new IndexedDocument('doc_02.txt').withContent('bar')).commit()

    await store.dispatch('search/query', 'bar')
    wrapper.setProps({ response: store.state.search.response })

    expect(wrapper.find('.search-results__header__paging__progress__pagination').text()).toEqual('1 - 2')
    expect(wrapper.find('.search-results__header__paging__progress_number-of-results').text()).toEqual('on 2 documents found')
  })

  it('should not display the pagination (1/2)', async () => {
    await store.dispatch('search/query', '*')
    wrapper.setProps({ response: store.state.search.response })

    expect(wrapper.findAll('.search-results__header__paging__first-page')).toHaveLength(0)
    expect(wrapper.findAll('.search-results__header__paging__previous-page')).toHaveLength(0)
    expect(wrapper.findAll('.search-results__header__paging__next-page')).toHaveLength(0)
    expect(wrapper.findAll('.search-results__header__paging__last-page')).toHaveLength(0)
  })

  it('should not display the pagination (2/2)', async () => {
    await letData(es).have(new IndexedDocument('doc.txt').withContent('document')).commit()

    await store.dispatch('search/query', 'document')
    wrapper.setProps({ response: store.state.search.response })

    expect(wrapper.findAll('.search-results__header__paging__first-page')).toHaveLength(0)
    expect(wrapper.findAll('.search-results__header__paging__previous-page')).toHaveLength(0)
    expect(wrapper.findAll('.search-results__header__paging__next-page')).toHaveLength(0)
    expect(wrapper.findAll('.search-results__header__paging__last-page')).toHaveLength(0)
  })

  it('should display the pagination', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('document').count(4)).commit()

    await store.dispatch('search/query', { query: 'document', from: 0, size: 3 })
    wrapper.setProps({ response: store.state.search.response })

    expect(wrapper.findAll('.search-results__header__paging__first-page')).toHaveLength(1)
    expect(wrapper.findAll('.search-results__header__paging__previous-page')).toHaveLength(1)
    expect(wrapper.findAll('.search-results__header__paging__next-page')).toHaveLength(1)
    expect(wrapper.findAll('.search-results__header__paging__last-page')).toHaveLength(1)
    expect(wrapper.find('.search-results__header__paging__progress__pagination').text()).toEqual('1 - 3')
    expect(wrapper.find('.search-results__header__paging__progress_number-of-results').text()).toEqual('on 4 documents found')
  })

  it('should display the first and the previous page as unavailable', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('this is a document').count(4)).commit()

    await store.dispatch('search/query', { query: 'document', from: 0, size: 3 })
    wrapper.setProps({ response: store.state.search.response })

    expect(wrapper.findAll('.search-results__header__paging__first-page.disabled')).toHaveLength(1)
    expect(wrapper.findAll('.search-results__header__paging__previous-page.disabled')).toHaveLength(1)
    expect(wrapper.findAll('.search-results__header__paging__next-page.disabled')).toHaveLength(0)
    expect(wrapper.findAll('.search-results__header__paging__last-page.disabled')).toHaveLength(0)
  })

  it('should display the next and the last page as unavailable', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('this is a document').count(4)).commit()

    await store.dispatch('search/query', { query: 'document', from: 3, size: 3 })
    wrapper.setProps({ response: store.state.search.response })

    expect(wrapper.findAll('.search-results__header__paging__first-page.disabled')).toHaveLength(0)
    expect(wrapper.findAll('.search-results__header__paging__previous-page.disabled')).toHaveLength(0)
    expect(wrapper.findAll('.search-results__header__paging__next-page.disabled')).toHaveLength(1)
    expect(wrapper.findAll('.search-results__header__paging__last-page.disabled')).toHaveLength(1)
    expect(wrapper.find('.search-results__header__paging__progress__pagination').text()).toEqual('4 - 4')
    expect(wrapper.find('.search-results__header__paging__progress_number-of-results').text()).toEqual('on 4 documents found')
  })
})
