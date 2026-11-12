import { createCore } from '@/core'
import { handleBootFailure } from '@/core/handleBootFailure'
import { useAppStore } from '@/store/modules'
import { apiInstance as api } from '@/api/apiInstance'

vi.mock('@/api/apiInstance', () => ({
  apiInstance: {
    getUser: vi.fn(),
    getSettings: vi.fn().mockResolvedValue({}),
    getProject: vi.fn().mockResolvedValue({}),
    // Rendered by the navbar mounted with the login/error page.
    getVersion: vi.fn().mockResolvedValue({})
  }
}))

describe('handleBootFailure', () => {
  let core

  beforeEach(() => {
    const app = document.createElement('div')
    app.setAttribute('id', 'app')
    document.body.appendChild(app)
    api.getUser.mockRejectedValue({ response: { status: 401 } })
    core = createCore()
    // createCore's own boot sequence also rejects on the 401 above; that
    // rejection is unrelated to handleBootFailure, which is called directly.
    core.ready.catch(() => {})
    window.history.replaceState({}, '', '/')
  })

  afterEach(() => {
    document.querySelectorAll('#app').forEach(el => el.remove())
    vi.clearAllMocks()
  })

  it('should store the requested URL and redirect to login on a 401', async () => {
    // The router uses createWebHashHistory, so a real deep link is shaped
    // like `https://host/#/settings?foo=bar`: the route lives entirely in
    // the hash, not in pathname/search.
    window.history.replaceState({}, '', '/#/settings?foo=bar')
    // Await the redirect navigation itself (handleBootFailure returns the
    // router.push promise) rather than router.isReady(), which resolves as
    // soon as ANY pending navigation settles — including the automatic one
    // vue-router kicks off when the router is installed — and would give a
    // false positive if a future change inserted an await before the push.
    await handleBootFailure(core, { response: { status: 401 } })
    const appStore = useAppStore(core.pinia)
    expect(appStore.redirectAfterLogin).toBe('/settings?foo=bar')
    expect(core.router.currentRoute.value.name).toBe('login')
  })

  it('should keep the stored redirect intact after the boot-failure flow settles', async () => {
    window.history.replaceState({}, '', '/#/settings?foo=bar')
    await handleBootFailure(core, { response: { status: 401 } })
    // handleBootFailure's own push has resolved above, but this guards
    // against the router guards (which run their own auth check and login
    // push as part of mount()'s initial navigation) overwriting the value
    // stored here with something else once everything has settled.
    await core.router.isReady()
    const appStore = useAppStore(core.pinia)
    expect(appStore.redirectAfterLogin).toBe('/settings?foo=bar')
    expect(core.router.currentRoute.value.name).toBe('login')
  })

  it('should redirect to the error page on a non-401 failure', async () => {
    await handleBootFailure(core, new Error('boom'))
    expect(core.router.currentRoute.value.name).toBe('error')
  })

  it('should keep the requested URL on the error page', async () => {
    window.history.replaceState({}, '', '/#/settings?foo=bar')
    await handleBootFailure(core, new Error('boom'))
    expect(core.router.currentRoute.value.name).toBe('error')
    expect(core.router.currentRoute.value.fullPath).toBe('/settings?foo=bar')
  })

  it('should send serverUnreachable when the server gave no response', async () => {
    await handleBootFailure(core, new Error('Network Error'))
    expect(window.history.state).toMatchObject({ error: 'Network Error', reason: 'serverUnreachable' })
  })

  it('should send the status code when the server answered', async () => {
    const error = Object.assign(new Error('Request failed with status code 500'), { response: { status: 500 } })
    await handleBootFailure(core, error)
    expect(window.history.state).toMatchObject({ code: 500 })
    expect(window.history.state.reason).toBeUndefined()
  })

  it('should not keep the previous error reason after a retry', async () => {
    window.history.replaceState({ error: 'Network Error', reason: 'serverUnreachable' }, '', '/')
    const error = Object.assign(new Error('Request failed with status code 500'), { response: { status: 500 } })
    await handleBootFailure(core, error)
    expect(window.history.state.code).toBe(500)
    expect(window.history.state.reason).toBeUndefined()
  })
})
