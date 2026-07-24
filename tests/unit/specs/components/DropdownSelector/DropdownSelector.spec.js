import { mount } from '@vue/test-utils'
import { h } from 'vue'

import CoreSetup from '~tests/unit/CoreSetup'
import DropdownSelector from '@/components/DropdownSelector/DropdownSelector'
import DropdownSelectorSearch from '@/components/DropdownSelector/DropdownSelectorSearch'

// jsdom doesn't implement scrollIntoView; stub it like DocumentContent.spec.js does.
window.HTMLElement.prototype.scrollIntoView = vi.fn()

describe('DropdownSelector.vue', () => {
  const { plugins } = CoreSetup.init().useAll()
  const options = [
    { name: 'a', label: 'A' },
    { name: 'b', label: 'B' },
    { name: 'c', label: 'C' }
  ]

  // Mount with slots that expose the option name so we can assert on text.
  function mountComponent(props = {}) {
    return mount(DropdownSelector, {
      props: { options, optionKey: 'name', teleportDisabled: true, ...props },
      global: { plugins },
      slots: {
        'button-content': ({ selectedOptions }) =>
          h('span', { class: 'button' }, selectedOptions.map(o => o.name).join(',')),
        'item': ({ option, selected, toggle }) =>
          h('span', { class: ['entry', { 'entry--selected': selected }], onClick: e => toggle(e) }, option.name)
      }
    })
  }

  it('renders one dropdown item per option', () => {
    const wrapper = mountComponent({ modelValue: { name: 'a' } })
    expect(wrapper.findAll('.dropdown-item')).toHaveLength(3)
  })

  it('marks the selected option active', () => {
    const wrapper = mountComponent({ modelValue: { name: 'b' } })
    expect(wrapper.find('.dropdown-item.active .entry').text()).toBe('b')
  })

  it('renders the button content from the selected options', () => {
    const wrapper = mountComponent({ modelValue: [{ name: 'a' }, { name: 'b' }], multiple: true })
    expect(wrapper.find('.button').text()).toBe('a,b')
  })

  it('filters options with a custom optionFilter when searchable', async () => {
    const optionFilter = (option, query) => option.name.includes(query)
    const wrapper = mountComponent({ modelValue: { name: 'a' }, searchable: true, optionFilter })
    wrapper.findComponent(DropdownSelectorSearch).vm.$emit('update:modelValue', 'b')
    await wrapper.vm.$nextTick()
    const items = wrapper.findAll('.dropdown-item')
    expect(items).toHaveLength(1)
    expect(items.at(0).find('.entry').text()).toBe('b')
  })

  it('pins the selected option first when pinSelected is set', () => {
    const wrapper = mountComponent({ modelValue: [{ name: 'c' }], multiple: true, pinSelected: true })
    expect(wrapper.findAll('.dropdown-item').at(0).find('.entry').text()).toBe('c')
  })

  it('emits change on close only when the value changed', async () => {
    const wrapper = mountComponent({ modelValue: { name: 'a' } })
    wrapper.findComponent({ name: 'BDropdown' }).vm.$emit('shown')
    wrapper.findComponent({ name: 'BDropdown' }).vm.$emit('hidden')
    expect(wrapper.emitted('change')).toBeUndefined()

    wrapper.findComponent({ name: 'BDropdown' }).vm.$emit('shown')
    await wrapper.setProps({ modelValue: { name: 'b' } })
    wrapper.findComponent({ name: 'BDropdown' }).vm.$emit('hidden')
    expect(wrapper.emitted('change')).toHaveLength(1)
  })

  it('teleports the menu to body by default', () => {
    const wrapper = mount(DropdownSelector, {
      props: { options, optionKey: 'name', modelValue: { name: 'a' } },
      global: { plugins },
      slots: { 'button-content': () => 'x', 'item': ({ option }) => option.name }
    })
    expect(wrapper.findComponent({ name: 'BDropdown' }).props('teleportTo')).toBe('body')
  })
})
