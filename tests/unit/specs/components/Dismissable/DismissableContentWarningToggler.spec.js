import { shallowMount } from '@vue/test-utils'

import { ButtonIcon } from '@icij/murmur-next'

import CoreSetup from '~tests/unit/CoreSetup'
import DismissableContentWarningToggler from '@/components/Dismissable/DismissableContentWarningToggler.vue'

describe('DismissableContentWarningToggler.vue', () => {
  let global

  beforeEach(() => {
    const core = CoreSetup.init().useAll()
    global = { plugins: core.plugins, renderStubDefaultSlot: true }
  })

  function shallowMountComponent(props = {}, modelValue = true) {
    return shallowMount(DismissableContentWarningToggler, {
      global,
      props: { modelValue, ...props },
    })
  }

  it('renders the default title', () => {
    const wrapper = shallowMountComponent()
    expect(wrapper.find('.dismissable-content-warning-toggler__title').text()).toBe('Content Warning')
  })

  it('renders the default description when no prop is provided', () => {
    const wrapper = shallowMountComponent()
    expect(wrapper.find('.dismissable-content-warning-toggler__description').text()).toContain(
      'This media may contain sensitive content'
    )
  })

  it('renders the description prop when provided', () => {
    const wrapper = shallowMountComponent({ description: 'Custom warning text' })
    expect(wrapper.find('.dismissable-content-warning-toggler__description').text()).toContain('Custom warning text')
  })

  it('emits update:modelValue with toggled value when the button is clicked', async () => {
    const wrapper = shallowMountComponent({}, true)
    await wrapper.findComponent(ButtonIcon).trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0][0]).toBe(false)
  })

  it('emits update:modelValue with true when modelValue is false and button is clicked', async () => {
    const wrapper = shallowMountComponent({}, false)
    await wrapper.findComponent(ButtonIcon).trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0][0]).toBe(true)
  })

  it('renders a custom title slot', () => {
    const wrapper = shallowMount(DismissableContentWarningToggler, {
      global,
      props: { modelValue: true },
      slots: { title: 'My Custom Title' },
    })
    expect(wrapper.find('.dismissable-content-warning-toggler__title').text()).toBe('My Custom Title')
  })

  it('renders a custom description slot', () => {
    const wrapper = shallowMount(DismissableContentWarningToggler, {
      global,
      props: { modelValue: true },
      slots: { description: 'My Custom Description' },
    })
    expect(wrapper.find('.dismissable-content-warning-toggler__description').text()).toContain('My Custom Description')
  })
})
