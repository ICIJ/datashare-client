import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import DropdownSelectorSelectAll from '@/components/DropdownSelector/DropdownSelectorSelectAll'

describe('DropdownSelectorSelectAll.vue', () => {
  const { plugins } = CoreSetup.init().useAll()

  it('renders its label', () => {
    const wrapper = mount(DropdownSelectorSelectAll, { global: { plugins }, props: { label: 'Select all' } })
    expect(wrapper.text()).toContain('Select all')
  })

  it('emits update:modelValue when toggled', async () => {
    const wrapper = mount(DropdownSelectorSelectAll, {
      global: { plugins },
      props: { label: 'Select all', modelValue: false }
    })
    await wrapper.find('input[type="checkbox"]').setValue(true)
    expect(wrapper.emitted('update:modelValue')).toEqual([[true]])
  })
})
