import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import FieldDropdownSelector from '@/components/FieldDropdownSelector/FieldDropdownSelector'
import settings from '@/utils/settings'

describe('FieldDropdownSelector.vue', () => {
  const { plugins } = CoreSetup.init().useAll().useRouterWithoutGuards()

  function mountComponent(props = {}) {
    return mount(FieldDropdownSelector, {
      props: { teleportDisabled: true, ...props },
      global: { plugins }
    })
  }

  it('renders one item per configured search field', () => {
    const wrapper = mountComponent({ modelValue: 'all' })
    expect(wrapper.findAll('.dropdown-item')).toHaveLength(settings.searchFields.length)
  })

  it('shows the translated label of the selected field in the button', () => {
    const wrapper = mountComponent({ modelValue: 'all' })
    expect(wrapper.find('.dropdown-toggle').text().trim()).toBe('All fields')
  })

  it('marks the selected field active with its translated label', () => {
    const wrapper = mountComponent({ modelValue: 'tags' })
    expect(wrapper.find('.dropdown-item.active').text().trim()).toBe('Tags')
  })

  it('emits update:modelValue when another field is clicked', async () => {
    const wrapper = mountComponent({ modelValue: 'all' })
    // Click the "Tags" option (second search field).
    const tagsItem = wrapper.findAll('.dropdown-item').at(1)
    await tagsItem.find('.field-dropdown-selector__option').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([['tags']])
  })
})
