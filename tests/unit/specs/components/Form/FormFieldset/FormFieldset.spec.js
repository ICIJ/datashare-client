import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import FormFieldset from '@/components/Form/FormFieldset/FormFieldset.vue'

describe('FormFieldset.vue', () => {
  let global

  beforeEach(() => {
    const core = CoreSetup.init().useAll()
    global = { plugins: core.plugins }
  })

  function shallowMountComponent(props = {}) {
    return shallowMount(FormFieldset, { global, props })
  }

  describe('compact prop override', () => {
    it('passes description to BFormGroup when compact=true', () => {
      const wrapper = shallowMountComponent({ compact: true, description: 'Helper text', label: 'Field' })
      expect(wrapper.findComponent({ name: 'BFormGroup' }).props('description')).toBe('Helper text')
    })

    it('passes null description to BFormGroup when compact=false', () => {
      const wrapper = shallowMountComponent({ compact: false, description: 'Helper text', label: 'Field' })
      expect(wrapper.findComponent({ name: 'BFormGroup' }).props('description')).toBeNull()
    })

    it('renders without error when compact prop is not provided', () => {
      const wrapper = shallowMountComponent({ description: 'Helper text', label: 'Field' })
      expect(wrapper.findComponent({ name: 'BFormGroup' }).exists()).toBe(true)
    })
  })
})
