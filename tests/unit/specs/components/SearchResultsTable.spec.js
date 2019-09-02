import SearchResultsTable from '@/components/SearchResultsTable'
import store from '@/store'
import router from '@/router'
import VueI18n from 'vue-i18n'
import messages from '@/lang/en'
import BootstrapVue from 'bootstrap-vue'
import Murmur from '@icij/murmur'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import { IndexedDocuments, letData } from 'tests/unit/es_utils'
import { createLocalVue, shallowMount, mount } from '@vue/test-utils'
import { datashare } from '@/store/modules/search'
import { jsonOk } from 'tests/unit/tests_utils'
import DatashareClient from '@/api/DatashareClient'

window.matchMedia = jest.fn().mockImplementation(query => {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn()
  }
})

const localVue = createLocalVue()
localVue.use(VueI18n)
localVue.use(BootstrapVue)
localVue.use(Murmur)
const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

describe('SearchResultsTable.vue', () => {
  let wrapper
  esConnectionHelper()
  const es = esConnectionHelper.es

  beforeAll(() => store.commit('search/index', process.env.VUE_APP_ES_INDEX))

  beforeEach(async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('document').count(4)).commit()
    await store.dispatch('search/query', { query: '*', from: 0, size: 25 })
    wrapper = shallowMount(SearchResultsTable, { localVue, store, i18n })
  })

  afterAll(() => datashare.fetch.mockRestore())

  it('should display a b-table', () => {
    expect(wrapper.find('.search-results-table__items').exists()).toBeTruthy()
  })

  it('should display a multi selectable b-table', () => {
    expect(wrapper.find('.search-results-table__items').attributes('selectmode')).toEqual('multi')
  })

  it('should display 3 action buttons', () => {
    wrapper.vm.selected = [{ id: 'doc_1' }, { id: 'doc_2' }]

    expect(wrapper.findAll('b-list-group-stub > b-list-group-item-stub')).toHaveLength(3)
  })

  it('should set each selected document as starred', async () => {
    jest.spyOn(datashare, 'fetch')
    datashare.fetch.mockReturnValue(jsonOk())
    wrapper = mount(SearchResultsTable, { localVue, store, i18n, router })
    wrapper.vm.selected = [{ id: 'doc_1' }, { id: 'doc_2' }]

    wrapper.findAll('.list-group-item-action').at(0).trigger('click')

    expect(datashare.fetch).toHaveBeenCalledTimes(2)
    expect(datashare.fetch).toBeCalledWith(DatashareClient.getFullUrl(`/api/document/project/star/${encodeURIComponent(process.env.VUE_APP_ES_INDEX)}/${encodeURIComponent('doc_1')}`),
      { method: 'PUT' })
  })
})
