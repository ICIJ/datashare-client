import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import ButtonToggleAdvancedSearch from '@/components/Button/ButtonToggleAdvancedSearch'

describe('ButtonToggleAdvancedSearch.vue', () => {
  let core

  const mountButton = (props = {}) =>
    mount(ButtonToggleAdvancedSearch, {
      global: { plugins: core.plugins },
      props
    })

  beforeEach(() => {
    core = CoreSetup.init().useAll()
  })

  it('does not look pressed anymore once the modal is closed', async () => {
    const wrapper = mountButton({ active: false })
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('update:active')).toEqual([[true]])

    // The parent owns the model: it echoes the click back, then flips it again
    // when the modal closes itself (cancel, escape, backdrop…).
    await wrapper.setProps({ active: true })
    await wrapper.setProps({ active: false })

    expect(wrapper.get('button').classes()).toContain('btn-outline-tertiary')
    expect(wrapper.get('button').classes()).not.toContain('active')
    expect(wrapper.get('button').attributes('aria-pressed')).toBeUndefined()
  })
})
