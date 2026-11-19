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
          path: '/login',
          name: 'login',
          component: { template: '<div />' }
        },
        {
          path: '/',
          component: { template: '<div />' }
        }
      ])

    core.config.set('auth', 'form')

    reset = vi.spyOn(core.auth, 'reset')

    wrapper = shallowMount(App, {
      global: {
        plugins: core.plugins
      }
    })

    toastError = vi.spyOn(wrapper.vm.$toast, 'error')
  })

  afterEach(() => {
    wrapper?.unmount()
    vi.restoreAllMocks()
  })

  it('should redirect to the frontend login route on a 401 response', () => {
    const expectedHref = core.router.resolve({ name: 'login' }).href

    core.emit('http::error', {
      response: { status: 401 }
    })

    expect(reset).toHaveBeenCalledOnce()
    expect(toastError).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        href: expectedHref,
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
