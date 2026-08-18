import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import DocumentContentDropdown from '@/components/Document/DocumentContentDropdown'

describe('DocumentContentDropdown.vue', () => {
  const factory = (props = {}) => {
    const { plugins } = CoreSetup.init().useAll()

    return mount(DocumentContentDropdown, {
      props: { modelValue: true, ...props },
      global: { plugins, stubs: { teleport: true } }
    })
  }

  const findMarkdownEntry = wrapper => wrapper.find('.document-content-dropdown__markdown')
  const findTextEntry = wrapper => wrapper.find('.document-content-dropdown__text')

  it('teleports the dropdown menu to the body so it is not clipped by an ancestor stacking context', () => {
    const dropdown = factory().findComponent({ name: 'BDropdown' })
    expect(dropdown.props('teleportTo')).toBe('body')
  })

  it('constrains the dropdown menu to the viewport boundary', () => {
    const dropdown = factory().findComponent({ name: 'BDropdown' })
    expect(dropdown.props('boundary')).toBe('viewport')
  })

  it('gives the icon-only toggle an accessible name', () => {
    const dropdown = factory().findComponent({ name: 'BDropdown' })
    expect(dropdown.props('ariaLabel')).toBe('Text rendering')
  })

  it('marks the formatted entry as the active one when markdown is preferred', () => {
    const wrapper = factory({ modelValue: true })
    expect(findMarkdownEntry(wrapper).classes()).toContain('active')
    expect(findTextEntry(wrapper).classes()).not.toContain('active')
  })

  it('marks the plain text entry as the active one when markdown is not preferred', () => {
    const wrapper = factory({ modelValue: false })
    expect(findMarkdownEntry(wrapper).classes()).not.toContain('active')
    expect(findTextEntry(wrapper).classes()).toContain('active')
  })

  it('prefers markdown when the formatted entry is clicked', async () => {
    const wrapper = factory({ modelValue: false })
    await findMarkdownEntry(wrapper).trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[true]])
  })

  it('drops the markdown preference when the plain text entry is clicked', async () => {
    const wrapper = factory({ modelValue: true })
    await findTextEntry(wrapper).trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
  })

  it('puts the formatted entry out of reach when the artifact holds no markdown', () => {
    const wrapper = factory({ modelValue: false, markdownDisabled: true })
    expect(findMarkdownEntry(wrapper).attributes('disabled')).toBeDefined()
    expect(findTextEntry(wrapper).attributes('disabled')).toBeUndefined()
  })

  describe('when a translation is displayed', () => {
    const factoryWithTranslation = () => factory({ modelValue: true, translation: true })

    it('marks plain text as active, since that is what the body actually shows', () => {
      const wrapper = factoryWithTranslation()
      expect(findMarkdownEntry(wrapper).classes()).not.toContain('active')
      expect(findTextEntry(wrapper).classes()).toContain('active')
    })

    it('puts both entries out of reach', () => {
      const wrapper = factoryWithTranslation()
      expect(findMarkdownEntry(wrapper).attributes('disabled')).toBeDefined()
      expect(findTextEntry(wrapper).attributes('disabled')).toBeDefined()
    })

    it('states the reason in the menu, where a title tooltip would be invisible to touch and keyboard users', () => {
      const wrapper = factoryWithTranslation()
      const reason = wrapper.find('.document-content-dropdown__reason')
      expect(reason.text()).toBe('Translations are only available as plain text')
    })

    it('says nothing about translations when none is displayed', () => {
      const wrapper = factory({ modelValue: true })
      expect(wrapper.find('.document-content-dropdown__reason').exists()).toBe(false)
    })
  })
})
