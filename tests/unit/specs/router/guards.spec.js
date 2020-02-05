import { createLocalVue, shallowMount } from '@vue/test-utils'
import { setCookie, removeCookie } from 'tiny-cookie'

import { App } from '@/main'

jest.mock('axios', () => {
  return {
    request: jest.fn().mockRejectedValue({ response: { status: 401 } })
  }
})

const { localVue, router } = App.init(createLocalVue()).useAll()

describe('guards', () => {
  let wrapper

  beforeAll(() => {
    wrapper = shallowMount({ template: '<router-view />' }, { localVue, router })
  })

  beforeEach(() => wrapper.vm.$router.push('/').catch(jest.fn()))

  it('should redirect to /login if no cookie', async () => {
    removeCookie(process.env.VUE_APP_DS_COOKIE_NAME)
    await wrapper.vm.$router.push('landing').catch(jest.fn())

    expect(wrapper.vm.$route.path).toBe('/login')
  })

  it('should redirect to /login if cookie is null', async () => {
    setCookie(process.env.VUE_APP_DS_COOKIE_NAME, null)
    await wrapper.vm.$router.push('landing').catch(() => {})

    expect(wrapper.vm.$route.path).toBe('/login')
  })

  it('should redirect to /login if cookie has no login property', async () => {
    setCookie(process.env.VUE_APP_DS_COOKIE_NAME, 'yolo', JSON.stringify)
    await wrapper.vm.$router.push('landing').catch(() => {})

    expect(wrapper.vm.$route.path).toBe('/login')
  })

  it('should not redirect to /login when we have the right cookie', async () => {
    setCookie(process.env.VUE_APP_DS_COOKIE_NAME, { login: 'yolo' }, JSON.stringify)
    await wrapper.vm.$router.push('landing')

    expect(wrapper.vm.$route.path).not.toBe('/login')
  })
})
