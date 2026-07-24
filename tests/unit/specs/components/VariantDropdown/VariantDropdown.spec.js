import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import VariantDropdown from '@/components/VariantDropdown/VariantDropdown.vue'
import { variantOptions } from '@/enums/variants.js'

describe('VariantDropdown.vue', () => {
  let global

  beforeEach(() => {
    const core = CoreSetup.init().useAll()
    global = { plugins: core.plugins }
  })

  function mountComponent(modelValue = 'info') {
    return mount(VariantDropdown, { global, props: { modelValue } })
  }

  it('renders a dropdown', () => {
    const wrapper = mountComponent()
    expect(wrapper.findComponent({ name: 'BDropdown' }).exists()).toBe(true)
  })

  it('renders one item per variant option', () => {
    const wrapper = mountComponent()
    expect(wrapper.findAllComponents({ name: 'BDropdownItem' })).toHaveLength(4)
  })

  it('defaults to the "info" option when no modelValue is provided', () => {
    const wrapper = mount(VariantDropdown, { global })
    expect(wrapper.vm.currentOption).toEqual(variantOptions['info'])
  })

  it.each(['info', 'warning', 'danger', 'success'])('currentOption matches the "%s" variant option', (variant) => {
    const wrapper = mountComponent(variant)
    expect(wrapper.vm.currentOption).toEqual(variantOptions[variant])
  })

  it('button content icon has the class matching the current variant', () => {
    const wrapper = mountComponent('warning')
    const icon = wrapper.find('.variant-dropdown .app-icon')
    expect(icon.classes()).toContain('text-warning')
  })

  it('does not show the label by default', () => {
    const wrapper = mountComponent('warning')
    expect(wrapper.find('.variant-dropdown__label').exists()).toBe(false)
  })

  it('shows the label of the current variant when showLabel is true', () => {
    const wrapper = mount(VariantDropdown, { global, props: { modelValue: 'warning', showLabel: true } })
    expect(wrapper.find('.variant-dropdown__label').text()).toBe('Warning')
  })

  it('teleports the menu to body', () => {
    const wrapper = mountComponent()
    const dropdown = wrapper.findComponent({ name: 'BDropdown' })
    expect(dropdown.props('teleportTo')).toBe('body')
  })
})
