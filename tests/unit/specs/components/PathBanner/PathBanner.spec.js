import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import PathBanner from '@/components/PathBanner/PathBanner.vue'
import DismissableAlert from '@/components/Dismissable/DismissableAlert.vue'
import DismissableContentWarningToggler from '@/components/Dismissable/DismissableContentWarningToggler.vue'

describe('PathBanner.vue', () => {
  let core, global

  beforeAll(() => {
    core = CoreSetup.init().useAll()
  })

  beforeEach(() => {
    core.createPinia()
    global = { plugins: core.plugins, renderStubDefaultSlot: true }
  })

  function shallowMountComponent(props = {}) {
    return shallowMount(PathBanner, { global, props })
  }

  it('renders a DismissableAlert', () => {
    const wrapper = shallowMountComponent()
    expect(wrapper.findComponent(DismissableAlert).exists()).toBe(true)
  })

  it('passes variant to DismissableAlert', () => {
    const wrapper = shallowMountComponent({ variant: 'warning' })
    expect(wrapper.findComponent(DismissableAlert).props('variant')).toBe('warning')
  })

  it('defaults variant to "info"', () => {
    const wrapper = shallowMountComponent()
    expect(wrapper.findComponent(DismissableAlert).props('variant')).toBe('info')
  })

  it('renders the note text', () => {
    const wrapper = shallowMountComponent({ note: 'Hello world' })
    expect(wrapper.text()).toContain('Hello world')
  })

  it('does not render DismissableContentWarningToggler when sensitive is false', () => {
    const wrapper = shallowMountComponent({ sensitive: false })
    expect(wrapper.findComponent(DismissableContentWarningToggler).exists()).toBe(false)
  })

  it('renders DismissableContentWarningToggler when sensitive is true', () => {
    const wrapper = shallowMountComponent({ sensitive: true })
    expect(wrapper.findComponent(DismissableContentWarningToggler).exists()).toBe(true)
  })
})
