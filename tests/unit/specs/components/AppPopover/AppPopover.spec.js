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

  // Same as mountPopover, but attached to the document with a reactive v-model,
  // for the specs asserting where the focus actually lands.
  function mountAttachedPopover() {
    const wrapper = mount(AppPopover, {
      global: { plugins },
      props: {
        'modelValue': false,
        'onUpdate:modelValue': modelValue => wrapper.setProps({ modelValue })
      },
      slots: { target: '<button class="opener">Target</button>' },
      attachTo: document.body
    })
    return wrapper
  }

  afterEach(() => {
    document.body.innerHTML = ''
  })

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

  it('should consume Escape before it reaches a surrounding modal-style listener', async () => {
    // BModal closes on an Escape listener scoped to its own element, so an open
    // popover inside a modal must stop the key before it bubbles up to it.
    const modalKeydown = vi.fn()
    document.body.addEventListener('keydown', modalKeydown)
    const wrapper = mountAttachedPopover()
    await wrapper.setProps({ modelValue: true })

    const opener = wrapper.find('.opener').element
    opener.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await wrapper.vm.$nextTick()

    expect(wrapper.props('modelValue')).toBe(false)
    expect(modalKeydown).not.toHaveBeenCalled()
    document.body.removeEventListener('keydown', modalKeydown)
    wrapper.unmount()
  })

  it('should hand focus back to the opener on Escape', async () => {
    const wrapper = mountAttachedPopover()
    const opener = wrapper.find('.opener').element
    opener.focus()
    expect(document.activeElement).toBe(opener)

    // Opening moves focus into the teleported content, which is where a keyboard
    // user would press Escape from. Blurring stands in for that here, since the
    // popover body is not focusable under jsdom.
    await wrapper.setProps({ modelValue: true })
    opener.blur()
    expect(document.activeElement).not.toBe(opener)

    pressEscape()
    await wrapper.vm.$nextTick()

    expect(document.activeElement).toBe(opener)
    wrapper.unmount()
  })

  it('should hand focus back to the opener no matter how the popover is closed', async () => {
    const wrapper = mountAttachedPopover()
    const opener = wrapper.find('.opener').element
    opener.focus()

    await wrapper.setProps({ modelValue: true })
    opener.blur()

    // Closing through the v-model covers every non-Escape path (a click
    // outside or the header close button both end up flipping it).
    await wrapper.setProps({ modelValue: false })

    expect(document.activeElement).toBe(opener)
    wrapper.unmount()
  })

  it('should leave focus alone when the user moved it to another control', async () => {
    const input = document.createElement('input')
    document.body.appendChild(input)
    const wrapper = mountAttachedPopover()
    const opener = wrapper.find('.opener').element
    opener.focus()

    await wrapper.setProps({ modelValue: true })
    // A click outside on a focusable control focuses it before the popover
    // closes: handing focus back to the opener would steal it from the user.
    input.focus()
    await wrapper.setProps({ modelValue: false })

    expect(document.activeElement).toBe(input)
    wrapper.unmount()
  })

  it('should capture the opener even when mounted already open', async () => {
    const opener = document.createElement('button')
    document.body.appendChild(opener)
    opener.focus()

    const wrapper = mountPopover({ modelValue: true })
    opener.blur()
    pressEscape()
    await wrapper.vm.$nextTick()

    expect(document.activeElement).toBe(opener)
    wrapper.unmount()
  })
})
