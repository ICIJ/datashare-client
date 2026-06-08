import { mount } from '@vue/test-utils'

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
    expect(wrapper.find('button.content-types-category-name__toggler').exists()).toBe(true)
  })

  it('gives the caret a category-specific accessible label', () => {
    const wrapper = factory({ collapse: true })
    // The label must name the category so each per-row caret is distinguishable
    // to assistive technology (not a generic "Toggle filter").
    const toggler = wrapper.find('button.content-types-category-name__toggler')
    expect(toggler.attributes('aria-label')).toBe('Toggle the Document category')
  })

  it('reflects the collapsed state via aria-expanded', () => {
    const collapsed = factory({ collapse: true })
    expect(collapsed.find('button.content-types-category-name__toggler').attributes('aria-expanded')).toBe('false')
    const expanded = factory({ collapse: false })
    expect(expanded.find('button.content-types-category-name__toggler').attributes('aria-expanded')).toBe('true')
  })

  it('emits update:collapse with the inverted value when the caret is clicked', async () => {
    const wrapper = factory({ collapse: true })
    await wrapper.find('button.content-types-category-name__toggler').trigger('click')
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
