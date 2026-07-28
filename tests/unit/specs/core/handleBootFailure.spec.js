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
    window.history.replaceState({}, '', '/settings?foo=bar#appearance')
    // Await the redirect navigation itself (handleBootFailure returns the
    // router.push promise) rather than router.isReady(), which resolves as
    // soon as ANY pending navigation settles — including the automatic one
    // vue-router kicks off when the router is installed — and would give a
    // false positive if a future change inserted an await before the push.
    await handleBootFailure(core, { response: { status: 401 } })
    const appStore = useAppStore(core.pinia)
    expect(appStore.redirectAfterLogin).toBe('/settings?foo=bar#appearance')
    expect(core.router.currentRoute.value.name).toBe('login')
  })

  it('should redirect to the error page on a non-401 failure', async () => {
    await handleBootFailure(core, new Error('boom'))
    expect(core.router.currentRoute.value.name).toBe('error')
  })
})
