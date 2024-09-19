import { shallowMount } from '@vue/test-utils'

import PathTreeBreadcrumb from '@/components/PathTree/PathTreeBreadcrumb'
import CoreSetup from '~tests/unit/CoreSetup'

describe('PathTreeBreadcrumb.vue', () => {
  const { plugins, config } = CoreSetup.init().useAll()

  beforeAll(() => {
    config.set('dataDir', '/home/foo')
  })

  it('should be a Vue instance', () => {
    const props = { modelValue: '/home/foo/bar' }
    const wrapper = shallowMount(PathTreeBreadcrumb, { global: { plugins }, props })
    expect(wrapper).toBeTruthy()
  })

  it('should display 2 directories', async () => {
    const props = { modelValue: '/home/foo/bar', datadirLabel: true }
    const wrapper = shallowMount(PathTreeBreadcrumb, { global: { plugins }, props })
    expect(wrapper.findAll('.path-tree-breadcrumb__item')).toHaveLength(2)
  })

  it('should display 3 directories', async () => {
    const props = { modelValue: '/home/foo/bar/baz', datadirLabel: true }
    const wrapper = shallowMount(PathTreeBreadcrumb, { global: { plugins }, props })
    expect(wrapper.findAll('.path-tree-breadcrumb__item')).toHaveLength(3)
    // One for the root link
    expect(wrapper.find('.path-tree-breadcrumb__item--root').exists()).toBeTruthy()
    // But no abbreviation
    expect(wrapper.find('.path-tree-breadcrumb__item--abbr').exists()).toBeFalsy()
  })

  it('should display 4 directories (including the root and the abbreviation)', async () => {
    const props = { modelValue: '/home/foo/bar/baz/lo/rem', maxDirectories: 2, datadirLabel: true }
    const wrapper = shallowMount(PathTreeBreadcrumb, { global: { plugins }, props })
    expect(wrapper.findAll('.path-tree-breadcrumb__item')).toHaveLength(4)
    // One for the root link and one for the abbreviation
    expect(wrapper.find('.path-tree-breadcrumb__item--root').exists()).toBeTruthy()
    expect(wrapper.find('.path-tree-breadcrumb__item--abbr').exists()).toBeTruthy()
  })

  it('should display 3 directories with Windows pathSeparator', async () => {
    config.set('dataDir', 'C:\\home\\foo')
    config.set('pathSeparator', '\\')
    const props = { modelValue: 'C:\\home\\foo\\bar\\baz', datadirLabel: true }
    const wrapper = shallowMount(PathTreeBreadcrumb, { global: { plugins }, props })
    expect(wrapper.findAll('.path-tree-breadcrumb__item')).toHaveLength(3)
    // One for the root link
    expect(wrapper.find('.path-tree-breadcrumb__item--root').exists()).toBeTruthy()
    // But no abbreviation
    expect(wrapper.find('.path-tree-breadcrumb__item--abbr').exists()).toBeFalsy()
  })

  it('should display 4 directories (including the root and the abbreviation) with Windows pathSeparator', async () => {
    config.set('dataDir', 'C:\\home\\foo')
    config.set('pathSeparator', '\\')
    const props = { modelValue: 'C:\\home\\foo\\bar\\baz\\lo\\rem', maxDirectories: 2, datadirLabel: true }
    const wrapper = shallowMount(PathTreeBreadcrumb, { global: { plugins }, props })
    expect(wrapper.findAll('.path-tree-breadcrumb__item')).toHaveLength(4)
    // One for the root link and one for the abbreviation
    expect(wrapper.find('.path-tree-breadcrumb__item--root').exists()).toBeTruthy()
    expect(wrapper.find('.path-tree-breadcrumb__item--abbr').exists()).toBeTruthy()
  })
})
