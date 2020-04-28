import { createLocalVue, shallowMount } from '@vue/test-utils'

import WidgetDiskUsageDetailsTree from '@/components/WidgetDiskUsageDetailsTree'
import { Core } from '@/core'

describe('WidgetDiskUsageDetailsTree.vue', () => {
  const { i18n, localVue, config } = Core.init(createLocalVue()).useAll()

  beforeAll(() => {
    config.set('dataDir', '/home/foo')
  })

  it('should be a Vue instance', () => {
    const propsData = { path: '/home/foo/bar' }
    const wrapper = shallowMount(WidgetDiskUsageDetailsTree, { i18n, localVue, propsData })
    expect(wrapper.isVueInstance()).toBeTruthy()
  })

  it('should display 2 directories', async () => {
    const propsData = { path: '/home/foo/bar' }
    const wrapper = shallowMount(WidgetDiskUsageDetailsTree, { i18n, localVue, propsData })
    expect(wrapper.findAll('.widget-disk-usage-details-tree__item')).toHaveLength(2)
  })

  it('should display 3 directories', async () => {
    const propsData = { path: '/home/foo/bar/baz' }
    const wrapper = shallowMount(WidgetDiskUsageDetailsTree, { i18n, localVue, propsData })
    expect(wrapper.findAll('.widget-disk-usage-details-tree__item')).toHaveLength(3)
    // One for the root link
    expect(wrapper.find('.widget-disk-usage-details-tree__item--root').exists()).toBeTruthy()
    // But no abbreviation
    expect(wrapper.find('.widget-disk-usage-details-tree__item--abbr').exists()).toBeFalsy()
  })

  it('should display 4 directories (including the root and the abbreviation)', async () => {
    const propsData = { path: '/home/foo/bar/baz/lo/rem', maxDirectories: 2 }
    const wrapper = shallowMount(WidgetDiskUsageDetailsTree, { i18n, localVue, propsData })
    expect(wrapper.findAll('.widget-disk-usage-details-tree__item')).toHaveLength(4)
    // One for the root link and one for the abbreviation
    expect(wrapper.find('.widget-disk-usage-details-tree__item--root').exists()).toBeTruthy()
    expect(wrapper.find('.widget-disk-usage-details-tree__item--abbr').exists()).toBeTruthy()
  })
})
