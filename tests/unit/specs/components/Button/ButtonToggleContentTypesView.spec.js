import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import ButtonToggleContentTypesView from '@/components/Button/ButtonToggleContentTypesView'

describe('ButtonToggleContentTypesView.vue', () => {
  let core

  const mountButton = (props = {}) =>
    mount(ButtonToggleContentTypesView, {
      global: { plugins: core.plugins },
      props
    })

  beforeEach(() => {
    core = CoreSetup.init().useAll()
  })

  it('uses "File types view" as the tooltip/aria-label when grouped is true', () => {
    const wrapper = mountButton({ grouped: true })
    expect(wrapper.get('button').attributes('aria-label')).toBe('File types view')
  })

  it('uses "File types by categories view" as the tooltip/aria-label when grouped is false', () => {
    const wrapper = mountButton({ grouped: false })
    expect(wrapper.get('button').attributes('aria-label')).toBe('File types by categories view')
  })

  it('emits update:grouped with the flipped value when clicked', async () => {
    const wrapper = mountButton({ grouped: true })
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('update:grouped')).toEqual([[false]])
  })

  it('flips the tooltip from grouped to flat after the grouped prop changes', async () => {
    const wrapper = mountButton({ grouped: false })
    expect(wrapper.get('button').attributes('aria-label')).toBe('File types by categories view')

    await wrapper.setProps({ grouped: true })
    expect(wrapper.get('button').attributes('aria-label')).toBe('File types view')
  })
})
