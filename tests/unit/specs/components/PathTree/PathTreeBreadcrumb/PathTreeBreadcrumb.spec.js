import { mount } from '@vue/test-utils'

import PathTreeBreadcrumb from '@/components/PathTree/PathTreeBreadcrumb/PathTreeBreadcrumb'
import CoreSetup from '~tests/unit/CoreSetup'

describe('PathTreeBreadcrumb.vue', () => {
  const { plugins, config } = CoreSetup.init().useAll()

  beforeAll(() => {
    config.set('dataDir', '/home/foo')
  })

  it('should be a Vue instance', () => {
    const props = { modelValue: '/home/foo/bar' }
    const wrapper = mount(PathTreeBreadcrumb, { global: { plugins }, props })
    expect(wrapper).toBeTruthy()
  })

  it('should display 2 entries', async () => {
    const props = { modelValue: '/home/foo/bar', datadirLabel: true }
    const wrapper = mount(PathTreeBreadcrumb, { global: { plugins }, props })
    expect(wrapper.findAll('.path-tree-breadcrumb-entry')).toHaveLength(2)
  })

  it('should display 3 entries', async () => {
    const props = { modelValue: '/home/foo/bar/baz', datadirLabel: true }
    const wrapper = mount(PathTreeBreadcrumb, { global: { plugins }, props })
    const items = wrapper.findAll('.path-tree-breadcrumb-entry')
    expect(items).toHaveLength(3)
    expect(items.at(0).text()).toBe('Home')
    expect(items.at(1).text()).toBe('bar')
    expect(items.at(2).text()).toBe('baz')
    // The first entry is the data dir with a custom label
    expect(wrapper.find('.path-tree-breadcrumb-entry').exists()).toBeTruthy()
    expect(wrapper.find('.path-tree-breadcrumb-entry').text()).toBe('Home')
    // But no abbreviation
    expect(wrapper.find('.path-tree-breadcrumb-dropdown').exists()).toBeFalsy()
  })

  it('should display 3 entries with Windows pathSeparator', async () => {
    config.set('dataDir', 'C:\\Users\\dev\\AppData\\Roaming\\Datashare\\foo')
    config.set('pathSeparator', '\\')
    const props = { modelValue: 'C:\\Users\\dev\\AppData\\Roaming\\Datashare\\foo\\bar\\baz', datadirLabel: true }
    const wrapper = mount(PathTreeBreadcrumb, { global: { plugins }, props })
    const items = wrapper.findAll('.path-tree-breadcrumb-entry')
    expect(items).toHaveLength(3)
    expect(items.at(0).text()).toBe('Home')
    expect(items.at(1).text()).toBe('bar')
    expect(items.at(2).text()).toBe('baz')
  })
})
