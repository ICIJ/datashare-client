import { shallowMount } from '@vue/test-utils'

import TreeBreadcrumb from '@/components/TreeBreadcrumb'
import CoreSetup from '~tests/unit/CoreSetup'

describe('TreeBreadcrumb.vue', () => {
  const { plugins, config } = CoreSetup.init().useAll()

  beforeAll(() => {
    config.set('dataDir', '/home/foo')
  })

  it('should be a Vue instance', () => {
    const props = { path: '/home/foo/bar', noDatadir: true }
    const wrapper = shallowMount(TreeBreadcrumb, { global: { plugins }, props })
    expect(wrapper).toBeTruthy()
  })

  it('should display 2 directories', async () => {
    const props = { path: '/home/foo/bar', noDatadir: true }
    const wrapper = shallowMount(TreeBreadcrumb, { global: { plugins }, props })
    expect(wrapper.findAll('.tree-breadcrumb__item')).toHaveLength(2)
  })

  it('should display 3 directories', async () => {
    const props = { path: '/home/foo/bar/baz', noDatadir: true }
    const wrapper = shallowMount(TreeBreadcrumb, { global: { plugins }, props })
    expect(wrapper.findAll('.tree-breadcrumb__item')).toHaveLength(3)
    // One for the root link
    expect(wrapper.find('.tree-breadcrumb__item--root').exists()).toBeTruthy()
    // But no abbreviation
    expect(wrapper.find('.tree-breadcrumb__item--abbr').exists()).toBeFalsy()
  })

  it('should display 4 directories (including the root and the abbreviation)', async () => {
    const props = { path: '/home/foo/bar/baz/lo/rem', maxDirectories: 2, noDatadir: true }
    const wrapper = shallowMount(TreeBreadcrumb, { global: { plugins }, props })
    expect(wrapper.findAll('.tree-breadcrumb__item')).toHaveLength(4)
    // One for the root link and one for the abbreviation
    expect(wrapper.find('.tree-breadcrumb__item--root').exists()).toBeTruthy()
    expect(wrapper.find('.tree-breadcrumb__item--abbr').exists()).toBeTruthy()
  })

  it('should display 3 directories with Windows pathSeparator', async () => {
    config.set('dataDir', 'C:\\home\\foo')
    config.set('pathSeparator', '\\')
    const props = { path: 'C:\\home\\foo\\bar\\baz', noDatadir: true }
    const wrapper = shallowMount(TreeBreadcrumb, { global: { plugins }, props })
    expect(wrapper.findAll('.tree-breadcrumb__item')).toHaveLength(3)
    // One for the root link
    expect(wrapper.find('.tree-breadcrumb__item--root').exists()).toBeTruthy()
    // But no abbreviation
    expect(wrapper.find('.tree-breadcrumb__item--abbr').exists()).toBeFalsy()
  })

  it('should display 4 directories (including the root and the abbreviation) with Windows pathSeparator', async () => {
    config.set('dataDir', 'C:\\home\\foo')
    config.set('pathSeparator', '\\')
    const props = { path: 'C:\\home\\foo\\bar\\baz\\lo\\rem', maxDirectories: 2, noDatadir: true }
    const wrapper = shallowMount(TreeBreadcrumb, { global: { plugins }, props })
    expect(wrapper.findAll('.tree-breadcrumb__item')).toHaveLength(4)
    // One for the root link and one for the abbreviation
    expect(wrapper.find('.tree-breadcrumb__item--root').exists()).toBeTruthy()
    expect(wrapper.find('.tree-breadcrumb__item--abbr').exists()).toBeTruthy()
  })
})
