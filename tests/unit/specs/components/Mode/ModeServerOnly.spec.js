import { flushPromises, mount } from '@vue/test-utils'
import { describe } from 'vitest'

import CoreSetup from '~tests/unit/CoreSetup'
import { MODE_NAME } from '@/mode'
import ModeServerOnly from '@/components/Mode/ModeServerOnly'

describe('ModeServerOnly.vue', () => {
  let wrapper, core

  beforeAll(() => {
    core = CoreSetup.init().useAll()
  })

  describe('when the initial mode is `SERVER`', () => {
    beforeEach(async () => {
      core.config.set('mode', MODE_NAME.SERVER)
      const slots = { default: 'foo' }
      const global = { plugins: core.plugins }
      wrapper = mount(ModeServerOnly, { global, slots })
    })

    it('should display "foo"', async () => {
      expect(wrapper.text()).toBe('foo')
    })

    it('should hide "foo" reactivly in `LOCAL`', async () => {
      core.config.set('mode', MODE_NAME.LOCAL)
      await flushPromises()
      expect(wrapper.text()).not.toBe('foo')
    })

    it('should hide "foo" reactivly in `EMBEDDED`', async () => {
      core.config.set('mode', MODE_NAME.EMBEDDED)
      await flushPromises()
      expect(wrapper.text()).not.toBe('foo')
    })
  })

  describe('when the initial mode is `LOCAL`', () => {
    beforeEach(async () => {
      core.config.set('mode', MODE_NAME.LOCAL)
      const slots = { default: 'foo' }
      const global = { plugins: core.plugins }
      wrapper = mount(ModeServerOnly, { global, slots })
    })

    it('should not display "foo"', async () => {
      expect(wrapper.text()).not.toBe('foo')
    })

    it('should show "foo" reactivly in `SERVER`', async () => {
      core.config.set('mode', MODE_NAME.SERVER)
      await flushPromises()
      expect(wrapper.text()).toBe('foo')
    })
  })

  describe('when the initial mode is `EMBEDDED`', () => {
    beforeEach(async () => {
      core.config.set('mode', MODE_NAME.EMBEDDED)
      const slots = { default: 'foo' }
      const global = { plugins: core.plugins }
      wrapper = mount(ModeServerOnly, { global, slots })
    })

    it('should not display "foo"', async () => {
      expect(wrapper.text()).not.toBe('foo')
    })

    it('should show "foo" reactivly in `SERVER`', async () => {
      core.config.set('mode', MODE_NAME.SERVER)
      await flushPromises()
      expect(wrapper.text()).toBe('foo')
    })
  })
})
