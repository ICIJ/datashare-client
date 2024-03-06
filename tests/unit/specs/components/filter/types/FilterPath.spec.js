import Murmur from '@icij/murmur'
import { createLocalVue, mount } from '@vue/test-utils'
import { flushPromises } from '~tests/unit/tests_utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'

import FilterPath from '@/components/filter/types/FilterPath'
import { Core } from '@/core'

describe('FilterPath.vue', () => {
  const { index, es } = esConnectionHelper.build()
  const { otherIndex } = esConnectionHelper.build()
  let filter, i18n, localVue, router, store, wait, api
  let wrapper = null
  beforeAll(() => {
    api = { tree: vi.fn(), elasticsearch: es }
    const core = Core.init(createLocalVue(), api).useAll()
    i18n = core.i18n
    localVue = core.localVue
    router = core.router
    store = core.store
    wait = core.wait
    filter = store.getters['search/getFilter']({ name: 'path' })
  })
  beforeEach(() => {
    store.commit('search/index', index)
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
    store.commit('search/index', otherIndex)
    await flushPromises()
    expect(wrapper.vm.path).toBe('/data')
  })

  it('should list selected paths according to the filter', async () => {
    const key = ['/data/foo', '/data/bar']
    store.commit('search/setFilterValue', wrapper.vm.filter.itemParam({ key }))
    await flushPromises()
    expect(wrapper.vm.selectedPaths).toContain('/data/foo')
    expect(wrapper.vm.selectedPaths).toContain('/data/bar')
  })

  it('should reset the selected paths when project change', async () => {
    const key = ['/data/foo', '/data/bar']
    store.commit('search/setFilterValue', wrapper.vm.filter.itemParam({ key }))
    await flushPromises()
    expect(wrapper.vm.selectedPaths).toHaveLength(2)
    store.commit('search/index', otherIndex)
    await flushPromises()
    expect(wrapper.vm.selectedPaths).toHaveLength(0)
  })

  it('should reset search from to 0 when selectedPaths change', async () => {
    store.commit('search/from', 25)
    await flushPromises()
    await wrapper.setData({ selectedPaths: ['path'] })
    expect(store.state.search.from).toBe(0)
  })

  it('should trigger reload event when aggregate event is received', () => {
    const mockCallback = vi.fn()
    wrapper.vm.$refs.treeView.reloadDataWithSpinner = mockCallback
    wrapper.vm.$refs.filter.$emit('aggregate')
    expect(mockCallback).toBeCalled()
  })
})
