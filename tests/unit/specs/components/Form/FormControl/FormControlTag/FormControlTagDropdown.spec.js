import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import FormControlTagDropdown from '@/components/Form/FormControl/FormControlTag/FormControlTagDropdown'

describe('FormControlTagDropdown', () => {
  let plugins

  beforeEach(() => {
    const core = CoreSetup.init().useAll()
    plugins = core.plugins
  })

  const options = ['apple', 'banana', 'apricot', 'cherry']

  it('shows no options when the input is empty', () => {
    // Suggestions only appear once the user has typed at least one character.
    const wrapper = mount(FormControlTagDropdown, {
      global: { plugins },
      props: { options, modelValue: [], inputValue: '', show: true }
    })

    expect(wrapper.vm.filteredOptions).toEqual([])
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

  it('emits update:show false when the input is cleared', async () => {
    // Clearing the field empties the suggestions, so the dropdown closes.
    const wrapper = mount(FormControlTagDropdown, {
      global: { plugins },
      props: { options, modelValue: [], inputValue: 'ap', show: true }
    })

    await wrapper.setProps({ inputValue: '' })
    expect(wrapper.emitted('update:show')?.at(-1)).toEqual([false])
  })

  it('returns no options when the input is empty even if some are already selected', () => {
    const wrapper = mount(FormControlTagDropdown, {
      global: { plugins },
      props: { options, modelValue: ['apple'], inputValue: '', show: true, noDuplicates: true }
    })

    expect(wrapper.vm.filteredOptions).toEqual([])
  })

  it('includes already-selected options in Fuse search results with noDuplicates', async () => {
    const wrapper = mount(FormControlTagDropdown, {
      global: { plugins },
      props: { options, modelValue: ['apple'], inputValue: 'ap', show: true, noDuplicates: true }
    })

    const items = wrapper.vm.filteredOptions.map(o => o.item)
    expect(items).toContain('apple')
  })

  it('marks an option as active regardless of case', () => {
    const wrapper = mount(FormControlTagDropdown, {
      global: { plugins },
      props: { options, modelValue: ['APPLE'], inputValue: 'ap', show: true }
    })

    const appleOption = wrapper.vm.filteredOptions.find(o => o.item === 'apple')
    expect(wrapper.vm.hasOption(appleOption)).toBe(true)
  })
})
