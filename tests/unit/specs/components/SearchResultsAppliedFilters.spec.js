import SearchResultsAppliedFilters from '@/components/SearchResultsAppliedFilters'
import VueI18n from 'vue-i18n'
import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import BBadge from 'bootstrap-vue/es/components/badge/badge'
import store from '@/store'
import router from '@/router'
import messages from '@/lang/en'
import Murmur from '@icij/murmur'

const localVue = createLocalVue()
localVue.use(VueI18n)
localVue.use(Murmur)
localVue.component('b-badge', BBadge)
const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

describe('SearchResultsAppliedFilters.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(SearchResultsAppliedFilters, { localVue, i18n, store })
  })

  afterEach(async () => {
    await store.dispatch('search/reset')
  })

  describe('displays applied filters', () => {
    it('should display 2 applied filters', async () => {
      await store.dispatch('search/query', { query: 'document test', from: 0, size: 3 })

      expect(wrapper.findAll('.search-results__header__applied-filters search-results-applied-filter-stub')).toHaveLength(2)
    })

    it('should display 1 applied filter', async () => {
      await store.dispatch('search/addFacetValue', { name: 'content-type', value: 'text/plain' })

      expect(wrapper.findAll('.search-results__header__applied-filters search-results-applied-filter-stub')).toHaveLength(1)
    })

    it('should display the label of a facet', async () => {
      await store.dispatch('search/addFacetValue', { name: 'content-type', value: 'text/plain' })
      wrapper = mount(SearchResultsAppliedFilters, { localVue, i18n, store, router })

      expect(wrapper.findAll('.search-results__header__applied-filters .search-results__header__applied-filters__filter')).toHaveLength(1)
      expect(wrapper.findAll('.search-results__header__applied-filters .search-results__header__applied-filters__filter').at(0).text()).toBe('Plain text document')
    })

    it('should display the label of a facet date', async () => {
      await store.dispatch('search/addFacetValue', { name: 'indexing-date', value: '1556668800000' })
      wrapper = mount(SearchResultsAppliedFilters, { localVue, i18n, store, router })

      expect(wrapper.findAll('.search-results__header__applied-filters .search-results__header__applied-filters__filter')).toHaveLength(1)
      expect(wrapper.findAll('.search-results__header__applied-filters .search-results__header__applied-filters__filter').at(0).text()).toBe('2019-05')
    })
  })

  describe('deletes applied filters', () => {
    it('should remove the "AND" on last applied filter deletion', async () => {
      wrapper = mount(SearchResultsAppliedFilters, { localVue, i18n, store, router })

      await store.dispatch('search/query', { query: 'term_01 AND term_02', from: 0, size: 3 })
      wrapper.findAll('.search-results__header__applied-filters .search-results__header__applied-filters__filter').at(1).trigger('click')
      expect(store.state.search.query).toBe('term_01')
    })

    it('should remove the "OR" on last applied filter deletion', async () => {
      wrapper = mount(SearchResultsAppliedFilters, { localVue, i18n, store, router })

      await store.dispatch('search/query', { query: 'term_01 OR term_02', from: 0, size: 3 })
      wrapper.findAll('.search-results__header__applied-filters .search-results__header__applied-filters__filter').at(1).trigger('click')
      expect(store.state.search.query).toBe('term_01')
    })
  })
})
