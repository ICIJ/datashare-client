import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import AppModalHeader from '@/components/AppModal/AppModalHeader'

describe('AppModalHeader.vue', () => {
  let core

  beforeEach(() => {
    core = CoreSetup.init().useAll()
  })

  it('does not leave the close button pressed after it has been clicked', async () => {
    const wrapper = mount(AppModalHeader, { global: { plugins: core.plugins } })
    const close = wrapper.get('.app-modal-header__close')

    await close.trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
    expect(close.attributes('aria-pressed')).toBeUndefined()
    expect(close.classes()).not.toContain('active')
  })
})
