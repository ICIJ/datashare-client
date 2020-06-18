import { createLocalVue, shallowMount } from '@vue/test-utils'

import TreeView from '@/components/TreeView'
import { Core } from '@/core'

describe('TreeView.vue', () => {
  const { config, i18n, localVue, store, wait } = Core.init(createLocalVue()).useAll()
  const propsData = { path: '/home/foo' }
  let wrapper

  beforeAll(() => {
    config.set('dataDir', '/home/foo')
  })

  beforeEach(() => {
    wrapper = shallowMount(TreeView, { i18n, localVue, wait, store, propsData })
  })

  it('should be a Vue instance', () => {
    expect(wrapper).toBeTruthy()
  })

  it('should display 2 directories', async () => {
    await wrapper.setData({
      hits: 10,
      total: 2048,
      directories: [
        { key: 'bar', contentLength: { value: 1024 } },
        { key: 'baz', contentLength: { value: 1024 } }
      ]
    })

    expect(wrapper.findAll('.tree-view__directories__item:not(.tree-view__directories__item--hits)')).toHaveLength(2)
    expect(wrapper.find('.tree-view__directories__item--hits').exists()).toBeTruthy()
    expect(wrapper.find('.tree-view__directories__item--hits').text()).toBe('10 documents')
  })
})
