import { mount } from '@vue/test-utils'
import { ref } from 'vue'

import { refWhenever } from '@/composables/refWhenever'

describe('refWhenever', () => {
  let source

  function factory(setup, template = '<div></div>') {
    return mount({ setup, template })
  }

  beforeEach(() => {
    source = ref(false)
  })

  it('should initialize triggered to false', () => {
    const wrapper = factory(() => {
      const triggered = refWhenever(source)
      return { triggered }
    })

    expect(wrapper.vm.triggered).toBe(false)
  })

  it('should set triggered to true when condition is already met', async () => {
    const wrapper = factory(() => {
      const open = ref(true)
      const openedOnce = refWhenever(open)
      return { openedOnce }
    })

    expect(wrapper.vm.openedOnce).toBe(true)
  })

  it('should set triggered to true when value changes', async () => {
    const wrapper = factory(() => {
      const open = ref(false)
      const openedOnce = refWhenever(open)
      return { open, openedOnce }
    })

    expect(wrapper.vm.openedOnce).toBe(false)
    wrapper.vm.open = true
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.openedOnce).toBe(true)
  })

  it('should set triggered to true when value changes and stay true', async () => {
    const wrapper = factory(() => {
      const open = ref(false)
      const openedOnce = refWhenever(open)
      return { open, openedOnce }
    })

    expect(wrapper.vm.openedOnce).toBe(false)
    wrapper.vm.open = true
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.openedOnce).toBe(true)
    wrapper.vm.open = false
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.openedOnce).toBe(true)
  })

  it('should set triggered to false when value changes with a condition', async () => {
    const wrapper = factory(() => {
      const open = ref(true)
      const closedOnce = refWhenever(open, value => !value)
      return { open, closedOnce }
    })

    expect(wrapper.vm.closedOnce).toBe(false)
    wrapper.vm.open = false
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.closedOnce).toBe(true)
  })

  it('should set triggered to false when value changes and stay false with a condition', async () => {
    const wrapper = factory(() => {
      const open = ref(true)
      const closedOnce = refWhenever(open, value => !value)
      return { open, closedOnce }
    })

    expect(wrapper.vm.closedOnce).toBe(false)
    wrapper.vm.open = false
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.closedOnce).toBe(true)
    wrapper.vm.open = true
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.closedOnce).toBe(true)
  })
})
