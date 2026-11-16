import { shallowMount, flushPromises } from '@vue/test-utils'
import { expect } from 'vitest'

import CoreSetup from '~tests/unit/CoreSetup'
import { apiInstance as api } from '@/api/apiInstance'
import { useAppStore } from '@/store/modules'

vi.mock('@/api/apiInstance', () => ({
  apiInstance: {
    getUser: vi.fn().mockResolvedValue({ uid: 'local' })
  }
}))

// Mock useNProgress to avoid real NProgress timers outliving the jsdom
// environment (see nprogress.js:98,256 — chained setTimeouts try to touch
// `document` after test teardown and throw "document is not defined").
vi.mock('@/composables/useNProgress', () => ({
  useNProgress: () => ({
    start: vi.fn(),
    done: vi.fn(),
    remove: vi.fn(),
    toggle: vi.fn(),
    isLoading: { value: false },
    progress: { value: null }
  })
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

    describe('when the route skips auth', () => {
      it('should allow navigation to a skipsAuth route without a session', async () => {
        auth.reset()
        api.getUser.mockRejectedValue({ response: { status: 401 } })
        await router.push({ name: 'login' })
        expect(router.currentRoute.value.name).toBe('login')
      })
    })

    describe('when the user is authenticated', () => {
      it('should not redirect to /login when the server knows the user', async () => {
        auth.reset()
        api.getUser.mockResolvedValue({ uid: 'yolo' })
        await router.push({ name: 'settings' })
        expect(router.currentRoute.value.name).toBe('settings')
      })

      it('should redirect to stored path after login', async () => {
        auth.reset()
        api.getUser.mockResolvedValue({ uid: 'yolo' })
        const appStore = useAppStore()
        appStore.setRedirectAfterLogin('/settings/appearance')
        await router.push({ name: 'project.list' })
        expect(router.currentRoute.value.path).toBe('/settings/appearance')
      })

      it('should restore query and hash of the stored path after login', async () => {
        auth.reset()
        api.getUser.mockResolvedValue({ uid: 'yolo' })
        const appStore = useAppStore()
        appStore.setRedirectAfterLogin('/settings/appearance?search=test#overview')
        await router.push({ name: 'project.list' })
        expect(router.currentRoute.value.fullPath).toBe('/settings/appearance?search=test#overview')
      })
    })

    describe('when the user is not authenticated', () => {
      beforeEach(() => {
        auth.reset()
        api.getUser.mockRejectedValue({ response: { status: 401 } })
      })

      it('should redirect to /login if the server does not know the user', async () => {
        await router.push({ name: 'settings' })
        expect(router.currentRoute.value.name).toBe('login')
      })

      it('should not redirect to /login when already on /login', async () => {
        await router.replace({ name: 'login' })
        await router.push({ name: 'login' })
        expect(router.currentRoute.value.name).toBe('login')
      })

      it('should store the full path including query and hash before redirecting to login', async () => {
        const appStore = useAppStore()
        appStore.setRedirectAfterLogin(null)
        await router.push('/settings?search=test#overview')
        expect(router.currentRoute.value.name).toBe('login')
        expect(appStore.redirectAfterLogin).toBe('/settings/appearance?search=test#overview')
      })
    })

    describe('when the server cannot tell who the user is', () => {
      beforeEach(() => {
        auth.reset()
      })

      it('should redirect to the error page with the status code when the server answered', async () => {
        api.getUser.mockRejectedValue({ message: 'Service Unavailable', request: {}, response: { status: 503 } })
        await router.push({ name: 'settings' })
        expect(router.currentRoute.value.name).toBe('error')
        expect(window.history.state).toMatchObject({ code: 503, reason: undefined })
      })

      it('should redirect to the error page as unreachable when the server never answered', async () => {
        api.getUser.mockRejectedValue({ message: 'Network Error', request: {} })
        await router.push({ name: 'settings' })
        expect(router.currentRoute.value.name).toBe('error')
        expect(window.history.state).toMatchObject({ code: undefined, reason: 'serverUnreachable' })
      })
    })
  })

  describe('checkUserProjects', () => {
    beforeEach(async () => {
      auth.reset()
      api.getUser.mockResolvedValue({ uid: 'yolo' })
      config.set('mode', 'SERVER')
      config.set('projects', ['local-datashare'])
      router.addRoute({ path: '/pub', name: 'pub', meta: { skipsAuth: true } })
      shallowMount({ template: '<router-view />' }, { global: { plugins } })
      await flushPromises()
      await router.replace({ name: 'pub' })
    })

    it('should redirect to error when user has no projects', async () => {
      config.set('projects', [])
      await router.push({ name: 'settings' })
      expect(router.currentRoute.value.name).toBe('error')
      expect(window.history.state.reason).toBe('noProjects')
    })

    it('should keep the previous page in the history when redirecting to error', async () => {
      router.addRoute({ path: '/page-a', name: 'page-a', meta: { skipsAuth: true } })
      await router.push({ name: 'page-a' })
      config.set('projects', [])
      await router.push({ name: 'settings' })
      expect(window.history.state.back).toBe('/page-a')
    })

    it('should keep the requested URL on the error page', async () => {
      config.set('projects', [])
      await router.push({ name: 'settings' })
      expect(router.currentRoute.value.name).toBe('error')
      expect(router.currentRoute.value.fullPath).toBe(router.resolve({ name: 'settings' }).fullPath)
    })

    it('should allow navigation when user has projects', async () => {
      config.set('projects', ['local-datashare'])
      await router.push({ name: 'settings' })
      expect(router.currentRoute.value.name).toBe('settings')
    })

    it('should allow navigation to /login even with no projects', async () => {
      config.set('projects', [])
      auth.reset()
      api.getUser.mockRejectedValue({ response: { status: 401 } })
      await router.push({ name: 'login' })
      expect(router.currentRoute.value.name).toBe('login')
    })
  })

  describe('checkMode', () => {
    let wrapper

    beforeEach(async () => {
      auth.reset()
      api.getUser.mockResolvedValue({ uid: 'yolo' })
      config.set('mode', 'SERVER')
      config.set('projects', ['local-datashare'])
      router.addRoute({ path: '/pub', name: 'pub', meta: { skipsAuth: true } })
      wrapper = shallowMount({ template: '<router-view />' }, { global: { plugins } })
      await flushPromises()
      await router.replace({ name: 'pub' })
    })

    it('should redirect task.documents.list to error in SERVER mode', async () => {
      config.set('mode', 'SERVER')
      await router.push({ name: 'task.documents.list' })
      expect(router.currentRoute.value.name).toBe('error')
      expect(window.history.state.reason).toBe('forbidden')
    })

    it('should keep the previous page in the history when forbidden', async () => {
      router.addRoute({ path: '/page-a', name: 'page-a', meta: { skipsAuth: true } })
      await router.push({ name: 'page-a' })
      await router.push({ name: 'task.documents.list' })
      expect(window.history.state.back).toBe('/page-a')
    })

    it('should not redirect task.documents.list to error in LOCAL mode', async () => {
      config.set('mode', 'LOCAL')
      await router.push({ name: 'task.documents.list' })
      expect(router.currentRoute.value.name).not.toBe('error')
    })

    it('should redirect task.entities.list to error in SERVER mode', async () => {
      config.set('mode', 'SERVER')
      await router.push({ name: 'task.entities.list' })
      expect(router.currentRoute.value.name).toBe('error')
    })

    it('should redirect task.entities.new to error in SERVER mode', async () => {
      config.set('mode', 'SERVER')
      await router.push({ name: 'task.entities.new' })
      expect(router.currentRoute.value.name).toBe('error')
    })

    it('should not redirect task.entities.list to error in LOCAL mode', async () => {
      config.set('mode', 'LOCAL')
      await router.push({ name: 'task.entities.list' })
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

    it('should not redirect settings.api to error in SERVER mode', async () => {
      config.set('mode', 'SERVER')
      await router.push({ name: 'settings.api' })
      expect(router.currentRoute.value.name).not.toBe('error')
    })

    it('should redirect settings.api to error in LOCAL mode', async () => {
      config.set('mode', 'LOCAL')
      await router.push({ name: 'settings.api' })
      expect(router.currentRoute.value.name).toBe('error')
    })

    it('should not redirect routes without allowedModes', async () => {
      config.set('mode', 'SERVER')
      await router.push({ name: 'settings' })
      expect(router.currentRoute.value.name).not.toBe('error')
    })
  })

  describe('checkUserRole', () => {
    beforeEach(async () => {
      auth.reset()
      api.getUser.mockResolvedValue({ uid: 'yolo' })
      config.set('mode', 'SERVER')
      config.set('projects', ['local-datashare'])
      router.addRoute({ path: '/pub', name: 'pub', meta: { skipsAuth: true } })
      shallowMount({ template: '<router-view />' }, { global: { plugins } })
      await flushPromises()
      await router.replace({ name: 'pub' })
    })

    it('should allow access to project.view.edit when user has ADMIN role', async () => {
      config.set('policies', [{ projectId: 'local-datashare', role: 'PROJECT_ADMIN' }])
      await router.push({ name: 'project.view.edit', params: { name: 'local-datashare' } })
      expect(router.currentRoute.value.name).toBe('project.view.edit.details')
    })

    it('should redirect to error when user lacks ADMIN role', async () => {
      config.set('policies', [{ projectId: 'local-datashare', role: 'PROJECT_MEMBER' }])
      await router.push({ name: 'project.view.edit', params: { name: 'local-datashare' } })
      expect(router.currentRoute.value.name).toBe('error')
      expect(window.history.state.reason).toBe('forbidden')
    })

    it('should redirect to error when user has no policy for the project', async () => {
      config.set('policies', [{ projectId: 'other-project', role: 'PROJECT_ADMIN' }])
      await router.push({ name: 'project.view.edit', params: { name: 'local-datashare' } })
      expect(router.currentRoute.value.name).toBe('error')
    })

    it('should check roles for the correct project from route params', async () => {
      config.set('projects', ['local-datashare', 'other-project'])
      config.set('policies', [
        { projectId: 'local-datashare', role: 'PROJECT_MEMBER' },
        { projectId: 'other-project', role: 'PROJECT_ADMIN' }
      ])
      await router.push({ name: 'project.view.edit', params: { name: 'other-project' } })
      expect(router.currentRoute.value.name).toBe('project.view.edit.details')
    })

    it('should skip role check in LOCAL mode', async () => {
      config.set('mode', 'LOCAL')
      config.set('policies', [])
      await router.push({ name: 'project.view.edit', params: { name: 'local-datashare' } })
      expect(router.currentRoute.value.name).not.toBe('error')
    })

    it('should skip role check in EMBEDDED mode', async () => {
      config.set('mode', 'EMBEDDED')
      config.set('policies', [])
      await router.push({ name: 'project.view.edit', params: { name: 'local-datashare' } })
      expect(router.currentRoute.value.name).not.toBe('error')
    })

    it('should not redirect routes without allowedRole', async () => {
      config.set('policies', [])
      await router.push({ name: 'project.view.overview', params: { name: 'local-datashare' } })
      expect(router.currentRoute.value.name).not.toBe('error')
    })

    it('should redirect an unauthenticated user to login instead of error', async () => {
      auth.reset()
      api.getUser.mockRejectedValue({ response: { status: 401 } })
      config.set('policies', [])
      const appStore = useAppStore()
      appStore.setRedirectAfterLogin(null)
      await router.push({ name: 'project.view.edit', params: { name: 'local-datashare' } })
      expect(router.currentRoute.value.name).toBe('login')
      expect(appStore.redirectAfterLogin).toContain('/local-datashare/')
    })
  })
})
