import { mount } from '@vue/test-utils'

import ProjectDropdownSelector from '@/components/Project/ProjectDropdownSelector/ProjectDropdownSelector'
import DropdownSelectorSearch from '@/components/DropdownSelector/DropdownSelectorSearch'
import CoreSetup from '~tests/unit/CoreSetup'

// jsdom doesn't implement scrollIntoView; the generic DropdownSelector calls it
// when a query focuses the first match, so stub it like DropdownSelector.spec.js.
window.HTMLElement.prototype.scrollIntoView = vi.fn()

describe('ProjectDropdownSelector.vue', function () {
  const { plugins } = CoreSetup.init().useAll().useRouterWithoutGuards()
  const projects = [
    { name: 'local-datashare', label: 'Default' },
    { name: 'foo', label: 'Foo' },
    { name: 'bar', label: 'Bar' }
  ]

  it('should display a dropdown with 3 options for each project', () => {
    const props = { modelValue: [{ name: 'local-datashare' }], projects, teleportDisabled: true }
    const wrapper = mount(ProjectDropdownSelector, { props, global: { plugins } })
    expect(wrapper.findAll('.dropdown-item')).toHaveLength(3)
  })

  it('should display a dropdown with "Default" selected', () => {
    const props = { modelValue: [{ name: 'local-datashare' }], projects, teleportDisabled: true }
    const wrapper = mount(ProjectDropdownSelector, { props, global: { plugins } })
    expect(wrapper.find('.dropdown-item.active').text().trim()).toBe('Default')
  })

  it('should display a dropdown with "Default" as button content', () => {
    const props = { modelValue: [{ name: 'local-datashare' }], projects, teleportDisabled: true }
    const wrapper = mount(ProjectDropdownSelector, { props, global: { plugins } })
    expect(wrapper.find('.dropdown-toggle').text().trim()).toBe('Default')
  })

  it('should display a dropdown with "Default" and "Foo selected', () => {
    const props = { modelValue: [{ name: 'local-datashare' }, { name: 'foo' }], projects, teleportDisabled: true }
    const wrapper = mount(ProjectDropdownSelector, { props, global: { plugins } })
    expect(wrapper.findAll('.dropdown-item.active').at(0).text().trim()).toBe('Default')
    expect(wrapper.findAll('.dropdown-item.active').at(1).text().trim()).toBe('Foo')
  })

  it('should display a dropdown with 2 projects as button content', () => {
    const props = { modelValue: [{ name: 'local-datashare' }, { name: 'foo' }], projects, teleportDisabled: true }
    const wrapper = mount(ProjectDropdownSelector, { props, global: { plugins } })
    expect(wrapper.find('.dropdown-toggle').text().trim()).toBe('2 projects')
  })

  it('should render the selected project first in single-select mode', () => {
    const props = { modelValue: { name: 'bar' }, projects, teleportDisabled: true }
    const wrapper = mount(ProjectDropdownSelector, { props, global: { plugins } })
    const items = wrapper.findAll('.dropdown-item')
    expect(items.at(0).text().trim()).toBe('Bar')
  })

  it('should render selected projects first, in original order, in multi-select mode', () => {
    const props = { modelValue: [{ name: 'bar' }, { name: 'foo' }], projects, teleportDisabled: true }
    const wrapper = mount(ProjectDropdownSelector, { props, global: { plugins } })
    const items = wrapper.findAll('.dropdown-item')
    // "original order" = order within the projects prop (foo precedes bar there), not modelValue order
    expect(items.at(0).text().trim()).toBe('Foo')
    expect(items.at(1).text().trim()).toBe('Bar')
    expect(items.at(2).text().trim()).toBe('Default')
  })

  it('should keep the selected project on top while a query filters the list', async () => {
    const props = { modelValue: [{ name: 'bar' }], projects, teleportDisabled: true }
    const wrapper = mount(ProjectDropdownSelector, { props, global: { plugins } })
    wrapper.findComponent(DropdownSelectorSearch).vm.$emit('update:modelValue', 'a')
    await wrapper.vm.$nextTick()
    const items = wrapper.findAll('.dropdown-item')
    expect(items).toHaveLength(2)
    expect(items.at(0).text().trim()).toBe('Bar')
    expect(items.at(1).text().trim()).toBe('Default')
  })

  it('should not reorder while open when the selection changes', async () => {
    const props = { modelValue: [{ name: 'bar' }], projects, teleportDisabled: true }
    const wrapper = mount(ProjectDropdownSelector, { props, global: { plugins } })
    await wrapper.setProps({ modelValue: [{ name: 'bar' }, { name: 'foo' }] })
    const items = wrapper.findAll('.dropdown-item')
    expect(items.at(0).text().trim()).toBe('Bar')
    expect(items.at(1).text().trim()).toBe('Default')
    expect(items.at(2).text().trim()).toBe('Foo')
  })

  it('should re-pin the current selection after the dropdown closes', async () => {
    const props = { modelValue: [{ name: 'bar' }], projects, teleportDisabled: true }
    const wrapper = mount(ProjectDropdownSelector, { props, global: { plugins } })
    // Selection changes to foo while open; snapshot is still [bar]
    await wrapper.setProps({ modelValue: [{ name: 'foo' }] })
    expect(wrapper.findAll('.dropdown-item').at(0).text().trim()).toBe('Bar')
    // Closing re-pins to the live selection, so the reorder happens while the
    // menu is hidden — the next open is already ordered, with no visible flash
    wrapper.findComponent({ name: 'BDropdown' }).vm.$emit('hidden')
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('.dropdown-item').at(0).text().trim()).toBe('Foo')
  })
})
