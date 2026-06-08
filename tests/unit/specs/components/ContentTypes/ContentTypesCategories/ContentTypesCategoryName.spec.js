import { mount } from '@vue/test-utils'
import { ButtonIcon } from '@icij/murmur-next'

import CoreSetup from '~tests/unit/CoreSetup'
import ContentTypesCategoryName from '@/components/ContentTypes/ContentTypesCategories/ContentTypesCategoryName'
import FiltersPanelSectionFilterEntry from '@/components/FiltersPanel/FiltersPanelSectionFilterEntry'

describe('ContentTypesCategoryName.vue', () => {
  let core

  const factory = (props = {}) => {
    core = CoreSetup.init().useAll()
    return mount(ContentTypesCategoryName, {
      global: { plugins: core.plugins },
      props: { category: 'DOCUMENT', count: 3, ...props }
    })
  }

  it('renders a caret toggler button', () => {
    const wrapper = factory({ collapse: true })
    expect(wrapper.findComponent(ButtonIcon).exists()).toBe(true)
  })

  it('emits update:collapse with the inverted value when the caret is clicked', async () => {
    const wrapper = factory({ collapse: true })
    await wrapper.findComponent(ButtonIcon).trigger('click')
    expect(wrapper.emitted('update:collapse')).toStrictEqual([[false]])
  })

  it('emits update:modelValue (selection) without touching collapse when the checkbox changes', async () => {
    const wrapper = factory({ collapse: true, modelValue: false })
    const entry = wrapper.findComponent(FiltersPanelSectionFilterEntry)
    entry.vm.$emit('update:modelValue', true)
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:modelValue')).toStrictEqual([[true]])
    expect(wrapper.emitted('update:collapse')).toBeUndefined()
  })
})
