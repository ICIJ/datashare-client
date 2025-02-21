import { mount } from '@vue/test-utils'

import { flushPromises } from '~tests/unit/tests_utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import FilterPath from '@/components/Filter/FilterType/FilterTypePath'
import CoreSetup from '~tests/unit/CoreSetup'
import { useSearchStore } from '@/store/modules'

describe('FilterTypePath.vue', () => {
  const { index, es } = esConnectionHelper.build()
  const { otherIndex } = esConnectionHelper.build()

  let api, core, searchStore, wrapper

  beforeEach(() => {
    api = { tree: vi.fn(), elasticsearch: es }

    core = CoreSetup.init(api).useAll().useRouter()
    core.config.set('dataDir', '/data')

    searchStore = useSearchStore()
    searchStore.setIndex(index)
    searchStore.reset()

    const filter = searchStore.getFilter({ name: 'path' })

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

  it('should list selected paths according to the filter', async () => {
    const key = ['/data/foo', '/data/bar']
    searchStore.setFilterValue(wrapper.vm.filter.itemParam({ key }))
    await flushPromises()
    expect(wrapper.vm.selected).toContain('/data/foo')
    expect(wrapper.vm.selected).toContain('/data/bar')
  })

  it('should reset the selected paths when project change', async () => {
    const key = ['/data/foo', '/data/bar']
    searchStore.setFilterValue(wrapper.vm.filter.itemParam({ key }))
    await flushPromises()
    expect(wrapper.vm.selected).toHaveLength(2)
    searchStore.setIndex(otherIndex)
    await flushPromises()
    expect(wrapper.vm.selected).toHaveLength(0)
  })
})
