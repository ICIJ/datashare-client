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

  it('should display 2 directories', async () => {
    const props = { modelValue: '/home/foo/bar', datadirLabel: true }
    const wrapper = mount(PathTreeBreadcrumb, { global: { plugins }, props })
    expect(wrapper.findAll('.path-tree-breadcrumb-entry')).toHaveLength(2)
  })

  it('should display 3 directories', async () => {
    const props = { modelValue: '/home/foo/bar/baz', datadirLabel: true }
    const wrapper = mount(PathTreeBreadcrumb, { global: { plugins }, props })
    const items = wrapper.findAll('.path-tree-breadcrumb-entry')
    expect(items).toHaveLength(3)
    expect(items.at(0).text()).toBe('Home')
    expect(items.at(1).text()).toBe('bar')
    expect(items.at(2).text()).toBe('baz')
    // One for the root link
    expect(wrapper.find('.path-tree-breadcrumb-entry--root').exists()).toBeTruthy()
    // But no abbreviation
    expect(wrapper.find('.path-tree-breadcrumb-entry--abbr').exists()).toBeFalsy()
  })

  it('should display 4 directories (including the root and the abbreviation)', async () => {
    const props = { modelValue: '/home/foo/bar/baz/lo/rem', maxDirectories: 2, datadirLabel: true }
    const wrapper = mount(PathTreeBreadcrumb, { global: { plugins }, props })
    expect(wrapper.findAll('.path-tree-breadcrumb-entry')).toHaveLength(4)
    // One for the root link and one for the abbreviation
    expect(wrapper.find('.path-tree-breadcrumb-entry--root').exists()).toBeTruthy()
    expect(wrapper.find('.path-tree-breadcrumb-entry--abbr').exists()).toBeTruthy()
  })

  it('should display 3 directories with Windows pathSeparator', async () => {
    config.set('dataDir', 'C:\\Users\\dev\\AppData\\Roaming\\Datashare\\foo')
    config.set('pathSeparator', '\\')
    const props = { modelValue: 'C:\\Users\\dev\\AppData\\Roaming\\Datashare\\foo\\bar\\baz', datadirLabel: true }
    const wrapper = mount(PathTreeBreadcrumb, { global: { plugins }, props })
    const items = wrapper.findAll('.path-tree-breadcrumb-entry')
    expect(items).toHaveLength(3)
    expect(items.at(0).text()).toBe('Home')
    expect(items.at(1).text()).toBe('bar')
    expect(items.at(2).text()).toBe('baz')
    // One for the root link
    expect(wrapper.find('.path-tree-breadcrumb-entry--root').exists()).toBeTruthy()
    // But no abbreviation
    expect(wrapper.find('.path-tree-breadcrumb-entry--abbr').exists()).toBeFalsy()
  })

  it('should display 4 directories (including the root and the abbreviation) with Windows pathSeparator', async () => {
    config.set('dataDir', 'C:\\Users\\dev\\AppData\\Roaming\\Datashare\\foo')
    config.set('pathSeparator', '\\')
    const props = {
      modelValue: 'C:\\Users\\dev\\AppData\\Roaming\\Datashare\\foo\\bar\\baz\\lo\\rem',
      maxDirectories: 2,
      datadirLabel: true
    }
    const wrapper = mount(PathTreeBreadcrumb, { global: { plugins }, props })
    expect(wrapper.findAll('.path-tree-breadcrumb-entry')).toHaveLength(4)
    // One for the root link and one for the abbreviation
    expect(wrapper.find('.path-tree-breadcrumb-entry--root').exists()).toBeTruthy()
    expect(wrapper.find('.path-tree-breadcrumb-entry--abbr').exists()).toBeTruthy()
  })
})
