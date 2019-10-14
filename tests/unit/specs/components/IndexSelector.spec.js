import { App } from '@/main'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import IndexSelector from '@/components/IndexSelector'
import Murmur from '@icij/murmur'
import { datashare } from '@/store/modules/search'
import DatashareClient from '@/api/DatashareClient'
import find from 'lodash/find'
import { jsonOk } from 'tests/unit/tests_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'

const { localVue, store, router } = App.init(createLocalVue()).useAll()

localVue.mixin({ created () {} })
const mergeCreatedStrategy = localVue.config.optionMergeStrategies.created
localVue.config.optionMergeStrategies.created = (parent, child) => mergeCreatedStrategy(parent)

describe('IndexSelector.vue', () => {
  let wrapper
  esConnectionHelper()

  beforeAll(() => {
    Murmur.config.merge({ userIndices: [process.env.VUE_APP_ES_INDEX, process.env.VUE_APP_ES_ANOTHER_INDEX] })
    Murmur.config.merge({ multipleProjects: true })
    store.commit('search/index', process.env.VUE_APP_ES_INDEX)
  })

  beforeEach(() => {
    wrapper = shallowMount(IndexSelector, { localVue, router, store, propsData: { facet: find(store.state.search.facets, { name: 'language' }) }, mocks: { $t: msg => msg } })
  })

  it('should not display a dropdown if we aren\'t in server mode', () => {
    Murmur.config.merge({ multipleProjects: false })
    wrapper = shallowMount(IndexSelector, { localVue, router, store, propsData: { facet: find(store.state.search.facets, { name: 'language' }) }, mocks: { $t: msg => msg } })

    expect(wrapper.findAll('option')).toHaveLength(0)
  })

  it('should select the local index as default selected index', () => {
    expect(wrapper.vm.selectedIndex).toBe(process.env.VUE_APP_ES_INDEX)
  })

  describe('on index change', () => {
    beforeEach(() => {
      wrapper = shallowMount(IndexSelector, { localVue, router, store, propsData: { facet: find(store.state.search.facets, { name: 'language' }) }, mocks: { $t: msg => msg } })
      jest.spyOn(datashare, 'fetch')
      datashare.fetch.mockReturnValue(jsonOk())
    })

    afterEach(() => datashare.fetch.mockClear())

    it('should reset search state on index change', async () => {
      store.commit('search/addFacetValue', { name: 'content-type', value: 'text/javascript' })
      expect(store.getters['search/toRouteQuery']['f[content-type]']).not.toBeUndefined()

      await wrapper.vm.select(process.env.VUE_APP_ES_ANOTHER_INDEX)

      expect(store.getters['search/toRouteQuery'].index).toEqual(process.env.VUE_APP_ES_ANOTHER_INDEX)
      expect(store.getters['search/toRouteQuery']['f[content-type]']).toBeUndefined()
    })

    it('should emit an event "facet::search::reset-filters" on index change', async () => {
      const mockCallback = jest.fn()
      wrapper.vm.$root.$on('facet::search::reset-filters', mockCallback)

      mockCallback.mockClear()

      await wrapper.vm.select(process.env.VUE_APP_ES_ANOTHER_INDEX)

      expect(mockCallback.mock.calls).toHaveLength(1)
    })

    it('should refresh the starred documents on index change', async () => {
      await wrapper.vm.select(process.env.VUE_APP_ES_ANOTHER_INDEX)

      expect(datashare.fetch).toBeCalledTimes(2)
      expect(datashare.fetch).toBeCalledWith(DatashareClient.getFullUrl(`/api/document/project/starred/${process.env.VUE_APP_ES_ANOTHER_INDEX}`), {})
    })

    it('should refresh the isAllowed on index change', async () => {
      await wrapper.vm.select(process.env.VUE_APP_ES_ANOTHER_INDEX)

      expect(datashare.fetch).toBeCalledTimes(2)
      expect(datashare.fetch).toBeCalledWith(DatashareClient.getFullUrl(`/api/project/isAllowed/${process.env.VUE_APP_ES_ANOTHER_INDEX}`), {})
    })

    it('should refresh the route on index change', async () => {
      const spyRefreshRoute = jest.spyOn(wrapper.vm, 'refreshRoute')
      expect(spyRefreshRoute).not.toBeCalled()

      await wrapper.vm.select(process.env.VUE_APP_ES_ANOTHER_INDEX)

      expect(spyRefreshRoute).toBeCalled()
      expect(spyRefreshRoute).toBeCalledTimes(1)
      expect(store.getters['search/toRouteQuery'].index).toEqual(process.env.VUE_APP_ES_ANOTHER_INDEX)
    })
  })
})
