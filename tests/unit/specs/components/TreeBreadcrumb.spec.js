import { createLocalVue, shallowMount } from '@vue/test-utils'

import TreeBreadcrumb from '@/components/TreeBreadcrumb'
import { Core } from '@/core'

describe('TreeBreadcrumb.vue', () => {
  const { i18n, localVue, config } = Core.init(createLocalVue()).useAll()

  beforeAll(() => {
    config.set('dataDir', '/home/foo')
  })

  it('should be a Vue instance', () => {
    const propsData = { path: '/home/foo/bar', noDatadir: true }
    const wrapper = shallowMount(TreeBreadcrumb, { i18n, localVue, propsData })
    expect(wrapper).toBeTruthy()
  })

  it('should display 2 directories', async () => {
    const propsData = { path: '/home/foo/bar', noDatadir: true }
    const wrapper = shallowMount(TreeBreadcrumb, { i18n, localVue, propsData })
    expect(wrapper.findAll('.tree-breadcrumb__item')).toHaveLength(2)
  })

  it('should display 3 directories', async () => {
    const propsData = { path: '/home/foo/bar/baz', noDatadir: true }
    const wrapper = shallowMount(TreeBreadcrumb, { i18n, localVue, propsData })
    expect(wrapper.findAll('.tree-breadcrumb__item')).toHaveLength(3)
    // One for the root link
    expect(wrapper.find('.tree-breadcrumb__item--root').exists()).toBeTruthy()
    // But no abbreviation
    expect(wrapper.find('.tree-breadcrumb__item--abbr').exists()).toBeFalsy()
  })

  it('should display 4 directories (including the root and the abbreviation)', async () => {
    const propsData = { path: '/home/foo/bar/baz/lo/rem', maxDirectories: 2, noDatadir: true }
    const wrapper = shallowMount(TreeBreadcrumb, { i18n, localVue, propsData })
    expect(wrapper.findAll('.tree-breadcrumb__item')).toHaveLength(4)
    // One for the root link and one for the abbreviation
    expect(wrapper.find('.tree-breadcrumb__item--root').exists()).toBeTruthy()
    expect(wrapper.find('.tree-breadcrumb__item--abbr').exists()).toBeTruthy()
  })

  it('should display 3 directories with Windows pathSeparator', async () => {
    config.set('dataDir', 'C:\\home\\foo')
    config.set('pathSeparator', '\\')
    const propsData = { path: 'C:\\home\\foo\\bar\\baz', noDatadir: true }
    const wrapper = shallowMount(TreeBreadcrumb, { i18n, localVue, propsData })
    expect(wrapper.findAll('.tree-breadcrumb__item')).toHaveLength(3)
    // One for the root link
    expect(wrapper.find('.tree-breadcrumb__item--root').exists()).toBeTruthy()
    // But no abbreviation
    expect(wrapper.find('.tree-breadcrumb__item--abbr').exists()).toBeFalsy()
  })

  it('should display 4 directories (including the root and the abbreviation) with Windows pathSeparator', async () => {
    config.set('dataDir', 'C:\\home\\foo')
    config.set('pathSeparator', '\\')
    const propsData = { path: 'C:\\home\\foo\\bar\\baz\\lo\\rem', maxDirectories: 2, noDatadir: true }
    const wrapper = shallowMount(TreeBreadcrumb, { i18n, localVue, propsData })
    expect(wrapper.findAll('.tree-breadcrumb__item')).toHaveLength(4)
    // One for the root link and one for the abbreviation
    expect(wrapper.find('.tree-breadcrumb__item--root').exists()).toBeTruthy()
    expect(wrapper.find('.tree-breadcrumb__item--abbr').exists()).toBeTruthy()
  })
})
