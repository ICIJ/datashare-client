import find from 'lodash/find'
import toLower from 'lodash/toLower'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import Murmur from '@icij/murmur'
import VueRouter from 'vue-router'

import { App } from '@/main'
import { datashare } from '@/store/modules/search'
import Api from '@/api'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import IndexSelector from '@/components/IndexSelector'
import { jsonResp } from 'tests/unit/tests_utils'

const { localVue, store } = App.init(createLocalVue()).useAll()

localVue.mixin({ created () {} })
const mergeCreatedStrategy = localVue.config.optionMergeStrategies.created
localVue.config.optionMergeStrategies.created = (parent, child) => mergeCreatedStrategy(parent)

describe('IndexSelector.vue', () => {
  const index = toLower('IndexSelector')
  const anotherIndex = toLower('AnotherIndexSelector')
  esConnectionHelper([index, anotherIndex])
  let wrapper

  beforeAll(() => {
    Murmur.config.merge({ userProjects: [index, anotherIndex] })
    Murmur.config.merge({ multipleProjects: true })
    store.commit('search/index', index)
  })

  beforeEach(() => {
    wrapper = shallowMount(IndexSelector, { localVue, store, propsData: { facet: find(store.state.search.facets, { name: 'language' }) }, mocks: { $t: msg => msg } })
  })

  it('should not display a dropdown if we aren\'t in server mode', () => {
    Murmur.config.merge({ multipleProjects: false })
    wrapper = shallowMount(IndexSelector, { localVue, store, propsData: { facet: find(store.state.search.facets, { name: 'language' }) }, mocks: { $t: msg => msg } })

    expect(wrapper.findAll('option')).toHaveLength(0)
  })

  it('should select the local index as default selected index', () => {
    expect(wrapper.vm.selectedIndex).toBe(index)
  })

  describe('on index change', () => {
    beforeEach(() => {
      wrapper = shallowMount(IndexSelector, { localVue, store, router: new VueRouter(), propsData: { facet: find(store.state.search.facets, { name: 'language' }) }, mocks: { $t: msg => msg } })
      jest.spyOn(datashare, 'fetch')
      datashare.fetch.mockReturnValue(jsonResp())
    })

    afterEach(() => datashare.fetch.mockClear())

    it('should reset search state on index change', async () => {
      store.commit('search/addFacetValue', { name: 'contentType', value: 'text/javascript' })
      expect(store.getters['search/toRouteQuery']['f[contentType]']).not.toBeUndefined()

      await wrapper.vm.select(anotherIndex)

      expect(store.getters['search/toRouteQuery'].index).toBe(anotherIndex)
      expect(store.getters['search/toRouteQuery']['f[contentType]']).toBeUndefined()
    })

    it('should emit an event "facet::search::reset-filters" on index change', async () => {
      const mockCallback = jest.fn()
      wrapper.vm.$root.$on('facet::search::reset-filters', mockCallback)

      mockCallback.mockClear()

      await wrapper.vm.select(anotherIndex)

      expect(mockCallback.mock.calls).toHaveLength(1)
    })

    it('should refresh the starred documents on index change', async () => {
      await wrapper.vm.select(anotherIndex)

      expect(datashare.fetch).toBeCalledTimes(2)
      expect(datashare.fetch).toBeCalledWith(Api.getFullUrl(`/api/${anotherIndex}/documents/starred`), {})
    })

    it('should refresh the isDownloadAllowed on index change', async () => {
      await wrapper.vm.select(anotherIndex)

      expect(datashare.fetch).toBeCalledTimes(2)
      expect(datashare.fetch).toBeCalledWith(Api.getFullUrl(`/api/project/isDownloadAllowed/${anotherIndex}`), {})
    })

    it('should refresh the route on index change', async () => {
      const spyRefreshRoute = jest.spyOn(wrapper.vm, 'refreshRoute')
      expect(spyRefreshRoute).not.toBeCalled()

      await wrapper.vm.select(anotherIndex)

      expect(spyRefreshRoute).toBeCalledTimes(1)
      expect(store.getters['search/toRouteQuery'].index).toBe(anotherIndex)
    })
  })
})
