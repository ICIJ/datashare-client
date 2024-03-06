import { createLocalVue, shallowMount } from '@vue/test-utils'
import { setCookie, removeCookie } from 'tiny-cookie'

import { Core } from '@/core'

describe('guards', () => {
  const { localVue, router, config } = Core.init(createLocalVue()).useAll()

  describe('checkUserAuthentication', () => {
    let wrapper = null

    beforeAll(() => {
      config.set('projects', ['local-datashare'])
      wrapper = shallowMount({ template: '<router-view />' }, { localVue, router })
    })

    beforeEach(() => {
      return wrapper.vm.$router.push('/').catch(vi.fn())
    })

    it('should redirect to /login if no cookie', async () => {
      removeCookie(process.env.VITE_DS_COOKIE_NAME)
      await wrapper.vm.$router.push({ name: 'landing' }).catch(vi.fn())
      expect(wrapper.vm.$route.path).toBe('/login')
    })

    it('should redirect to /login if cookie is null', async () => {
      setCookie(process.env.VITE_DS_COOKIE_NAME, null)
      await wrapper.vm.$router.push({ name: 'landing' }).catch(() => {})
      expect(wrapper.vm.$route.path).toBe('/login')
    })

    it('should redirect to /login if cookie has no login property', async () => {
      setCookie(process.env.VITE_DS_COOKIE_NAME, 'yolo', JSON.stringify)
      await wrapper.vm.$router.push({ name: 'landing' }).catch(vi.fn())
      expect(wrapper.vm.$route.path).toBe('/login')
    })

    it('should not redirect to /login when we have the right cookie', async () => {
      setCookie(process.env.VITE_DS_COOKIE_NAME, { login: 'yolo' }, JSON.stringify)
      await wrapper.vm.$router.push({ name: 'landing' }).catch(vi.fn())
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.$route.path).not.toBe('/login')
    })
  })

  describe('checkMode', () => {
    let wrapper

    beforeAll(() => {
      config.set('projects', ['local-datashare'])
      wrapper = shallowMount({ template: '<router-view />' }, { localVue, router })
    })

    beforeEach(() => {
      return wrapper.vm.$router.push('/').catch(vi.fn())
    })

    it('should redirect task.analysis.list to error in SERVER mode', async () => {
      config.set('mode', 'SERVER')
      await wrapper.vm.$router.push({ name: 'task.analysis.list' }).catch(vi.fn())
      expect(wrapper.vm.$route.name).toBe('error')
    })

    it('should not redirect task.analysis.list to error in LOCAL mode', async () => {
      config.set('mode', 'LOCAL')
      await wrapper.vm.$router.push({ name: 'task.analysis.list' }).catch(vi.fn())
      expect(wrapper.vm.$route.name).not.toBe('error')
    })

    it('should redirect project.new to error in SERVER mode', async () => {
      config.set('mode', 'SERVER')
      await wrapper.vm.$router.push({ name: 'project.new' }).catch(vi.fn())
      expect(wrapper.vm.$route.name).toBe('error')
    })

    it('should not redirect project.new to error in LOCAL mode', async () => {
      config.set('mode', 'LOCAL')
      await wrapper.vm.$router.push({ name: 'project.new' }).catch(vi.fn())
      expect(wrapper.vm.$route.name).not.toBe('error')
    })

    it('should not redirect project.new to error in EMBEDDED mode', async () => {
      config.set('mode', 'EMBEDDED')
      await wrapper.vm.$router.push({ name: 'project.new' }).catch(vi.fn())
      expect(wrapper.vm.$route.name).not.toBe('error')
    })
  })
})
