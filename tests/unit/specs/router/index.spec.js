import { createLocalVue, mount } from '@vue/test-utils'
import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import VueProgressBar from 'vue-progressbar'
import { setCookie, removeCookie } from 'tiny-cookie'
import { expect } from 'chai'

import esConnectionHelper from '../utils/esConnectionHelper'

import store from '@/store'
import messages from '@/messages'
import router from '@/router'

import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import ContentPlaceholder from '@/components/ContentPlaceholder'

describe('router', () => {
  esConnectionHelper()
  let wrapped = null

  beforeAll(() => {
    // Create a view with a root router-view
    const localVue = createLocalVue()

    localVue.use(Vuex)
    localVue.use(VueI18n)
    localVue.use(VueProgressBar, { color: '#852308' })
    localVue.component('font-awesome-icon', FontAwesomeIcon)
    localVue.component('content-placeholder', ContentPlaceholder)

    const i18n = new VueI18n({ locale: 'en', messages })

    wrapped = mount({ template: '<router-view />' }, { localVue, i18n, router, store })
  })

  beforeEach(async () => {
    await wrapped.vm.$router.push('login')
    await wrapped.vm.$nextTick()
  })

  it('should redirect to /login if no cookie', async () => {
    removeCookie(process.env.VUE_APP_DS_COOKIE_NAME)
    await wrapped.vm.$router.push('landing')
    await wrapped.vm.$nextTick()
    expect(wrapped.vm.$route.path).to.equal('/login')
  })

  it('should redirect to /login if cookie is null', async () => {
    setCookie(process.env.VUE_APP_DS_COOKIE_NAME, null)
    await wrapped.vm.$router.push('landing')
    await wrapped.vm.$nextTick()
    expect(wrapped.vm.$route.path).to.equal('/login')
  })

  it('should redirect to /login if cookie has no login property', async () => {
    setCookie(process.env.VUE_APP_DS_COOKIE_NAME, 'yolo', JSON.stringify)
    await wrapped.vm.$router.push('landing')
    await wrapped.vm.$nextTick()
    expect(wrapped.vm.$route.path).to.equal('/login')
  })

  it('should not redirect to /login when we have the right cookie', async () => {
    setCookie(process.env.VUE_APP_DS_COOKIE_NAME, { 'login': 'yolo' }, JSON.stringify)
    await wrapped.vm.$router.push('landing')
    await wrapped.vm.$nextTick()
    expect(wrapped.vm.$route.path).to.not.equal('/login')
  })
})
