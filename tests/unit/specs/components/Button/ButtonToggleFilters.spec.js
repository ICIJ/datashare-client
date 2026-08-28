import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import ButtonToggleFilters from '@/components/Button/ButtonToggleFilters'

describe('ButtonToggleFilters.vue', () => {
  let core

  const mountButton = (props = {}) =>
    mount(ButtonToggleFilters, {
      global: { plugins: core.plugins },
      props
    })

  beforeEach(() => {
    core = CoreSetup.init().useAll()
  })

  it('does not look pressed anymore once the panel is closed', async () => {
    const wrapper = mountButton({ active: false })
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('update:active')).toEqual([[true]])

    // The parent owns the model: it echoes the click back, then flips it again
    // when the panel closes itself.
    await wrapper.setProps({ active: true })
    await wrapper.setProps({ active: false })

    expect(wrapper.get('button').classes()).toContain('btn-outline-tertiary')
    expect(wrapper.get('button').classes()).not.toContain('active')
    expect(wrapper.get('button').attributes('aria-pressed')).toBeUndefined()
  })
})
