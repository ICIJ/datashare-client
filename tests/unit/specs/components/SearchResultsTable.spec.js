import SearchResultsTable from '@/components/SearchResultsTable'
import { TablePlugin } from 'bootstrap-vue'
import store from '@/store'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import { IndexedDocuments, letData } from 'tests/unit/es_utils'
import { createLocalVue, shallowMount } from '@vue/test-utils'

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
localVue.use(TablePlugin)

describe('SearchResultsList.vue', () => {
  let wrapper
  esConnectionHelper()
  const es = esConnectionHelper.es

  it('should display a b-table', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('document').count(4)).commit()
    await store.dispatch('search/query', { query: '*', from: 0, size: 25 })
    wrapper = shallowMount(SearchResultsTable, { localVue, store })

    expect(wrapper.find('.search-results-table__items').exists()).toBeTruthy()
  })

  it('should display a multi selectable b-table', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('document').count(4)).commit()
    await store.dispatch('search/query', { query: '*', from: 0, size: 25 })
    wrapper = shallowMount(SearchResultsTable, { localVue, store })

    expect(wrapper.find('.search-results-table__items').attributes('selectmode')).toEqual('multi')
  })
})
