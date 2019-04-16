import SearchResultsAppliedFilter from '@/components/SearchResultsAppliedFilter'
import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import BBadge from 'bootstrap-vue/es/components/badge/badge'
import Murmur from '@icij/murmur'
import { EventBus } from '@/utils/event-bus'
import store from '@/store'
import router from '@/router'

const localVue = createLocalVue()
localVue.use(Murmur)
localVue.component('b-badge', BBadge)

describe('SearchResultsAppliedFilter.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(SearchResultsAppliedFilter, { localVue, store, router, propsData: { filter: { value: 'trump' } } })
  })

  it('should display a filter', () => {
    expect(wrapper.findAll('.search-results__header__applied-filters__filter')).toHaveLength(1)
    expect(wrapper.find('.search-results__header__applied-filters__filter').text()).toEqual('trump')
  })

  it('should click on a badge to delete an applied filter', () => {
    wrapper = mount(SearchResultsAppliedFilter, { localVue, store, router, propsData: { filter: { value: 'trump' } } })
    const deleteQueryTermMock = jest.spyOn(wrapper.vm, 'deleteQueryTerm')

    wrapper.find('.search-results__header__applied-filters__filter').trigger('click')

    expect(deleteQueryTermMock).toBeCalledTimes(1)
    expect(deleteQueryTermMock).toBeCalledWith({ value: 'trump' })
  })

  it('should emit an event facet::search::update once the applied filter is deleted from the store', async () => {
    const mockCallback = jest.fn()
    EventBus.$on('facet::search::update', mockCallback)
    await wrapper.vm.deleteQueryTerm({ name: 'facet-name', value: 'facet-value' })
    expect(mockCallback.mock.calls).toHaveLength(1)
  })

  it('should not emit an event facet::search::update once the applied filter is deleted from the store', async () => {
    const mockCallback = jest.fn()
    EventBus.$on('facet::search::update', mockCallback)
    await wrapper.vm.deleteQueryTerm({ value: 'facet-value' })
    expect(mockCallback.mock.calls).toHaveLength(0)
  })
})
