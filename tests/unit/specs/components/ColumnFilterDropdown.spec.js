import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import ColumnFilterDropdown from '@/components/ColumnFilterDropdown'

describe('ColumnFilterDropdown.vue', () => {
  let plugins, wrapper

  beforeEach(() => {
    plugins = CoreSetup.init().useAll().plugins
  })

  it('displays a column filter with a dropdown', () => {
    const props = { id: 'filter_id', name: 'filter_name', modelValue: null, items: ['projectA', 'projectB'] }
    wrapper = shallowMount(ColumnFilterDropdown, { global: { plugins, renderStubDefaultSlot: true }, props })
    expect(wrapper.find('.column-filter-dropdown').exists()).toBeTruthy()
    expect(wrapper.find('selectable-dropdown-stub').exists()).toBeTruthy()
  })

  it('actives filters on single value', async () => {
    const props = { id: 'filter_id', name: 'filter_name', modelValue: null, items: ['projectA', 'projectB'] }
    wrapper = shallowMount(ColumnFilterDropdown, { global: { plugins }, props })
    expect(wrapper.vm.isActive).toBeFalsy()
    await wrapper.setProps({ modelValue: { value: 'projectA' } })
    expect(wrapper.vm.isActive).toBeTruthy()
  })

  it('actives filters on multiple values', async () => {
    const props = { id: 'filter_id', name: 'filter_name', modelValue: null, items: ['projectA', 'projectB'] }
    wrapper = shallowMount(ColumnFilterDropdown, { global: { plugins }, props })
    expect(wrapper.vm.isActive).toBeFalsy()
    await wrapper.setProps({ modelValue: ['projectA', 'projectB'] })
    expect(wrapper.vm.isActive).toBeTruthy()
  })
})
