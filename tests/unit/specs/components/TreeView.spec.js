import { createLocalVue, shallowMount } from '@vue/test-utils'

import TreeView from '@/components/TreeView'
import { Core } from '@/core'

describe('TreeView.vue', () => {
  const { config, i18n, localVue, store, wait } = Core.init(createLocalVue()).useAll()
  const propsData = { path: '/home/foo', selectedPaths: ['path_01', 'path_02'], size: true, count: true }
  let wrapper = null

  beforeAll(() => config.set('dataDir', '/home/foo'))

  beforeEach(() => {
    wrapper = shallowMount(TreeView, { i18n, localVue, propsData, store, wait })
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

  it('should init selected on component creation', () => {
    wrapper = shallowMount(TreeView, { i18n, localVue, propsData, store, wait })
    expect(wrapper.vm.selected).toEqual(['path_01', 'path_02'])
  })

  it('should display checkboxes if component is selectable', async () => {
    wrapper.setProps({
      selectable: true
    })
    await wrapper.setData({
      directories: [
        { key: 'bar', contentLength: { value: 1024 } },
        { key: 'baz', contentLength: { value: 1024 } }
      ]
    })
    expect(wrapper.findAll('b-form-checkbox-stub')).toHaveLength(2)
  })

  it('should NOT display checkboxes', async () => {
    wrapper.setProps({
      selectable: false
    })
    await wrapper.setData({
      directories: [
        { key: 'bar', contentLength: { value: 1024 } },
        { key: 'baz', contentLength: { value: 1024 } }
      ]
    })
    expect(wrapper.findAll('b-form-checkbox-stub')).toHaveLength(0)
  })
})
