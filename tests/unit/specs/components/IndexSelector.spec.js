import { App } from '@/main'
import { createLocalVue, mount } from '@vue/test-utils'
import IndexSelector from '@/components/IndexSelector'
import Murmur from '@icij/murmur'
import { datashare } from '@/store/modules/search'
import DatashareClient from '@/api/DatashareClient'
import find from 'lodash/find'

const { localVue, store, router } = App.init(createLocalVue()).useAll()

describe('IndexSelector.vue', () => {
  let wrapper

  beforeEach(() => {
    Murmur.config.merge({ userIndices: ['first-index', 'second-index'] })
    store.commit('search/index', 'first-index')
    wrapper = mount(IndexSelector, { localVue, router, store, propsData: { facet: find(store.state.search.facets, { name: 'leaks' }) }, mocks: { $t: msg => msg } })
    wrapper.vm.$config.set('multipleProjects', true)
  })

  it('should not display a dropdown if we aren\'t in server mode', () => {
    wrapper.vm.$config.set('multipleProjects', false)
    expect(wrapper.findAll('option')).toHaveLength(0)
    wrapper.vm.$config.set('multipleProjects', true)
  })

  it('should select the local index as default selected index', () => {
    expect(wrapper.vm.selectedIndex).toBe('first-index')
  })

  it('should display a dropdown containing 2 indices', async () => {
    expect(wrapper.findAll('option')).toHaveLength(2)
    expect(wrapper.findAll('option').at(0).text()).toBe('first-index')
    expect(wrapper.findAll('option').at(1).text()).toBe('second-index')
  })

  describe('on index change', () => {
    it('should reset search state on index change', async () => {
      store.commit('search/addFacetValue', { name: 'content-type', value: 'text/javascript' })
      expect(store.getters['search/toRouteQuery']['f[content-type]']).not.toBeUndefined()

      await wrapper.findAll('option').at(1).setSelected()

      expect(store.getters['search/toRouteQuery'].index).toEqual('second-index')
      expect(store.getters['search/toRouteQuery']['f[content-type]']).toBeUndefined()
    })

    it('should emit an event "facet::search::reset-filters" on index change', async () => {
      const mockCallback = jest.fn()
      wrapper.vm.$root.$on('facet::search::reset-filters', mockCallback)

      await wrapper.findAll('option').at(1).setSelected()

      expect(mockCallback.mock.calls).toHaveLength(1)
    })

    it('should refresh the starred documents on index change', async () => {
      jest.spyOn(datashare, 'fetch')

      await wrapper.findAll('option').at(1).setSelected()

      expect(datashare.fetch).toBeCalledTimes(1)
      expect(datashare.fetch).toBeCalledWith(DatashareClient.getFullUrl('/api/document/project/starred/second-index'), {})
      datashare.fetch.mockClear()
    })

    it('should refresh the route on index change', async () => {
      const spyRefreshRoute = jest.spyOn(wrapper.vm, 'refreshRoute')
      expect(spyRefreshRoute).not.toBeCalled()

      await wrapper.findAll('option').at(1).setSelected()

      expect(spyRefreshRoute).toBeCalled()
      expect(spyRefreshRoute).toBeCalledTimes(1)
      expect(store.getters['search/toRouteQuery'].index).toEqual('second-index')
    })
  })
})
