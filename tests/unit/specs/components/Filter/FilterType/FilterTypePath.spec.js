import { mount, flushPromises } from '@vue/test-utils'

import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import FilterPath from '@/components/Filter/FilterType/FilterTypePath'
import CoreSetup from '~tests/unit/CoreSetup'
import { useLockedFiltersStore, useSearchStore } from '@/store/modules'

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

  it('should pre-open ancestor directories of selected paths', async () => {
    const key = ['/data/mail/arnold-j/inbox']
    searchStore.setFilterValue(wrapper.vm.filter.itemParam({ key }))
    await flushPromises()
    expect(wrapper.vm.openPaths).toContain('/data/mail')
    expect(wrapper.vm.openPaths).toContain('/data/mail/arnold-j')
    expect(wrapper.vm.openPaths).toContain('/data/mail/arnold-j/inbox')
  })

  it('should preserve manually opened paths when selected paths change', async () => {
    // Simulate a manually opened path
    wrapper.vm.openPaths = ['/data/other']
    const key = ['/data/mail/sub']
    searchStore.setFilterValue(wrapper.vm.filter.itemParam({ key }))
    await flushPromises()
    expect(wrapper.vm.openPaths).toContain('/data/other')
    expect(wrapper.vm.openPaths).toContain('/data/mail')
    expect(wrapper.vm.openPaths).toContain('/data/mail/sub')
  })

  describe('locked filters (icij/datashare#2336)', () => {
    let lockedFiltersStore

    beforeEach(() => {
      lockedFiltersStore = useLockedFiltersStore()
    })

    it('reports an unselected path as unlocked by default', () => {
      expect(wrapper.vm.isPathLocked('/data/foo')).toBe(false)
    })

    it('locks an already-selected path without changing the selection', () => {
      wrapper.vm.selectedPaths = ['/data/foo']

      wrapper.vm.toggleLockPath('/data/foo', true)

      expect(wrapper.vm.selectedPaths).toEqual(['/data/foo'])
      expect(lockedFiltersStore.isLocked({ name: 'path', value: '/data/foo' })).toBe(true)
      expect(wrapper.vm.isPathLocked('/data/foo')).toBe(true)
    })

    it('unlocks a path without unselecting it', () => {
      wrapper.vm.selectedPaths = ['/data/foo']
      wrapper.vm.toggleLockPath('/data/foo', true)

      wrapper.vm.toggleLockPath('/data/foo', false)

      expect(lockedFiltersStore.isLocked({ name: 'path', value: '/data/foo' })).toBe(false)
      expect(wrapper.vm.selectedPaths).toContain('/data/foo')
    })

    it('removes the lock when the path is deselected', () => {
      wrapper.vm.selectedPaths = ['/data/foo']
      wrapper.vm.toggleLockPath('/data/foo', true)

      wrapper.vm.selectedPaths = []

      expect(lockedFiltersStore.isLocked({ name: 'path', value: '/data/foo' })).toBe(false)
    })

    it('locks under the "-" prefixed name when the filter is currently excluded', () => {
      searchStore.excludeFilter('path')
      wrapper.vm.selectedPaths = ['/data/foo']

      wrapper.vm.toggleLockPath('/data/foo', true)

      expect(lockedFiltersStore.isLocked({ name: '-path', value: '/data/foo' })).toBe(true)
      expect(lockedFiltersStore.isLocked({ name: 'path', value: '/data/foo' })).toBe(false)
    })
  })
})
