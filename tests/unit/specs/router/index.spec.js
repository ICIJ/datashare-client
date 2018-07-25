import { createLocalVue } from '@vue/test-utils'
import VueI18n from 'vue-i18n'
import VueProgressBar from 'vue-progressbar'
import { setCookie, removeCookie } from 'tiny-cookie'

import store from '@/store'
import messages from '@/messages'
import router from '@/router'

import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import ContentPlaceholder from '@/components/ContentPlaceholder'

const i18n = new VueI18n({locale: 'en', messages})

// Create a view with a root router-view
const LocalVue = createLocalVue()
LocalVue.use(VueI18n)
LocalVue.use(VueProgressBar, { color: '#852308' })
LocalVue.component('font-awesome-icon', FontAwesomeIcon)
LocalVue.component('content-placeholder', ContentPlaceholder)

describe('router', () => {
  let vm = new LocalVue({
    i18n,
    router,
    store,
    el: document.createElement('div'),
    template: '<router-view />'
  }).$mount()

  beforeEach(async () => {
    await vm.$router.push('login')
    await vm.$nextTick()
  })

  it('should redirect to /login if no cookie', async () => {
    removeCookie(process.env.CONFIG.ds_cookie_name)
    await vm.$router.push('search')
    await vm.$nextTick()
    expect(vm.$route.path).to.equal('/login')
  })

  it('should redirect to /login if cookie is null', async () => {
    setCookie(process.env.CONFIG.ds_cookie_name, null)
    await vm.$router.push('search')
    await vm.$nextTick()
    expect(vm.$route.path).to.equal('/login')
  })

  it('should redirect to /login if cookie has no login property', async () => {
    setCookie(process.env.CONFIG.ds_cookie_name, 'yolo', JSON.stringify)
    await vm.$router.push('search')
    await vm.$nextTick()
    expect(vm.$route.path).to.equal('/login')
  })

  it('should not redirect to /login when we have the right cookie', async () => {
    setCookie(process.env.CONFIG.ds_cookie_name, { 'login': 'yolo' }, JSON.stringify)
    await vm.$router.push('search')
    await vm.$nextTick()
    expect(vm.$route.path).to.not.equal('/login')
  })
})
