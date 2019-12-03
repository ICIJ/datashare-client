import { App } from '@/main'
import SearchResultsTable from '@/components/SearchResultsTable'
import VueRouter from 'vue-router'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import { IndexedDocuments, letData } from 'tests/unit/es_utils'
import { createLocalVue, shallowMount, mount } from '@vue/test-utils'
import { datashare } from '@/store/modules/search'
import { jsonResp } from 'tests/unit/tests_utils'
import DatashareClient from '@/api/DatashareClient'

const { i18n, localVue, store } = App.init(createLocalVue()).useAll()
const router = new VueRouter()

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

  it('should display 2 action buttons', () => {
    wrapper.vm.selected = [{ id: 'doc_1' }, { id: 'doc_2' }]

    expect(wrapper.findAll('b-list-group-stub > b-list-group-item-stub')).toHaveLength(2)
  })

  it('should set each selected document as starred', async () => {
    jest.spyOn(datashare, 'fetch')
    datashare.fetch.mockReturnValue(jsonResp())
    wrapper = mount(SearchResultsTable, { localVue, store, i18n, router, mocks: { $t: msg => msg } })
    wrapper.vm.selected = [{ id: 'doc_1' }, { id: 'doc_2' }]

    wrapper.findAll('.list-group-item-action').at(0).trigger('click')

    const calledUrl = DatashareClient.getFullUrl(`/api/${encodeURIComponent(process.env.VUE_APP_ES_INDEX)}/documents/batchUpdate/star`)
    expect(datashare.fetch).toHaveBeenCalledTimes(1)
    expect(datashare.fetch).toBeCalledWith(calledUrl, { method: 'POST', body: JSON.stringify(['doc_1', 'doc_2']) })
  })
})
