import { shallowMount } from '@vue/test-utils'
import { defineComponent } from 'vue'

import CoreSetup from '~tests/unit/CoreSetup'
import DismissableAlertEditable from '@/components/Dismissable/DismissableAlertEditable.vue'
import DismissableAlert from '@/components/Dismissable/DismissableAlert.vue'
import VariantDropdown from '@/components/VariantDropdown/VariantDropdown.vue'
import DismissableInputEditable from '@/components/Dismissable/DismissableInputEditable.vue'

const DismissableAlertStub = defineComponent({
  props: {
    variant: { type: String, default: 'info' },
    noButton: { type: Boolean },
    noClose: { type: Boolean },
    contentClass: { type: [String, Object, Array], default: '' },
  },
  template: '<div><slot name="icon" /><slot /></div>',
})

describe('DismissableAlertEditable.vue', () => {
  let core, global

  beforeAll(() => {
    core = CoreSetup.init().useAll()
  })

  beforeEach(() => {
    core.createPinia()
    global = {
      plugins: core.plugins,
      stubs: { DismissableAlert: DismissableAlertStub },
    }
  })

  function shallowMountComponent(props = {}, modelValue = '') {
    return shallowMount(DismissableAlertEditable, {
      global,
      props: { modelValue, ...props },
    })
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

  it('renders VariantDropdown for variant selection', () => {
    const wrapper = shallowMountComponent()
    expect(wrapper.findComponent(VariantDropdown).exists()).toBe(true)
  })

  it('binds modelValue to VariantDropdown', () => {
    const wrapper = shallowMountComponent({ variant: 'danger' })
    expect(wrapper.findComponent(VariantDropdown).props('modelValue')).toBe('danger')
  })

  it('renders DismissableInputEditable', () => {
    const wrapper = shallowMountComponent({}, 'Hello')
    expect(wrapper.findComponent(DismissableInputEditable).exists()).toBe(true)
  })

  it('passes placeholder to DismissableInputEditable', () => {
    const wrapper = shallowMountComponent({ placeholder: 'Enter text…' })
    expect(wrapper.findComponent(DismissableInputEditable).props('placeholder')).toBe('Enter text…')
  })
})
