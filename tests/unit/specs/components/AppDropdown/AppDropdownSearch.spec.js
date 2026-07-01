import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import AppDropdownSearch from '@/components/AppDropdown/AppDropdownSearch'
import FormControlSearch from '@/components/Form/FormControl/FormControlSearch'

describe('AppDropdownSearch.vue', () => {
  const { plugins } = CoreSetup.init().useAll()

  it('emits the typed query through v-model', async () => {
    const wrapper = mount(AppDropdownSearch, { global: { plugins }, props: { modelValue: '' } })
    wrapper.findComponent(FormControlSearch).vm.$emit('update:modelValue', 'foo')
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:modelValue')).toEqual([['foo']])
  })

  it('shows the no-matches label when hasMatches is false', () => {
    const props = { modelValue: 'x', hasMatches: false, noMatchesLabel: 'Nothing here' }
    const wrapper = mount(AppDropdownSearch, { global: { plugins }, props })
    expect(wrapper.text()).toContain('Nothing here')
  })

  it('forwards keyboard events', () => {
    const wrapper = mount(AppDropdownSearch, { global: { plugins }, props: { modelValue: '' } })
    const search = wrapper.findComponent(FormControlSearch)
    search.vm.$emit('up')
    search.vm.$emit('down')
    search.vm.$emit('enter')
    expect(wrapper.emitted('up')).toHaveLength(1)
    expect(wrapper.emitted('down')).toHaveLength(1)
    expect(wrapper.emitted('enter')).toHaveLength(1)
  })
})
