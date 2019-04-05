import SearchResultsAppliedFilters from '@/components/SearchResultsAppliedFilters'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { IndexedDocuments, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import store from '@/store'

const localVue = createLocalVue()

describe('SearchResultsAppliedFilters.vue', () => {
  esConnectionHelper()
  const es = esConnectionHelper.es
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(SearchResultsAppliedFilters, { localVue, store })
  })

  it('should display no applied filters', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('document').count(3)).commit()

    await store.dispatch('search/query', { query: '*', from: 0, size: 3 })

    expect(wrapper.findAll('.search-results__header__applied-filters search-results-applied-filter-stub')).toHaveLength(0)
  })

  it('should display 2 applied filters', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('document test').count(3)).commit()

    await store.dispatch('search/query', { query: 'document test', from: 0, size: 3 })

    expect(wrapper.findAll('.search-results__header__applied-filters search-results-applied-filter-stub')).toHaveLength(2)
  })

  it('should merge 2 identical terms', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('document test').count(3)).commit()

    await store.dispatch('search/query', { query: 'test test', from: 0, size: 3 })

    expect(wrapper.findAll('.search-results__header__applied-filters search-results-applied-filter-stub')).toHaveLength(1)
  })
})
