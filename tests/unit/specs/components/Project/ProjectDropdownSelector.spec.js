import { mount } from '@vue/test-utils'

import ProjectDropdownSelector from '@/components/Project/ProjectDropdownSelector'
import CoreSetup from '~tests/unit/CoreSetup'

describe('ProjectDropdownSelector.vue', function () {
  const { plugins } = CoreSetup.init().useAll().useRouter()
  const stubs = { Teleport: true }
  const projects = [
    { name: 'local-datashare', label: 'Default' },
    { name: 'foo', label: 'Foo' },
    { name: 'bar', label: 'Bar' }
  ]

  it('should display a dropdown with 3 options for each project', () => {
    const props = { modelValue: [{ name: 'local-datashare' }], projects }
    const wrapper = mount(ProjectDropdownSelector, { props, global: { plugins, stubs } })
    expect(wrapper.findAll('.dropdown-item')).toHaveLength(3)
  })

  it('should display a dropdown with "Default" selected', () => {
    const props = { modelValue: [{ name: 'local-datashare' }], projects }
    const wrapper = mount(ProjectDropdownSelector, { props, global: { plugins, stubs } })
    expect(wrapper.find('.dropdown-item.active').text().trim()).toBe('Default')
  })

  it('should display a dropdown with "Default" as button content', () => {
    const props = { modelValue: [{ name: 'local-datashare' }], projects }
    const wrapper = mount(ProjectDropdownSelector, { props, global: { plugins, stubs } })
    expect(wrapper.find('.dropdown-toggle').text().trim()).toBe('Default')
  })

  it('should display a dropdown with "Default" and "Foo selected', () => {
    const props = { modelValue: [{ name: 'local-datashare' }, { name: 'foo' }], projects }
    const wrapper = mount(ProjectDropdownSelector, { props, global: { plugins, stubs } })
    expect(wrapper.findAll('.dropdown-item.active').at(0).text().trim()).toBe('Default')
    expect(wrapper.findAll('.dropdown-item.active').at(1).text().trim()).toBe('Foo')
  })

  it('should display a dropdown with 2 projects as button content', () => {
    const props = { modelValue: [{ name: 'local-datashare' }, { name: 'foo' }], projects }
    const wrapper = mount(ProjectDropdownSelector, { props, global: { plugins, stubs } })
    expect(wrapper.find('.dropdown-toggle').text().trim()).toBe('2 projects')
  })
})
