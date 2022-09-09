import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import VueRouter from 'vue-router'

import find from 'lodash/find'
import { Api } from '@/api'
import { Core } from '@/core'
import FilterProject from '@/components/filter/types/FilterProject'

describe('FilterProject.vue', () => {
  let i18n, localVue, store, wait, wrapper, api, mockAxios

  const { index: project } = esConnectionHelper.build()
  const { index: anotherProject } = esConnectionHelper.build()

  beforeAll(() => {
    mockAxios = { request: jest.fn() }
    api = new Api(mockAxios, null)
    const core = Core.init(createLocalVue(), api).useAll()
    i18n = core.i18n
    localVue = core.localVue
    store = core.store
    wait = core.wait

    const mergeCreatedStrategy = localVue.config.optionMergeStrategies.created
    localVue.config.optionMergeStrategies.created = (parent, _) => mergeCreatedStrategy(parent)
    localVue.mixin({ created () {} })

    Murmur.config.merge({ groups_by_applications: { datashare: JSON.stringify([project, anotherProject]) } })
    store.commit('search/index', project)
  })

  beforeEach(() => {
    mockAxios.request.mockClear()
    mockAxios.request.mockResolvedValue({ data: [] })
    wrapper = shallowMount(FilterProject, { i18n, localVue, store, wait, propsData: { filter: find(store.getters['search/instantiatedFilters'], { name: 'language' }) } })
  })

  it('should not display a dropdown if we aren\'t in server mode', () => {
    wrapper = shallowMount(FilterProject, { i18n, localVue, store, wait, propsData: { filter: find(store.getters['search/instantiatedFilters'], { name: 'language' }) } })

    expect(wrapper.findAll('option')).toHaveLength(0)
  })

  it('should select the local project as default selected project', () => {
    expect(wrapper.vm.selectedProject).toEqual([project])
  })

  describe('on project change', () => {
    beforeEach(() => {
      wrapper = shallowMount(FilterProject, { i18n, localVue, store, router: new VueRouter(), wait, propsData: { filter: find(store.getters['search/instantiatedFilters'], { name: 'language' }) } })
      store.commit('downloads/clear')
    })

    afterEach(() => mockAxios.request.mockClear())

    it('should not reset search state', async () => {
      store.commit('search/addFilterValue', { name: 'contentType', value: 'text/javascript' })
      expect(store.getters['search/toRouteQuery']()['f[contentType]']).toBeDefined()

      await wrapper.vm.select(anotherProject)

      expect(store.getters['search/toRouteQuery']().indices).toBe(anotherProject)
      expect(store.getters['search/toRouteQuery']()['f[contentType]']).toBeDefined()
    })

    it('should refresh the starred documents', async () => {
      await wrapper.vm.select(anotherProject)

      expect(mockAxios.request).toBeCalledTimes(3)
      expect(mockAxios.request).toBeCalledWith({ url: Api.getFullUrl(`/api/${anotherProject}/documents/starred`) })
    })

    it('should refresh the download store', async () => {
      await wrapper.vm.select(anotherProject)

      expect(mockAxios.request).toBeCalledTimes(3)
      expect(mockAxios.request).toBeCalledWith(expect.objectContaining({
        url: Api.getFullUrl(`/api/project/isDownloadAllowed/${anotherProject}`)
      }))
    })

    it('should refresh the recommendedByUsers', async () => {
      await wrapper.vm.select(anotherProject)

      expect(mockAxios.request).toBeCalledTimes(3)
      expect(mockAxios.request).toBeCalledWith(expect.objectContaining({
        url: Api.getFullUrl('/api/users/recommendations'),
        method: 'GET',
        params: {
          project: anotherProject
        }
      }))
    })

    it('should refresh the route', async () => {
      const spyRefreshRoute = jest.spyOn(wrapper.vm, 'refreshRoute')
      expect(spyRefreshRoute).not.toBeCalled()

      await wrapper.vm.select(anotherProject)

      expect(spyRefreshRoute).toBeCalledTimes(1)
      expect(store.getters['search/toRouteQuery']().indices).toBe(anotherProject)
    })
  })
})
