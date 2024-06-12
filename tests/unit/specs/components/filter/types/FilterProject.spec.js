import { shallowMount } from '@vue/test-utils'
import find from 'lodash/find'
import { describe, vi } from 'vitest'

import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import CoreSetup from '~tests/unit/CoreSetup'
import FilterProject from '@/components/filter/types/FilterProject'

describe('FilterProject.vue', () => {
  let core, wrapper, api

  const { index: project, es } = esConnectionHelper.build()
  const { index: anotherProject } = esConnectionHelper.build()

  beforeEach(() => {
    vi.clearAllMocks()

    api = {
      getStarredDocuments: vi.fn(),
      isDownloadAllowed: vi.fn(),
      getRecommendationsByProject: vi.fn(),
      elasticsearch: es
    }

    core = CoreSetup.init(api).useAll().useRouter()
    core.config.set('projects', [{ name: project }, { name: anotherProject }])
    core.store.commit('search/index', project)
  })

  describe('without external event', () => {
    beforeEach(() => {
      vi.clearAllMocks()
      wrapper = shallowMount(FilterProject, {
        global: {
          plugins: core.plugins
        },
        props: {
          filter: find(core.store.getters['search/instantiatedFilters'], { name: 'language' })
        }
      })
    })

    it("should not display a dropdown if we aren't in server mode", () => {
      wrapper = shallowMount(FilterProject, {
        global: {
          plugins: core.plugins
        },
        props: {
          filter: find(core.store.getters['search/instantiatedFilters'], { name: 'language' })
        }
      })

      expect(wrapper.findAll('option')).toHaveLength(0)
    })

    it('should select the local project as default selected project', () => {
      expect(wrapper.vm.selectedProject).toEqual([project])
    })
  })

  describe('on project change', () => {
    beforeEach(() => {
      api.getStarredDocuments.mockResolvedValue([])

      wrapper = shallowMount(FilterProject, {
        global: {
          plugins: core.plugins
        },
        props: {
          filter: find(core.store.getters['search/instantiatedFilters'], { name: 'language' })
        }
      })

      core.store.commit('downloads/clear')
    })

    it('should not reset search state', async () => {
      core.store.commit('search/addFilterValue', { name: 'contentType', value: 'text/javascript' })
      expect(core.store.getters['search/toRouteQuery']()['f[contentType]']).toBeDefined()

      await wrapper.vm.select(anotherProject)

      expect(core.store.getters['search/toRouteQuery']().indices).toBe(anotherProject)
      expect(core.store.getters['search/toRouteQuery']()['f[contentType]']).toBeDefined()
    })

    it('should refresh the starred documents', async () => {
      await wrapper.vm.select(anotherProject)
      expect(api.getStarredDocuments).toBeCalledWith(anotherProject)
    })

    it('should refresh the download store', async () => {
      await wrapper.vm.select(anotherProject)

      expect(api.isDownloadAllowed).toBeCalledTimes(1)
      expect(api.isDownloadAllowed).toBeCalledWith(anotherProject)
    })

    it('should refresh the recommendedByUsers', async () => {
      await wrapper.vm.select(anotherProject)
      expect(api.getRecommendationsByProject).toBeCalledWith(anotherProject)
    })

    it('should refresh the route', async () => {
      const spyRefreshRoute = vi.spyOn(wrapper.vm, 'refreshRoute')
      expect(spyRefreshRoute).not.toBeCalled()

      await wrapper.vm.select(anotherProject)

      expect(spyRefreshRoute).toBeCalledTimes(1)
      expect(core.store.getters['search/toRouteQuery']().indices).toBe(anotherProject)
    })
  })
})
