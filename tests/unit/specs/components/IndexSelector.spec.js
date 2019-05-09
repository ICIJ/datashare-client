import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import BootstrapVue from 'bootstrap-vue'
import { createLocalVue, mount } from '@vue/test-utils'
import find from 'lodash/find'

import Murmur from '@icij/murmur'
import IndexSelector from '@/components/IndexSelector'
import router from '@/router'
import store from '@/store'
import messages from '@/lang/en'

const localVue = createLocalVue()
localVue.use(VueI18n)
localVue.use(Murmur)
localVue.use(Vuex)
localVue.use(BootstrapVue)

const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

describe('IndexSelector.vue', () => {
  let wrapper

  beforeEach(() => {
    Murmur.config.merge({ userIndices: ['first-index'] })
    store.commit('search/index', 'first-index')
    wrapper = mount(IndexSelector, { localVue, i18n, router, store, propsData: { facet: find(store.state.search.facets, { name: 'leaks' }) } })
  })

  it('should not display a dropdown if there is only one index', () => {
    expect(wrapper.findAll('option')).toHaveLength(0)
  })

  it('should select the local index as default selected index', () => {
    expect(wrapper.vm.selectedIndex).toBe('first-index')
  })

  it('should display a dropdown containing 2 indices', async () => {
    Murmur.config.merge({ userIndices: ['first-index', 'second-index'] })
    wrapper = mount(IndexSelector, { localVue, i18n, router, store, propsData: { facet: find(store.state.search.facets, { name: 'leaks' }) } })
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('option')).toHaveLength(2)
    expect(wrapper.findAll('option').at(0).text()).toBe('first-index')
    expect(wrapper.findAll('option').at(1).text()).toBe('second-index')
  })

  it('should change the selected index and refresh the route', async () => {
    Murmur.config.merge({ userIndices: ['first-index', 'second-index'] })
    wrapper = mount(IndexSelector, { localVue, i18n, router, store, propsData: { facet: find(store.state.search.facets, { name: 'leaks' }) } })
    const spyRefreshRoute = jest.spyOn(wrapper.vm, 'refreshRoute')
    expect(spyRefreshRoute).not.toBeCalled()

    wrapper.findAll('option').at(1).setSelected()
    await wrapper.vm.$nextTick()

    expect(spyRefreshRoute).toBeCalled()
    expect(spyRefreshRoute).toBeCalledTimes(1)
    expect(store.getters['search/toRouteQuery'].index).toEqual('second-index')
  })

  it('should change the selected index and reset filters', async () => {
    Murmur.config.merge({ userIndices: ['first-index', 'second-index'] })
    wrapper = mount(IndexSelector, { localVue, i18n, router, store, propsData: { facet: find(store.state.search.facets, { name: 'leaks' }) } })

    store.commit('search/addFacetValue', { name: 'content-type', value: 'text/javascript' })
    expect(store.getters['search/toRouteQuery']['f[content-type]']).not.toBeUndefined()

    wrapper.findAll('option').at(1).setSelected()
    await wrapper.vm.$nextTick()

    expect(store.getters['search/toRouteQuery']['f[content-type]']).toBeUndefined()
    expect(store.getters['search/toRouteQuery'].index).toEqual('second-index')
  })
})
