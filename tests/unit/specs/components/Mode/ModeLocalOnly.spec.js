import { flushPromises, mount } from '@vue/test-utils'
import { describe } from 'vitest'

import CoreSetup from '~tests/unit/CoreSetup'
import { MODE_NAME } from '@/mode'
import ModeLocalOnly from '@/components/Mode/ModeLocalOnly'

describe('ModeLocalOnly.vue', () => {
  let wrapper, core

  beforeAll(() => {
    core = CoreSetup.init().useAll()
  })

  describe('when the initial mode is `LOCAL`', () => {
    beforeEach(async () => {
      core.config.set('mode', MODE_NAME.LOCAL)
      const slots = { default: 'foo' }
      const global = { plugins: core.plugins }
      wrapper = mount(ModeLocalOnly, { global, slots })
    })

    it('should display "foo"', async () => {
      expect(wrapper.text()).toBe('foo')
    })

    it('should show "foo" reactivly in `EMBEDDED`', async () => {
      core.config.set('mode', MODE_NAME.EMBEDDED)
      await flushPromises()
      expect(wrapper.text()).toBe('foo')
    })

    it('should hide "foo" reactivly in `SERVER`', async () => {
      core.config.set('mode', MODE_NAME.SERVER)
      await flushPromises()
      expect(wrapper.text()).not.toBe('foo')
    })
  })

  describe('when the initial mode is `LOCAL` and props strict is true', () => {
    beforeEach(async () => {
      core.config.set('mode', MODE_NAME.LOCAL)
      const slots = { default: 'foo' }
      const global = { plugins: core.plugins }
      const props = { strict: true }
      wrapper = mount(ModeLocalOnly, { global, slots, props })
    })

    it('should display "foo"', async () => {
      expect(wrapper.text()).toBe('foo')
    })

    it('should hide "foo" reactivly in `EMBEDDED`', async () => {
      core.config.set('mode', MODE_NAME.EMBEDDED)
      await flushPromises()
      expect(wrapper.text()).not.toBe('foo')
    })

    it('should hide "foo" reactivly in `SERVER`', async () => {
      core.config.set('mode', MODE_NAME.SERVER)
      await flushPromises()
      expect(wrapper.text()).not.toBe('foo')
    })
  })

  describe('when the initial mode is `EMBEDDED`', () => {
    beforeEach(async () => {
      core.config.set('mode', MODE_NAME.EMBEDDED)
      const slots = { default: 'foo' }
      const global = { plugins: core.plugins }
      wrapper = mount(ModeLocalOnly, { global, slots })
    })

    it('should display "foo"', async () => {
      expect(wrapper.text()).toBe('foo')
    })

    it('should hide "foo" reactivly in `SERVER`', async () => {
      core.config.set('mode', MODE_NAME.SERVER)
      await flushPromises()
      expect(wrapper.text()).not.toBe('foo')
    })

    it('should show "foo" reactivly in `LOCAL`', async () => {
      core.config.set('mode', MODE_NAME.LOCAL)
      await flushPromises()
      expect(wrapper.text()).toBe('foo')
    })
  })

  describe('when the initial mode is `SERVER`', () => {
    beforeEach(async () => {
      core.config.set('mode', MODE_NAME.SERVER)
      const slots = { default: 'foo' }
      const global = { plugins: core.plugins }
      wrapper = mount(ModeLocalOnly, { global, slots })
    })

    it('should not display "foo"', async () => {
      expect(wrapper.text()).not.toBe('foo')
    })

    it('should show "foo" reactivly in `LOCAL`', async () => {
      core.config.set('mode', MODE_NAME.LOCAL)
      await flushPromises()
      expect(wrapper.text()).toBe('foo')
    })
  })
})
