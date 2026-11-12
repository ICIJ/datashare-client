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

const actionsOf = wrapper => wrapper.findAll('.error__actions .btn').map(b => b.classes().find(c => c.startsWith('error__actions__item--')))

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
      expect(wrapper.find('.error__title').text()).toBe('This is wrong!')
    })

    it('should display troubleshooting details', async () => {
      core.useRouterWithoutGuards()
      await core.router.push('/ds/local-datashare/missing')
      const props = {
        reason: 'document',
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
      expect(details).toContain('Reason: document')
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

    it('shows Log out on noProjects when logged in', async () => {
      setCookie(process.env.VITE_DS_COOKIE_NAME, { login: 'foo' }, JSON.stringify)
      const core = CoreSetup.init().useAll()
      core.config.set('mode', 'SERVER')
      const wrapper = mount(Error, { props: { reason: 'noProjects' }, global: { plugins: core.plugins } })
      await flushPromises()
      expect(actionsOf(wrapper)).toEqual(['error__actions__item--retry', 'error__actions__item--logout'])
    })

    it('hides Log out on noProjects when logged out', async () => {
      removeCookie(process.env.VITE_DS_COOKIE_NAME)
      const core = CoreSetup.init().useAll()
      core.config.set('mode', 'SERVER')
      const wrapper = mount(Error, { props: { reason: 'noProjects' }, global: { plugins: core.plugins } })
      await flushPromises()
      expect(actionsOf(wrapper)).toEqual(['error__actions__item--retry'])
    })
  })

  describe('actions', () => {
    beforeEach(() => {
      window.history.replaceState({}, '', '/')
      removeCookie(process.env.VITE_DS_COOKIE_NAME)
    })

    it('hides Back when the error page is the first page', async () => {
      core.useRouterWithoutGuards()
      await core.router.replace('/does-not-exist')
      const wrapper = mount(Error, { global: { plugins: core.plugins } })
      expect(actionsOf(wrapper)).toEqual(['error__actions__item--home'])
    })

    it('shows Home then Back when there is a previous page', async () => {
      core.useRouterWithoutGuards()
      await core.router.replace('/')
      await core.router.push('/does-not-exist')
      const wrapper = mount(Error, { global: { plugins: core.plugins } })
      expect(actionsOf(wrapper)).toEqual(['error__actions__item--home', 'error__actions__item--back'])
      expect(wrapper.find('.error__actions__item--home').classes()).toContain('btn-primary')
      expect(wrapper.find('.error__actions__item--back').classes()).toContain('btn-outline-light')
    })

    it('shows Try again, Back to search and Home for a document', () => {
      const wrapper = mount(Error, { props: { reason: 'document' }, global: { plugins } })
      expect(actionsOf(wrapper)).toEqual(['error__actions__item--retry', 'error__actions__item--search', 'error__actions__item--home'])
      expect(wrapper.find('.error__actions__item--home').classes()).toContain('btn-link')
    })

    it('reloads the page on Try again', async () => {
      const reload = vi.fn()
      vi.stubGlobal('location', { ...window.location, reload })
      const wrapper = mount(Error, { props: { reason: 'serverUnreachable' }, global: { plugins } })
      await wrapper.find('.error__actions__item--retry').trigger('click')
      expect(reload).toHaveBeenCalled()
      vi.unstubAllGlobals()
    })

    it('navigates to search on Back to search', async () => {
      core.useRouterWithoutGuards()
      const push = vi.spyOn(core.router, 'push').mockResolvedValue()
      const wrapper = mount(Error, { props: { reason: 'document' }, global: { plugins: core.plugins } })
      await wrapper.find('.error__actions__item--search').trigger('click')
      expect(push).toHaveBeenCalledWith({ name: 'search' })
    })

    it('shows only Try again for noProjects in local mode', () => {
      const wrapper = mount(Error, { props: { reason: 'noProjects' }, global: { plugins } })
      expect(actionsOf(wrapper)).toEqual(['error__actions__item--retry'])
    })
  })

  describe('reasons', () => {
    it('shows the notFound case when the page has no state', () => {
      const wrapper = mount(Error, { global: { plugins } })
      expect(wrapper.find('.error__label').text()).toBe('Error 404 · Page')
      expect(wrapper.find('.error__title').text()).toBe('This page doesn\'t exist')
      expect(wrapper.find('.error__cause').text()).toBe('The link may be broken or mistyped.')
      expect(wrapper.find('.error__background').text()).toBe('404')
      expect(wrapper.find('.error__background').attributes('aria-hidden')).toBe('true')
    })

    it('shows the document case with the real code', () => {
      const props = { reason: 'document', code: 500, error: 'Request failed with status code 500' }
      const wrapper = mount(Error, { props, global: { plugins } })
      expect(wrapper.find('.error__label').text()).toBe('Error 500 · Document')
      expect(wrapper.find('.error__title').text()).toBe('We couldn\'t open this document')
      expect(wrapper.find('.error__background').text()).toBe('500')
    })

    it('shows an icon instead of a code for the document case without code', () => {
      const wrapper = mount(Error, { props: { reason: 'document' }, global: { plugins } })
      expect(wrapper.find('.error__label').text()).toBe('Document')
      expect(wrapper.find('.error__background svg').exists()).toBe(true)
    })

    it('shows an icon background for noProjects', () => {
      const wrapper = mount(Error, { props: { reason: 'noProjects' }, global: { plugins } })
      expect(wrapper.find('.error__label').text()).toBe('Projects')
      expect(wrapper.find('.error__background svg').exists()).toBe(true)
    })

    it('lets the title and description props override the case text', () => {
      const props = { reason: 'forbidden', title: 'Custom', description: 'Custom cause' }
      const wrapper = mount(Error, { props, global: { plugins } })
      expect(wrapper.find('.error__title').text()).toBe('Custom')
      expect(wrapper.find('.error__cause').text()).toBe('Custom cause')
    })

    it('falls back to the error message for an unknown reason', () => {
      const props = { reason: 'nope', error: 'boom', code: 418 }
      const wrapper = mount(Error, { props, global: { plugins } })
      expect(wrapper.find('.error__label').text()).toBe('Error 418')
      expect(wrapper.find('.error__title').text()).toBe('boom')
      expect(wrapper.find('.error__cause').text()).toBe('An error has occurred. Please try again later or contact your administrator if the problem persists.')
    })
  })
})
