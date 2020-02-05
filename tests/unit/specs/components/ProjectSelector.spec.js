import axios from 'axios'
import Murmur from '@icij/murmur'
import find from 'lodash/find'
import toLower from 'lodash/toLower'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import VueRouter from 'vue-router'

import Api from '@/api'
import ProjectSelector from '@/components/ProjectSelector'
import { App } from '@/main'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'

jest.mock('axios', () => {
  return {
    request: jest.fn().mockResolvedValue({ data: {} })
  }
})

const { localVue, store } = App.init(createLocalVue()).useAll()

localVue.mixin({ created () {} })
const mergeCreatedStrategy = localVue.config.optionMergeStrategies.created
localVue.config.optionMergeStrategies.created = (parent, child) => mergeCreatedStrategy(parent)

describe('ProjectSelector.vue', () => {
  const index = toLower('ProjectSelector')
  const anotherIndex = toLower('AnotherProjectSelector')
  esConnectionHelper([index, anotherIndex])
  let wrapper

  beforeAll(() => {
    Murmur.config.merge({ userProjects: [index, anotherIndex] })
    Murmur.config.merge({ multipleProjects: true })
    store.commit('search/index', index)
  })

  beforeEach(() => {
    wrapper = shallowMount(ProjectSelector, { localVue, store, propsData: { filter: find(store.state.search.filters, { name: 'language' }) }, mocks: { $t: msg => msg } })
  })

  it('should not display a dropdown if we aren\'t in server mode', () => {
    Murmur.config.merge({ multipleProjects: false })
    wrapper = shallowMount(ProjectSelector, { localVue, store, propsData: { filter: find(store.state.search.filters, { name: 'language' }) }, mocks: { $t: msg => msg } })

    expect(wrapper.findAll('option')).toHaveLength(0)
  })

  it('should select the local index as default selected index', () => {
    expect(wrapper.vm.selectedIndex).toBe(index)
  })

  describe('on index change', () => {
    beforeEach(() => {
      wrapper = shallowMount(ProjectSelector, { localVue, store, router: new VueRouter(), propsData: { filter: find(store.state.search.filters, { name: 'language' }) }, mocks: { $t: msg => msg } })
    })

    afterEach(() => axios.request.mockClear())

    it('should reset search state on index change', async () => {
      store.commit('search/addFilterValue', { name: 'contentType', value: 'text/javascript' })
      expect(store.getters['search/toRouteQuery']['f[contentType]']).not.toBeUndefined()

      await wrapper.vm.select(anotherIndex)

      expect(store.getters['search/toRouteQuery'].index).toBe(anotherIndex)
      expect(store.getters['search/toRouteQuery']['f[contentType]']).toBeUndefined()
    })

    it('should emit an event "filter::search::reset-filters" on index change', async () => {
      const mockCallback = jest.fn()
      wrapper.vm.$root.$on('filter::search::reset-filters', mockCallback)

      mockCallback.mockClear()

      await wrapper.vm.select(anotherIndex)

      expect(mockCallback.mock.calls).toHaveLength(1)
    })

    it('should refresh the starred documents on index change', async () => {
      await wrapper.vm.select(anotherIndex)

      expect(axios.request).toBeCalledTimes(2)
      expect(axios.request).toBeCalledWith({ url: Api.getFullUrl(`/api/${anotherIndex}/documents/starred`) })
    })

    it('should refresh the isDownloadAllowed on index change', async () => {
      await wrapper.vm.select(anotherIndex)

      expect(axios.request).toBeCalledTimes(2)
      expect(axios.request).toBeCalledWith(expect.objectContaining({
        url: Api.getFullUrl(`/api/project/isDownloadAllowed/${anotherIndex}`)
      }))
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
