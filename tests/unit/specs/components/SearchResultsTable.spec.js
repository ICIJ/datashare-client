import toLower from 'lodash/toLower'
import { createLocalVue, shallowMount, mount } from '@vue/test-utils'
import VueRouter from 'vue-router'

import { App } from '@/main'
import { datashare } from '@/store/modules/search'
import Api from '@/api'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import { IndexedDocuments, letData } from 'tests/unit/es_utils'
import { jsonResp } from 'tests/unit/tests_utils'
import SearchResultsTable from '@/components/SearchResultsTable'

const { localVue, store } = App.init(createLocalVue()).useAll()
const router = new VueRouter()

describe('SearchResultsTable.vue', () => {
  const index = toLower('SearchResultsTable')
  esConnectionHelper(index)
  const es = esConnectionHelper.es
  let wrapper

  beforeAll(() => store.commit('search/index', index))

  beforeEach(async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('document').withIndex(index).count(4)).commit()
    await store.dispatch('search/query', { query: '*', from: 0, size: 25 })
    wrapper = shallowMount(SearchResultsTable, { localVue, store, mocks: { $t: msg => msg } })
  })

  afterAll(() => datashare.fetch.mockRestore())

  it('should display a b-table', () => {
    expect(wrapper.find('.search-results-table__items').exists()).toBeTruthy()
  })

  it('should display a multi selectable b-table', () => {
    expect(wrapper.find('.search-results-table__items').attributes('selectmode')).toBe('multi')
  })

  it('should display 2 action buttons', () => {
    wrapper.vm.selected = [{ id: 'document_01' }, { id: 'document_02' }]

    expect(wrapper.findAll('b-list-group-stub > b-list-group-item-stub')).toHaveLength(2)
  })

  it('should set each selected document as starred', () => {
    jest.spyOn(datashare, 'fetch')
    datashare.fetch.mockReturnValue(jsonResp())
    wrapper = mount(SearchResultsTable, { localVue, store, router, mocks: { $t: msg => msg, $n: msg => msg, $tc: msg => msg } })
    wrapper.vm.selected = [{ id: 'document_01' }, { id: 'document_02' }]

    wrapper.findAll('.list-group-item-action').at(0).trigger('click')

    expect(datashare.fetch).toBeCalledTimes(1)
    expect(datashare.fetch).toBeCalledWith(Api.getFullUrl(`/api/${index}/documents/batchUpdate/star`),
      { method: 'POST', body: JSON.stringify(['document_01', 'document_02']) })
  })
})
