import Murmur from '@icij/murmur'
import { createLocalVue, mount } from '@vue/test-utils'

import FilterPath from '@/components/filter/types/FilterPath'
import { Core } from '@/core'

const { i18n, localVue, router, store, wait } = Core.init(createLocalVue()).useAll()

describe('FilterPath.vue', () => {
  const filter = store.getters['search/getFilter']({ name: 'path' })
  let wrapper

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

  it('must be created with dataDir as path', () => {
    expect(wrapper.vm.path).toBe('/data')
  })

  it('must reinitialize dataDir as path when project change', async () => {
    wrapper.vm.path = '/data/foo'
    store.commit('search/index', 'OtherProject')
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.path).toBe('/data')
  })

  it('must list selected paths according to the filter', async () => {
    const key = ['/data/foo', '/data/bar']
    store.commit('search/setFilterValue', wrapper.vm.filter.itemParam({ key }))
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.selectedPaths).toContain('/data/foo')
    expect(wrapper.vm.selectedPaths).toContain('/data/bar')
  })

  it('must reset the list selected paths when project change ', async () => {
    const key = ['/data/foo', '/data/bar']
    store.commit('search/setFilterValue', wrapper.vm.filter.itemParam({ key }))
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.selectedPaths).toHaveLength(2)
    store.commit('search/index', 'OtherProject')
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.selectedPaths).toHaveLength(0)
  })
})
