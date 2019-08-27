import SearchResultsAppliedFilters from '@/components/SearchResultsAppliedFilters'
import VueI18n from 'vue-i18n'
import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import BBadge from 'bootstrap-vue/es/components/badge/badge'
import store from '@/store'
import router from '@/router'
import messages from '@/lang/en'
import Murmur from '@icij/murmur'
import { datashare } from '@/store/modules/search'
import { jsonOk } from 'tests/unit/tests_utils'

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
localVue.use(Murmur)
localVue.component('b-badge', BBadge)
const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

describe('SearchResultsAppliedFilters.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(SearchResultsAppliedFilters, { localVue, i18n, store })
    jest.spyOn(datashare, 'fetch')
    datashare.fetch.mockReturnValue(jsonOk())
  })

  afterEach(async () => store.dispatch('search/reset'))

  afterAll(() => datashare.fetch.mockRestore())

  describe('displays applied filters', () => {
    it('should display 2 applied filters', async () => {
      await store.dispatch('search/query', { query: 'document test', from: 0, size: 3 })

      expect(wrapper.findAll('.search-results-header__applied-filters search-results-applied-filter-stub')).toHaveLength(2)
    })

    it('should display 1 applied filter', () => {
      store.commit('search/addFacetValue', { name: 'content-type', value: 'term_01' })

      expect(wrapper.findAll('.search-results-header__applied-filters search-results-applied-filter-stub')).toHaveLength(1)
    })

    it('should translate the label of a facet', () => {
      store.commit('search/addFacetValue', { name: 'content-type', value: 'text/plain' })

      expect(wrapper.vm.filters[0].label).toEqual('Plain text document')
    })

    it('should translate the label of a facet date', () => {
      store.commit('search/addFacetValue', { name: 'indexing-date', value: 1556668800000 })

      expect(wrapper.vm.filters[0].label).toEqual('2019-05')
    })

    it('should translate the label of a facet yes no', () => {
      store.commit('search/addFacetValue', { name: 'starred', value: true })

      expect(wrapper.vm.filters[0].label).toEqual('Starred')
    })

    it('should set facet as positive applied facet', () => {
      store.commit('search/addFacetValue', { name: 'content-type', value: 'term_01' })

      expect(wrapper.vm.filters[0].negation).toBeFalsy()
    })

    it('should set excluded facet as negative applied facet', () => {
      store.commit('search/addFacetValue', { name: 'content-type', value: 'term_01' })
      store.commit('search/toggleFacet', 'content-type')

      expect(wrapper.vm.filters[0].negation).toBeTruthy()
    })
  })

  describe('deletes applied filters', () => {
    beforeEach(() => {
      wrapper = mount(SearchResultsAppliedFilters, { localVue, i18n, store, router })
    })

    it('should remove the "AND" on last applied filter deletion', async () => {
      await store.dispatch('search/query', { query: 'term_01 AND term_02', from: 0, size: 3 })
      wrapper.findAll('.search-results-header__applied-filters .search-results-header__applied-filters__filter').at(1).trigger('click')

      expect(store.state.search.query).toBe('term_01')
    })

    it('should remove the "OR" on last applied filter deletion', async () => {
      await store.dispatch('search/query', { query: 'term_01 OR term_02', from: 0, size: 3 })
      wrapper.findAll('.search-results-header__applied-filters .search-results-header__applied-filters__filter').at(1).trigger('click')

      expect(store.state.search.query).toBe('term_01')
    })
  })
})
