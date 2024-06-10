import { shallowMount } from '@vue/test-utils'
import { setCookie, removeCookie } from 'tiny-cookie'
import { expect } from 'vitest'

import { flushPromises } from '~tests/unit/tests_utils'
import CoreSetup from '~tests/unit/CoreSetup'

describe('guards', () => {
  const { router, plugins, config } = CoreSetup.init().useAll().useRouter()

  describe('checkUserAuthentication', () => {
    let wrapper

    beforeEach(async () => {
      config.set('mode', 'SERVER')
      config.set('projects', ['local-datashare'])
      router.addRoute({ path: '/pub', name: 'pub', meta: { skipsAuth: true } })
      wrapper = shallowMount({ template: '<router-view />' }, { global: { plugins } })
      await flushPromises()
      await router.replace({ name: 'pub' }).catch(vi.fn())
    })

    it('should redirect to /login if no cookie', async () => {
      removeCookie(process.env.VITE_DS_COOKIE_NAME)
      await router.push({ name: 'settings' })
      expect(router.currentRoute.value.name).toBe('login')
    })

    it('should redirect to /login if cookie is null', async () => {
      setCookie(process.env.VITE_DS_COOKIE_NAME, null)
      await router.push({ name: 'settings' })
      expect(router.currentRoute.value.name).toBe('login')
    })

    it('should redirect to /login if cookie has no login property', async () => {
      setCookie(process.env.VITE_DS_COOKIE_NAME, 'yolo', JSON.stringify)
      await router.push({ name: 'settings' })
      expect(router.currentRoute.value.name).toBe('login')
    })

    it('should not redirect to /login when we have the right cookie', async () => {
      setCookie(process.env.VITE_DS_COOKIE_NAME, { login: 'yolo' }, JSON.stringify)
      await router.push({ name: 'settings' })
      expect(router.currentRoute.value.name).toBe('settings')
    })
  })

  describe('checkMode', () => {
    let wrapper

    beforeEach(async () => {
      setCookie(process.env.VITE_DS_COOKIE_NAME, { login: 'yolo' }, JSON.stringify)
      config.set('mode', 'SERVER')
      config.set('projects', ['local-datashare'])
      router.addRoute({ path: '/pub', name: 'pub', meta: { skipsAuth: true } })
      wrapper = shallowMount({ template: '<router-view />' }, { global: { plugins } })
      await flushPromises()
      await router.replace({ name: 'pub' })
    })

    it('should redirect task.analysis.list to error in SERVER mode', async () => {
      config.set('mode', 'SERVER')
      await router.push({ name: 'task.analysis.list' })
      expect(router.currentRoute.value.name).toBe('error')
    })

    it('should not redirect task.analysis.list to error in LOCAL mode', async () => {
      config.set('mode', 'LOCAL')
      await router.push({ name: 'task.analysis.list' })
      expect(router.currentRoute.value.name).not.toBe('error')
    })

    it('should redirect project.new to error in SERVER mode', async () => {
      config.set('mode', 'SERVER')
      await router.push({ name: 'project.new' })
      expect(router.currentRoute.value.name).toBe('error')
    })

    it('should not redirect project.new to error in LOCAL mode', async () => {
      wrapper.vm.$config.set('mode', 'LOCAL')
      await router.push({ name: 'project.new' })
      expect(router.currentRoute.value.name).not.toBe('error')
    })

    it('should not redirect project.new to error in EMBEDDED mode', async () => {
      wrapper.vm.$config.set('mode', 'EMBEDDED')
      await router.push({ name: 'project.new' })
      expect(router.currentRoute.value.name).not.toBe('error')
    })
  })
})
