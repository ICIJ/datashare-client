import toLower from 'lodash/toLower'
import { createLocalVue, shallowMount, createWrapper } from '@vue/test-utils'
import VueRouter from 'vue-router'

import { App } from '@/main'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import SearchSettings from '@/components/SearchSettings'

const { localVue, store } = App.init(createLocalVue()).useAll()
const router = new VueRouter()

describe('SearchSettings.vue', () => {
  const index = toLower('SearchSettings')
  esConnectionHelper(index)
  let rootWrapper, wrapper

  beforeEach(() => {
    wrapper = shallowMount(SearchSettings, { localVue, store, sync: false, mocks: { $t: msg => msg } })
    store.commit('search/reset')
  })

  afterAll(() => store.commit('search/reset'))

  it('should not be relative to the search, by default', () => {
    expect(wrapper.vm.relativeSearch).toBeFalsy()
  })

  it('should display the dropdown to choose the number of results per page', () => {
    expect(wrapper.findAll('#input-page-size')).toHaveLength(1)
    expect(wrapper.vm.selectedSize).toBe(store.state.search.size)
  })

  it('should change the selectedSize via the dropdown', () => {
    jest.spyOn(router, 'push')
    wrapper = shallowMount(SearchSettings, { localVue, store, router, sync: false, mocks: { $t: msg => msg } })
    rootWrapper = createWrapper(wrapper.vm.$root)
    wrapper.findAll('#input-page-size option').at(3).setSelected()

    expect(wrapper.vm.selectedSize).toBe(100)
    expect(router.push).toBeCalled()
    expect(router.push).toBeCalledWith(
      { name: 'search', query: { index: '', q: '', size: 100, sort: 'relevance', from: 0, field: 'all' } })
    expect(rootWrapper.emitted('bv::hide::popover')).toHaveLength(1)
  })

  it('should display the dropdown to choose the order', () => {
    expect(wrapper.findAll('#input-sort')).toHaveLength(1)
    expect(wrapper.vm.selectedSort).toBe(store.state.search.sort)
  })

  it('should change the selectedSort via the dropdown', () => {
    jest.spyOn(router, 'push')
    wrapper = shallowMount(SearchSettings, { localVue, store, router, async: false, mocks: { $t: msg => msg } })
    rootWrapper = createWrapper(wrapper.vm.$root)
    wrapper.findAll('#input-sort option').at(5).setSelected()

    expect(wrapper.vm.selectedSort).toBe('sizeLargest')
    expect(router.push).toBeCalled()
    expect(router.push).toBeCalledWith(
      { name: 'search', query: { index: '', q: '', size: 25, sort: 'sizeLargest', from: 0, field: 'all' } })
    expect(rootWrapper.emitted('bv::hide::popover')).toHaveLength(1)
  })
})
