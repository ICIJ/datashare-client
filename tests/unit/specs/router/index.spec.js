import Vuex from 'vuex'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import router from '@/router'
import { setCookie, removeCookie } from 'tiny-cookie'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('router', () => {
  let wrapped

  beforeAll(() => {
    wrapped = shallowMount({ template: '<router-view />' }, { localVue, router })
  })

  beforeEach(async () => {
    await wrapped.vm.$router.push('login')
  })

  it('should redirect to /login if no cookie', async () => {
    removeCookie(process.env.VUE_APP_DS_COOKIE_NAME)
    await wrapped.vm.$router.push('landing')
    await wrapped.vm.$nextTick()
    expect(wrapped.vm.$route.path).toEqual('/login')
  })

  it('should redirect to /login if cookie is null', async () => {
    setCookie(process.env.VUE_APP_DS_COOKIE_NAME, null)
    await wrapped.vm.$router.push('landing')
    await wrapped.vm.$nextTick()
    expect(wrapped.vm.$route.path).toEqual('/login')
  })

  it('should redirect to /login if cookie has no login property', async () => {
    setCookie(process.env.VUE_APP_DS_COOKIE_NAME, 'yolo', JSON.stringify)
    await wrapped.vm.$router.push('landing')
    await wrapped.vm.$nextTick()
    expect(wrapped.vm.$route.path).toEqual('/login')
  })

  it('should not redirect to /login when we have the right cookie', async () => {
    setCookie(process.env.VUE_APP_DS_COOKIE_NAME, { 'login': 'yolo' }, JSON.stringify)
    await wrapped.vm.$router.push('landing')
    await wrapped.vm.$nextTick()
    expect(wrapped.vm.$route.path).not.toEqual('/login')
  })
})
