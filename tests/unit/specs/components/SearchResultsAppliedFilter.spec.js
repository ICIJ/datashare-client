import SearchResultsAppliedFilter from '@/components/SearchResultsAppliedFilter'
import { mount, shallowMount } from '@vue/test-utils'
import store from '@/store'
import router from '@/router'
import { createApp } from '@/main'
import fetchPonyfill from 'fetch-ponyfill'
import { datashare } from '@/store/modules/search'
import { jsonOk } from 'tests/unit/tests_utils'
import find from 'lodash/find'

const { fetch } = fetchPonyfill()
window.fetch = fetch

describe('SearchResultsAppliedFilter.vue', () => {
  let wrapper, appVue

  beforeAll(async () => {
    const app = document.createElement('div')
    app.setAttribute('id', 'app')
    document.body.appendChild(app)
    window.fetch = jest.fn()
    window.fetch.mockReturnValue(jsonOk({ userProjects: [] }))
    appVue = await createApp()
  })

  beforeEach(() => {
    wrapper = shallowMount(SearchResultsAppliedFilter, { appVue, store, router, propsData: { filter: { label: 'term_01', value: 'term_01', field: '', negation: false } } })
    jest.spyOn(datashare, 'fetch')
    datashare.fetch.mockReturnValue(jsonOk())
  })

  afterAll(() => {
    window.fetch.mockRestore()
    datashare.fetch.mockRestore()
  })

  describe('displays applied filter', () => {
    it('should display a filter', () => {
      expect(wrapper.findAll('.search-results-header__applied-filters__filter')).toHaveLength(1)
      expect(wrapper.find('.search-results-header__applied-filters__filter').text()).toEqual('term_01')
      expect(wrapper.findAll('.search-results-header__applied-filters__filter.strikethrough')).toHaveLength(0)
    })

    it('should display an applied filter as strikethrough if excluded', () => {
      wrapper = shallowMount(SearchResultsAppliedFilter, { appVue, store, router, propsData: { filter: { label: 'term_01', value: 'term_01', field: '', negation: true } } })

      expect(wrapper.findAll('.search-results-header__applied-filters__filter')).toHaveLength(1)
      expect(wrapper.find('.search-results-header__applied-filters__filter').text()).toEqual('term_01')
      expect(wrapper.findAll('.search-results-header__applied-filters__filter.strikethrough')).toHaveLength(1)
    })
  })

  describe('deletes applied filter', () => {
    it('should click on a badge to delete an applied filter', () => {
      wrapper = mount(SearchResultsAppliedFilter, { appVue, store, router, propsData: { filter: { label: 'term_01', value: 'term_01', field: '', negation: false } } })
      const deleteQueryTermMock = jest.spyOn(wrapper.vm, 'deleteQueryTerm')

      wrapper.find('.search-results-header__applied-filters__filter').trigger('click')

      expect(deleteQueryTermMock).toBeCalledTimes(1)
    })

    it('should delete a facet term', async () => {
      store.commit('search/addFacetValue', { name: 'content-type', value: 'term_01' })
      wrapper = mount(SearchResultsAppliedFilter, { appVue, store, router, propsData: { filter: { name: 'content-type', label: 'term_01', value: 'term_01', field: '', negation: false } } })

      wrapper.find('.search-results-header__applied-filters__filter').trigger('click')

      expect(find(store.state.search.facets, { name: 'content-type' }).values).toHaveLength(0)
    })

    it('should emit an event facet::search::update once the applied filter is deleted from the store', async () => {
      wrapper = shallowMount(SearchResultsAppliedFilter, { appVue, store, router, propsData: { filter: { name: 'facet-name', label: 'term_01', value: 'term_01', field: '', negation: false } } })
      const mockCallback = jest.fn()
      wrapper.vm.$root.$on('facet::search::update', mockCallback)

      await wrapper.vm.deleteQueryTerm()

      expect(mockCallback.mock.calls).toHaveLength(1)
    })

    it('should not emit an event facet::search::update once the applied filter is deleted from the store', async () => {
      const mockCallback = jest.fn()
      wrapper.vm.$root.$on('facet::search::update', mockCallback)

      await wrapper.vm.deleteQueryTerm()

      expect(mockCallback.mock.calls).toHaveLength(0)
    })
  })
})
