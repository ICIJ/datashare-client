import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import FormControlTagDropdown from '@/components/Form/FormControl/FormControlTag/FormControlTagDropdown'

describe('FormControlTagDropdown', () => {
  let plugins

  beforeAll(() => {
    const core = CoreSetup.init().useAll()
    plugins = core.plugins
  })

  const options = ['apple', 'banana', 'apricot', 'cherry']

  it('shows all options sorted alphabetically when input is empty', () => {
    const wrapper = mount(FormControlTagDropdown, {
      global: { plugins },
      props: { options, modelValue: [], inputValue: '', show: true }
    })

    expect(wrapper.vm.filteredOptions.map(o => o.item)).toEqual([...options].sort())
  })

  it('shows all options when input is empty', () => {
    const wrapper = mount(FormControlTagDropdown, {
      global: { plugins },
      props: { options, modelValue: [], inputValue: '', show: true }
    })

    expect(wrapper.vm.filteredOptions.map(o => o.item)).toEqual([...options].sort())
  })

  it('filters options by the typed input value', async () => {
    const wrapper = mount(FormControlTagDropdown, {
      global: { plugins },
      props: { options, modelValue: [], inputValue: 'ap', show: true }
    })

    const items = wrapper.vm.filteredOptions.map(o => o.item)
    expect(items).toContain('apple')
    expect(items).toContain('apricot')
    expect(items).not.toContain('banana')
    expect(items).not.toContain('cherry')
  })

  it('emits update:show true when typed input has matching options', async () => {
    const wrapper = mount(FormControlTagDropdown, {
      global: { plugins },
      props: { options, modelValue: [], inputValue: '', show: true }
    })

    await wrapper.setProps({ inputValue: 'ap' })
    expect(wrapper.emitted('update:show')?.at(-1)).toEqual([true])
  })

  it('emits update:show false when typed input has no matching options', async () => {
    const wrapper = mount(FormControlTagDropdown, {
      global: { plugins },
      props: { options, modelValue: [], inputValue: '', show: true }
    })

    await wrapper.setProps({ inputValue: 'zzz' })
    expect(wrapper.emitted('update:show')?.at(-1)).toEqual([false])
  })
})
