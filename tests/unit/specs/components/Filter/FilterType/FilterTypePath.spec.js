import { mount } from '@vue/test-utils'

import { flushPromises } from '~tests/unit/tests_utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import FilterPath from '@/components/Filter/FilterType/FilterTypePath'
import CoreSetup from '~tests/unit/CoreSetup'

describe('FilterPath.vue', () => {
  const { index, es } = esConnectionHelper.build()
  const { otherIndex } = esConnectionHelper.build()

  let api, core, wrapper

  beforeEach(() => {
    api = { tree: vi.fn(), elasticsearch: es }
    core = CoreSetup.init(api).useAll().useRouter()
    const filter = core.store.getters['search/getFilter']({ name: 'path' })

    core.store.commit('search/index', index)
    core.store.commit('search/reset')
    core.config.set('dataDir', '/data')

    wrapper = mount(FilterPath, {
      global: {
        plugins: core.plugins
      },
      propsData: {
        filter,
        infiniteScroll: false
      }
    })
  })

  it('should be created with dataDir as path', () => {
    expect(wrapper.vm.path).toBe('/data')
  })

  it('should reinitialize dataDir as path when project change', async () => {
    wrapper.vm.path = '/data/foo'
    core.store.commit('search/index', otherIndex)
    await flushPromises()
    expect(wrapper.vm.path).toBe('/data')
  })

  it('should list selected paths according to the filter', async () => {
    const key = ['/data/foo', '/data/bar']
    core.store.commit('search/setFilterValue', wrapper.vm.filter.itemParam({ key }))
    await flushPromises()
    expect(wrapper.vm.selected).toContain('/data/foo')
    expect(wrapper.vm.selected).toContain('/data/bar')
  })

  it.only('should reset the selected paths when project change', async () => {
    const key = ['/data/foo', '/data/bar']
    core.store.commit('search/setFilterValue', wrapper.vm.filter.itemParam({ key }))
    await flushPromises()
    expect(wrapper.vm.selected).toHaveLength(2)
    core.store.commit('search/index', otherIndex)
    await flushPromises()
    expect(wrapper.vm.selected).toHaveLength(0)
  })
})
