import Murmur from '@icij/murmur'
import { createLocalVue, mount } from '@vue/test-utils'
import { flushPromises } from 'tests/unit/tests_utils'

import FilterPath from '@/components/filter/types/FilterPath'
import { Core } from '@/core'

const { i18n, localVue, router, store, wait } = Core.init(createLocalVue()).useAll()

describe('FilterPath.vue', () => {
  const filter = store.getters['search/getFilter']({ name: 'path' })
  let wrapper = null

  beforeEach(() => {
    store.commit('search/index', 'FilterPathProject')
    store.commit('search/reset')
    Murmur.config.set('dataDir', '/data')
    wrapper = mount(FilterPath, {
      i18n,
      localVue,
      router,
      store,
      wait,
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
    await store.commit('search/index', 'OtherProject')
    await flushPromises()
    expect(wrapper.vm.path).toBe('/data')
  })

  it('should list selected paths according to the filter', async () => {
    const key = ['/data/foo', '/data/bar']
    await store.commit('search/setFilterValue', wrapper.vm.filter.itemParam({ key }))
    await flushPromises()
    expect(wrapper.vm.selectedPaths).toContain('/data/foo')
    expect(wrapper.vm.selectedPaths).toContain('/data/bar')
  })

  it('should reset the selected paths when project change', async () => {
    const key = ['/data/foo', '/data/bar']
    await store.commit('search/setFilterValue', wrapper.vm.filter.itemParam({ key }))
    expect(wrapper.vm.selectedPaths).toHaveLength(2)

    await store.commit('search/index', 'OtherProject')
    expect(wrapper.vm.selectedPaths).toHaveLength(0)
  })

  it('should reset search from to 0 when selectedPaths change', () => {
    store.commit('search/from', 25)
    wrapper.vm.$set(wrapper.vm, 'selectedPaths', ['path'])
    expect(store.state.search.from).toBe(0)
  })

  it('should trigger reload event when aggregate event is received', () => {
    const mockCallback = jest.fn()
    wrapper.vm.$refs.treeView.reloadDataWithSpinner = mockCallback
    wrapper.vm.$refs.filter.$emit('aggregate')
    expect(mockCallback).toBeCalled()
  })
})
