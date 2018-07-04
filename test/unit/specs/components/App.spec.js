import messages from '@/messages'
import router from '@/router'
import store from '@/store'

import Vue from 'vue'
import VueI18n from 'vue-i18n'
import VueProgressBar from 'vue-progressbar'
import { setCookie, removeCookie } from 'tiny-cookie'

import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import ContentPlaceholder from '@/components/ContentPlaceholder'
import App from '@/components/App'

Vue.use(VueI18n)
Vue.use(VueProgressBar, { color: '#852308' })
Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.component('content-placeholder', ContentPlaceholder)

const i18n = new VueI18n({locale: 'en', messages})

describe('App.vue', () => {
  let vm = null
  let Constructor = null

  beforeEach(async () => {
    setCookie(process.env.CONFIG.ds_cookie_name, { 'login': 'yolo' }, JSON.stringify)

    Constructor = Vue.extend(App)
    vm = new Constructor({ i18n, router, store }).$mount()
  })

  afterEach(async () => {
    removeCookie('YOLO')
    removeCookie(process.env.CONFIG.ds_cookie_name)
  })

  it('should display search bar', () => {
    expect(vm.$el.querySelector('form.search-bar button').textContent).to.equal('Search')
  })

  it('should display search bar in french', () => {
    vm = new Constructor({store, router, i18n: new VueI18n({locale: 'fr', messages})}).$mount()

    expect(vm.$el.querySelector('form.search-bar button').textContent).to.equal('Rechercher')
  })

  it('should not display the app if no cookie', () => {
    removeCookie(process.env.CONFIG.ds_cookie_name)
    vm = new Constructor({i18n, router, store}).$mount()

    expect(vm.$el.querySelectorAll('.app').length).to.equal(0)
  })

  it('should display the app because of the right cookie', () => {
    expect(vm.$el.querySelectorAll('.app').length).to.equal(1)
  })

  it('should not display the app if cookie has no login property', () => {
    removeCookie(process.env.CONFIG.ds_cookie_name)
    setCookie(process.env.CONFIG.ds_cookie_name, 'yolo', JSON.stringify)
    vm = new Constructor({i18n, router, store}).$mount()

    expect(vm.$el.querySelectorAll('.app').length).to.equal(0)
  })
})
