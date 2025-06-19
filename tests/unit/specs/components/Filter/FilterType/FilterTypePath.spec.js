import { mount, flushPromises } from '@vue/test-utils'

import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import FilterPath from '@/components/Filter/FilterType/FilterTypePath'
import CoreSetup from '~tests/unit/CoreSetup'
import { useSearchStore } from '@/store/modules'

vi.mock('@/api/apiInstance', async (importOriginal) => {
  const { apiInstance } = await importOriginal()

  return {
    apiInstance: {
      ...apiInstance,
      tree: vi.fn()
    }
  }
})

describe('FilterTypePath.vue', () => {
  const { index } = esConnectionHelper.build()
  const { otherIndex } = esConnectionHelper.build()

  let core, searchStore, wrapper

  beforeEach(() => {
    core = CoreSetup.init().useAll().useRouterWithoutGuards()
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

  afterAll(() => {
    vi.resetAllMocks()
  })

  it('should be created with dataDir as path', () => {
    expect(wrapper.vm.path).toBe('/data')
  })

  it('should list selected paths according to the filter', async () => {
    const key = ['/data/foo', '/data/bar']
    searchStore.setFilterValue(wrapper.vm.filter.itemParam({ key }))
    await flushPromises()
    expect(wrapper.vm.selectedPaths).toContain('/data/foo')
    expect(wrapper.vm.selectedPaths).toContain('/data/bar')
  })

  it('should reset the selected paths when project change', async () => {
    const key = ['/data/foo', '/data/bar']
    searchStore.setFilterValue(wrapper.vm.filter.itemParam({ key }))
    await flushPromises()
    expect(wrapper.vm.selectedPaths).toHaveLength(2)
    searchStore.setIndex(otherIndex)
    await flushPromises()
    expect(wrapper.vm.selectedPaths).toHaveLength(0)
  })
})
