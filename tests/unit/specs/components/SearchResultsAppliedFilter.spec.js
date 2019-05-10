import SearchResultsAppliedFilter from '@/components/SearchResultsAppliedFilter'
import { mount, shallowMount } from '@vue/test-utils'
import store from '@/store'
import router from '@/router'
import find from 'lodash/find'
import { createApp } from '@/main'
import fetchPonyfill from 'fetch-ponyfill'

const { fetch, Response } = fetchPonyfill()
window.fetch = fetch

describe('SearchResultsAppliedFilter.vue', () => {
  let wrapper, localVue

  beforeEach(async () => {
    const app = document.createElement('div')
    app.setAttribute('id', 'app')
    document.body.appendChild(app)
    window.fetch = jest.fn()
    window.fetch.mockReturnValue(jsonOk({ userIndices: [] }))
    localVue = await createApp()
    wrapper = shallowMount(SearchResultsAppliedFilter, { localVue, store, router, propsData: { filter: { label: 'Trump', value: 'trump' } } })
  })

  it('should display a filter', () => {
    expect(wrapper.findAll('.search-results__header__applied-filters__filter')).toHaveLength(1)
    expect(wrapper.find('.search-results__header__applied-filters__filter').text()).toEqual('Trump')
  })

  it('should click on a badge to delete an applied filter', () => {
    wrapper = mount(SearchResultsAppliedFilter, { localVue, store, router, propsData: { filter: { value: 'trump' } } })
    const deleteQueryTermMock = jest.spyOn(wrapper.vm, 'deleteQueryTerm')

    wrapper.find('.search-results__header__applied-filters__filter').trigger('click')

    expect(deleteQueryTermMock).toBeCalledTimes(1)
  })

  it('should delete the query term', async () => {
    store.commit('search/addFacetValue', { name: 'content-type', value: 'trump' })
    expect(find(store.state.search.facets, { name: 'content-type' }).values).toHaveLength(1)
    wrapper = mount(SearchResultsAppliedFilter, { localVue, store, router, propsData: { filter: { name: 'content-type', label: 'Trump', value: 'trump' } } })

    wrapper.find('.search-results__header__applied-filters__filter').trigger('click')

    expect(find(store.state.search.facets, { name: 'content-type' }).values).toHaveLength(0)
  })

  it('should emit an event facet::search::update once the applied filter is deleted from the store', async () => {
    wrapper = shallowMount(SearchResultsAppliedFilter, { localVue, store, router, propsData: { filter: { name: 'facet-name', label: 'Trump', value: 'trump' } } })
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

function jsonOk (body) {
  const mockResponse = new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      'Content-type': 'application/json'
    }
  })
  return Promise.resolve(mockResponse)
}
