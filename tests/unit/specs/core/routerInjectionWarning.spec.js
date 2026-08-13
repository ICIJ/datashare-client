import { createCore } from '@/core'
import { apiInstance as api } from '@/api/apiInstance'

vi.mock('@/api/apiInstance', () => ({
  apiInstance: {
    getUser: vi.fn(),
    getSettings: vi.fn(),
    getProject: vi.fn()
  }
}))

// Regression test for search.js calling vue-router's useRouter() eagerly at
// store-setup time. Core.configure() (src/core/Core.js) eagerly instantiates
// useSearchStore() before the router plugin is installed on the app, which
// used to throw `[Vue warn]: injection "Symbol(router)" not found.` on every
// boot. Kept in its own file (not alongside main.spec.js) because this app's
// Pinia instance is a module-level singleton shared by every createCore()
// call within a test file — once useSearchStore() runs once, later calls
// return the cached store without re-running setup(), which would hide this
// exact bug behind an earlier, contaminating store creation.
it('does not warn about a missing router injection while booting', async () => {
  api.getUser.mockResolvedValue({})
  api.getSettings.mockResolvedValue({})
  api.getProject.mockResolvedValue({})
  const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const app = document.createElement('div')
  app.setAttribute('id', 'app')
  document.body.appendChild(app)

  const core = createCore()
  await core.ready
  core.useRouter().mount()

  const warnings = warnSpy.mock.calls.map(call => call.join(' ')).join('\n')
  expect(warnings).not.toMatch(/injection.*router/i)

  warnSpy.mockRestore()
  app.remove()
})
