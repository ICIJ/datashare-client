import { createLocalVue, shallowMount } from '@vue/test-utils'

import TreeView from '@/components/TreeView'
import { Core } from '@/core'

describe('TreeView.vue', () => {
  const { i18n, localVue, wait, store, config } = Core.init(createLocalVue()).useAll()
  const propsData = { path: '/home/foo' }

  beforeAll(() => {
    config.set('dataDir', '/home/foo')
  })

  it('should be a Vue instance', () => {
    const methods = {
      loadData: () => ({
        hits: 10,
        total: 2048,
        directories: [
          { key: 'bar', contentLength: { value: 1024 } },
          { key: 'baz', contentLength: { value: 1024 } }
        ]
      })
    }
    const wrapper = shallowMount(TreeView, { i18n, localVue, wait, store, propsData, methods })
    expect(wrapper).toBeTruthy()
  })

  it('should display 2 directories', async () => {
    const methods = {
      loadData: () => ({
        hits: 10,
        total: 2048,
        directories: [
          { key: 'bar', contentLength: { value: 1024 } },
          { key: 'baz', contentLength: { value: 1024 } }
        ]
      })
    }
    const wrapper = shallowMount(TreeView, { i18n, localVue, wait, store, propsData, methods })
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('.tree-view__directories__item')).toHaveLength(3)
    // One for the document count
    expect(wrapper.find('.tree-view__directories__item--hits').exists()).toBeTruthy()
    expect(wrapper.find('.tree-view__directories__item--hits').text()).toBe('10 documents')
  })
})
