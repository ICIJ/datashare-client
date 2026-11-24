import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import AppSpinner from '@/components/AppSpinner/AppSpinner'

describe('AppSpinner.vue', () => {
  let core

  beforeEach(() => {
    core = CoreSetup.init().useAll()
  })

  it('announces the loading state to screen readers', () => {
    const wrapper = mount(AppSpinner, { global: { plugins: core.plugins } })
    const status = wrapper.get('[role="status"]')
    expect(status.get('.visually-hidden').text()).toBe('Loading...')
  })
})
