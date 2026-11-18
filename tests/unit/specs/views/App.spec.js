import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import App from '@/views/App'

describe('App.vue HTTP error handling', () => {
  let core
  let wrapper
  let reset
  let toastError

  beforeEach(() => {
    core = CoreSetup.init()
      .useAll()
      .useRouter([
        {
          path: '/',
          component: { template: '<div />' }
        }
      ])

    core.config.set('auth', 'form')

    reset = vi.spyOn(core.auth, 'reset')
    toastError = vi.fn()
    core.toast = { error: toastError }

    wrapper = shallowMount(App, {
      global: {
        plugins: core.plugins
      }
    })
  })

  afterEach(() => {
    wrapper?.unmount()
    vi.restoreAllMocks()
  })

  it('should redirect to the frontend login page on a 401 response', () => {
    core.emit('http::error', {
      response: { status: 401 }
    })

    expect(toastError).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        href: '/login',
        linkLabel: expect.any(String),
        autoClose: false
      })
    )
  })

  it('should reset authentication state on a 401 response', () => {
    core.emit('http::error', {
      response: { status: 401 }
    })

    expect(reset).toHaveBeenCalledOnce()
  })

  it('should reset authentication state when the XHR response is 401', () => {
    core.emit('http::error', {
      request: {
        response: { status: 401 }
      }
    })

    expect(reset).toHaveBeenCalledOnce()
  })

  it('should not reset authentication state on non-401 errors', () => {
    core.emit('http::error', {
      response: { status: 403 }
    })

    expect(reset).not.toHaveBeenCalled()
    expect(toastError).not.toHaveBeenCalled()
  })
})
