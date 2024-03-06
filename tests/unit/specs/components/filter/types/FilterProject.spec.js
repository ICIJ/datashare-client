import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import VueRouter from 'vue-router'
import find from 'lodash/find'

import { Core } from '@/core'
import FilterProject from '@/components/filter/types/FilterProject'

describe('FilterProject.vue', () => {
  let i18n, localVue, store, wait, wrapper, api

  const { index: project, es } = esConnectionHelper.build()
  const { index: anotherProject } = esConnectionHelper.build()

  beforeAll(() => {
    api = {
      getStarredDocuments: vi.fn(),
      isDownloadAllowed: vi.fn(),
      getRecommendationsByProject: vi.fn(),
      elasticsearch: es
    }
    const core = Core.init(createLocalVue(), api).useAll()
    i18n = core.i18n
    localVue = core.localVue
    store = core.store
    wait = core.wait

    const mergeCreatedStrategy = localVue.config.optionMergeStrategies.created
    localVue.config.optionMergeStrategies.created = (parent, _) => mergeCreatedStrategy(parent)
    localVue.mixin({ created() {} })

    Murmur.config.set('projects', [{ name: project }, { name: anotherProject }])
    store.commit('search/index', project)
  })

  beforeEach(() => {
    vi.clearAllMocks()
    wrapper = shallowMount(FilterProject, {
      i18n,
      localVue,
      store,
      wait,
      propsData: { filter: find(store.getters['search/instantiatedFilters'], { name: 'language' }) }
    })
  })

  it("should not display a dropdown if we aren't in server mode", () => {
    wrapper = shallowMount(FilterProject, {
      i18n,
      localVue,
      store,
      wait,
      propsData: { filter: find(store.getters['search/instantiatedFilters'], { name: 'language' }) }
    })

    expect(wrapper.findAll('option')).toHaveLength(0)
  })

  it('should select the local project as default selected project', () => {
    expect(wrapper.vm.selectedProject).toEqual([project])
  })

  describe('on project change', () => {
    beforeEach(() => {
      api.getStarredDocuments.mockResolvedValue([])

      wrapper = shallowMount(FilterProject, {
        i18n,
        localVue,
        store,
        router: new VueRouter(),
        wait,
        propsData: { filter: find(store.getters['search/instantiatedFilters'], { name: 'language' }) }
      })
      store.commit('downloads/clear')
    })

    it('should not reset search state', async () => {
      store.commit('search/addFilterValue', { name: 'contentType', value: 'text/javascript' })
      expect(store.getters['search/toRouteQuery']()['f[contentType]']).toBeDefined()

      await wrapper.vm.select(anotherProject)

      expect(store.getters['search/toRouteQuery']().indices).toBe(anotherProject)
      expect(store.getters['search/toRouteQuery']()['f[contentType]']).toBeDefined()
    })

    it('should refresh the starred documents', async () => {
      await wrapper.vm.select(anotherProject)

      expect(api.getStarredDocuments).toBeCalledTimes(1)
      expect(api.getStarredDocuments).toBeCalledWith(anotherProject)
    })

    it('should refresh the download store', async () => {
      await wrapper.vm.select(anotherProject)

      expect(api.isDownloadAllowed).toBeCalledTimes(1)
      expect(api.isDownloadAllowed).toBeCalledWith(anotherProject)
    })

    it('should refresh the recommendedByUsers', async () => {
      await wrapper.vm.select(anotherProject)

      expect(api.getRecommendationsByProject).toBeCalledTimes(1)
      expect(api.getRecommendationsByProject).toBeCalledWith(anotherProject)
    })

    it('should refresh the route', async () => {
      const spyRefreshRoute = vi.spyOn(wrapper.vm, 'refreshRoute')
      expect(spyRefreshRoute).not.toBeCalled()

      await wrapper.vm.select(anotherProject)

      expect(spyRefreshRoute).toBeCalledTimes(1)
      expect(store.getters['search/toRouteQuery']().indices).toBe(anotherProject)
    })
  })
})
