import { shallowMount, flushPromises } from '@vue/test-utils'
import { setCookie, removeCookie } from 'tiny-cookie'
import { expect } from 'vitest'

import CoreSetup from '~tests/unit/CoreSetup'
import { apiInstance as api } from '@/api/apiInstance'

vi.mock('@/api/apiInstance', () => ({
  apiInstance: {
    getUser: vi.fn().mockResolvedValue({ uid: 'local' })
  }
}))

describe('guards', () => {
  const { auth, router, plugins, config } = CoreSetup.init().useAll().useRouter()

  afterAll(() => {
    vi.resetAllMocks()
  })

  describe('checkUserAuthentication', () => {
    beforeEach(async () => {
      vi.clearAllMocks()
      config.set('mode', 'SERVER')
      config.set('projects', ['local-datashare'])
      router.addRoute({ path: '/pub', name: 'pub', meta: { skipsAuth: true } })
      shallowMount({ template: '<router-view />' }, { global: { plugins } })
      await flushPromises()
      await router.replace({ name: 'pub' }).catch(vi.fn())
    })

    describe('when the user is authenticated', () => {
      it('should not redirect to /login when we have the right cookie', async () => {
        setCookie(process.env.VITE_DS_COOKIE_NAME, { login: 'yolo' }, JSON.stringify)
        await router.push({ name: 'settings' })
        expect(router.currentRoute.value.name).toBe('settings')
      })
    })

    describe('when the user is not authenticated', () => {
      beforeEach(() => {
        auth.reset()
        api.getUser.mockRejectedValue()
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
      await router.push({ name: 'task.documents.list' })
      expect(router.currentRoute.value.name).toBe('error')
    })

    it('should not redirect task.analysis.list to error in LOCAL mode', async () => {
      config.set('mode', 'LOCAL')
      await router.push({ name: 'task.documents.list' })
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

  describe('checkUserRoles', () => {
    beforeEach(async () => {
      setCookie(process.env.VITE_DS_COOKIE_NAME, { login: 'yolo' }, JSON.stringify)
      config.set('mode', 'SERVER')
      config.set('projects', ['local-datashare'])
      router.addRoute({ path: '/pub', name: 'pub', meta: { skipsAuth: true } })
      shallowMount({ template: '<router-view />' }, { global: { plugins } })
      await flushPromises()
      await router.replace({ name: 'pub' })
    })

    it('should allow access to project.view.edit when user has ADMIN role', async () => {
      config.set('policies', [{ projectId: 'local-datashare', roles: ['ADMIN'], admin: true }])
      await router.push({ name: 'project.view.edit', params: { name: 'local-datashare' } })
      expect(router.currentRoute.value.name).toBe('project.view.edit')
    })

    it('should redirect to error when user lacks ADMIN role', async () => {
      config.set('policies', [{ projectId: 'local-datashare', roles: ['READER'], admin: false }])
      await router.push({ name: 'project.view.edit', params: { name: 'local-datashare' } })
      expect(router.currentRoute.value.name).toBe('error')
    })

    it('should redirect to error when user has no policy for the project', async () => {
      config.set('policies', [{ projectId: 'other-project', roles: ['ADMIN'], admin: true }])
      await router.push({ name: 'project.view.edit', params: { name: 'local-datashare' } })
      expect(router.currentRoute.value.name).toBe('error')
    })

    it('should check roles for the correct project from route params', async () => {
      config.set('projects', ['local-datashare', 'other-project'])
      config.set('policies', [
        { projectId: 'local-datashare', roles: ['READER'], admin: false },
        { projectId: 'other-project', roles: ['ADMIN'], admin: true }
      ])
      await router.push({ name: 'project.view.edit', params: { name: 'other-project' } })
      expect(router.currentRoute.value.name).toBe('project.view.edit')
    })

    it('should skip role check in LOCAL mode', async () => {
      config.set('mode', 'LOCAL')
      config.set('policies', [])
      await router.push({ name: 'project.view.edit', params: { name: 'local-datashare' } })
      expect(router.currentRoute.value.name).not.toBe('error')
    })

    it('should not redirect routes without allowedRoles', async () => {
      config.set('policies', [])
      await router.push({ name: 'project.view.overview', params: { name: 'local-datashare' } })
      expect(router.currentRoute.value.name).not.toBe('error')
    })
  })
})
