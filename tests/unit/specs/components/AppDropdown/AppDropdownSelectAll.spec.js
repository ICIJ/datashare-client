import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import AppDropdownSelectAll from '@/components/AppDropdown/AppDropdownSelectAll'

describe('AppDropdownSelectAll.vue', () => {
  const { plugins } = CoreSetup.init().useAll()

  it('renders its label', () => {
    const wrapper = mount(AppDropdownSelectAll, { global: { plugins }, props: { label: 'Select all' } })
    expect(wrapper.text()).toContain('Select all')
  })

  it('emits update:modelValue when toggled', async () => {
    const wrapper = mount(AppDropdownSelectAll, {
      global: { plugins },
      props: { label: 'Select all', modelValue: false }
    })
    await wrapper.find('input[type="checkbox"]').setValue(true)
    expect(wrapper.emitted('update:modelValue')).toEqual([[true]])
  })
})
