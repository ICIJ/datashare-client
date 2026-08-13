import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import AppPopover from '@/components/AppPopover/AppPopover'

describe('AppPopover.vue', () => {
  const { plugins } = CoreSetup.init().useAll()

  // The real b-popover never toggles `display` under jsdom, so open/close through
  // the rendered popover can't be asserted here (see the fix report). This instead
  // checks the `v-model` directly: the Escape handler flips it via `update:modelValue`,
  // which a removed or misguarded handler would never emit.
  function pressEscape() {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
  }

  // Without a target slot, floating-ui has no reference element to anchor to and
  // throws an unhandled rejection once the popover is visible, so every mount here
  // provides one, matching how the popover is used everywhere else in the app.
  function mountPopover(props) {
    return mount(AppPopover, {
      global: { plugins },
      props,
      slots: { target: '<button>Target</button>' }
    })
  }

  it('should close the popover on Escape when it is visible', async () => {
    const wrapper = mountPopover({ modelValue: true })

    pressEscape()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
    wrapper.unmount()
  })

  it('should not emit anything on Escape when the popover is already hidden', async () => {
    const wrapper = mountPopover({ modelValue: false })

    pressEscape()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })
})
