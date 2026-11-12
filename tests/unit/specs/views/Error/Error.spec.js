import { mount, flushPromises } from '@vue/test-utils'
import { setCookie, removeCookie } from 'tiny-cookie'

import CoreSetup from '~tests/unit/CoreSetup'
import Error from '@/views/Error/Error'

vi.mock('@/api/apiInstance', () => {
  return {
    apiInstance: {
      getVersion: vi.fn().mockResolvedValue({
        'git.tag': 'X.Y.Z',
        'git.commit.id.abbrev': 'sha1_abbrev'
      })
    }
  }
})

describe('Error.vue', () => {
  let plugins
  let core

  beforeEach(() => {
    core = CoreSetup.init().useAll()
    plugins = core.plugins
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  describe('local mode', () => {
    it('should display a custom title', () => {
      const props = { title: 'This is wrong!' }
      const wrapper = mount(Error, { props, global: { plugins } })
      expect(wrapper.find('.error__container__heading').text()).toBe('This is wrong!')
    })

    it('should display troubleshooting details', async () => {
      core.useRouterWithoutGuards()
      await core.router.push('/ds/local-datashare/missing')
      const props = {
        code: 404,
        error: 'Not Found',
        details: { index: 'local-datashare', id: 'missing' }
      }
      const wrapper = mount(Error, { props, global: { plugins: core.plugins } })
      await flushPromises()
      await wrapper.find('.error__container__troubleshooting__toggle').trigger('click')
      const details = wrapper.findComponent('.error__details__copy').props('text')
      expect(details).toContain('Code: 404')
      expect(details).toContain('Error: Not Found')
      expect(details).toContain('URL: /ds/local-datashare/missing')
      expect(details).toContain('index: local-datashare')
      expect(details).toContain('id: missing')
      expect(details).toContain('Server: X.Y.Z')
    })

    it('should display a link when user is logged in in server mode', async () => {
      // Create the user session
      setCookie(process.env.VITE_DS_COOKIE_NAME, { login: 'foo' }, JSON.stringify)
      core.config.set('mode', 'SERVER')
      const wrapper = mount(Error, { global: { plugins } })
      await flushPromises()
      expect(wrapper.find('.error__container__links__item--logout').exists()).toBeTruthy()
    })
  })

  describe('server mode', () => {
    it('should not display a link when user is logged out in server mode', async () => {
      // Delete the user session
      removeCookie(process.env.VITE_DS_COOKIE_NAME)
      const core = CoreSetup.init().useAll()
      core.config.set('mode', 'SERVER')
      const wrapper = mount(Error, { global: { plugins: core.plugins } })
      await flushPromises()
      expect(wrapper.find('.error__container__links__item--logout').exists()).toBeFalsy()
    })
  })
})
