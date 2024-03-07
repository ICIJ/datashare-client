import { createLocalVue, shallowMount } from '@vue/test-utils'
import { setCookie, removeCookie } from 'tiny-cookie'

import { Core } from '@/core'
import { flushPromises } from '~tests/unit/tests_utils'
import { expect } from 'vitest'

describe('guards', () => {
  describe('checkUserAuthentication', () => {
    let wrapper = null

    beforeEach(async () => {
      const { localVue, router, config } = Core.init(createLocalVue()).useAll()
      config.set('mode', 'SERVER')
      config.set('projects', ['local-datashare'])
      router.addRoute({ path: '/pub', name: 'pub', meta: { skipsAuth: true } })
      wrapper = shallowMount({ template: '<router-view />' }, { localVue, router })
      await flushPromises()
      await wrapper.vm.$router.replace({ name: 'pub' }).catch(vi.fn())
    })

    it('should redirect to /login if no cookie', async () => {
      removeCookie(process.env.VITE_DS_COOKIE_NAME)
      await expect(() => {
        return wrapper.vm.$router.push({ name: 'settings' })
      }).rejects.toThrowError()
    })

    it('should redirect to /login if cookie is null', async () => {
      setCookie(process.env.VITE_DS_COOKIE_NAME, null)
      await expect(() => {
        return wrapper.vm.$router.push({ name: 'settings' })
      }).rejects.toThrowError()
    })

    it('should redirect to /login if cookie has no login property', async () => {
      setCookie(process.env.VITE_DS_COOKIE_NAME, 'yolo', JSON.stringify)
      await expect(() => {
        return wrapper.vm.$router.push({ name: 'settings' })
      }).rejects.toThrowError()
    })

    it('should not redirect to /login when we have the right cookie', async () => {
      setCookie(process.env.VITE_DS_COOKIE_NAME, { login: 'yolo' }, JSON.stringify)
      await wrapper.vm.$router.push({ name: 'settings' })
      expect(wrapper.vm.$route.name).toBe('settings')
    })
  })

  describe('checkMode', () => {
    let wrapper

    beforeEach(async () => {
      setCookie(process.env.VITE_DS_COOKIE_NAME, { login: 'yolo' }, JSON.stringify)
      const { localVue, router, config } = Core.init(createLocalVue()).useAll()
      config.set('mode', 'SERVER')
      config.set('projects', ['local-datashare'])
      router.addRoute({ path: '/pub', name: 'pub', meta: { skipsAuth: true } })
      wrapper = shallowMount({ template: '<router-view />' }, { localVue, router })
      await flushPromises()
      await wrapper.vm.$router.replace({ name: 'pub' }).catch(vi.fn())
    })

    it('should redirect task.analysis.list to error in SERVER mode', async () => {
      wrapper.vm.$config.set('mode', 'SERVER')
      await expect(() => {
        return wrapper.vm.$router.push({ name: 'task.analysis.list' })
      }).rejects.toThrowError()
    })

    it('should not redirect task.analysis.list to error in LOCAL mode', async () => {
      wrapper.vm.$config.set('mode', 'LOCAL')
      await wrapper.vm.$router.push({ name: '' }).catch(vi.fn())
      expect(wrapper.vm.$route.name).not.toBe('error')
    })

    it('should redirect project.new to error in SERVER mode', async () => {
      wrapper.vm.$config.set('mode', 'SERVER')
      await expect(() => {
        return wrapper.vm.$router.push({ name: 'project.new' })
      }).rejects.toThrowError()
    })

    it('should not redirect project.new to error in LOCAL mode', async () => {
      wrapper.vm.$config.set('mode', 'LOCAL')
      await wrapper.vm.$router.push({ name: 'project.new' }).catch(vi.fn())
      expect(wrapper.vm.$route.name).not.toBe('error')
    })

    it('should not redirect project.new to error in EMBEDDED mode', async () => {
      wrapper.vm.$config.set('mode', 'EMBEDDED')
      await wrapper.vm.$router.push({ name: 'project.new' }).catch(vi.fn())
      expect(wrapper.vm.$route.name).not.toBe('error')
    })
  })
})
