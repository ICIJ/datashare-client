import Vue from 'vue'
import VueI18n from 'vue-i18n'
import VueProgressBar from 'vue-progressbar'
import BootstrapVue from 'bootstrap-vue'
import Murmur from '@icij/murmur'
import VueShortkey from 'vue-shortkey'
import VueScrollTo from 'vue-scrollto'
import VueRouter from 'vue-router'
import VCalendar from 'v-calendar/lib/v-calendar.umd.js'

import router from '@/router'
import guards from '@/router/guards'
import messages from '@/lang/en'
import store from '@/store'
import Api from '@/api'
import Auth from '@/api/resources/Auth'
import settings from '@/utils/settings'
import mode from '@/modes'

import '@/utils/font-awesome'
import '@/main.scss'

export class App {
  constructor (LocalVue = Vue) {
    this.LocalVue = LocalVue
    // Disable production tip when not in production
    this.LocalVue.config.productionTip = process.env.NODE_ENV === 'development'
    // Setup deferred state
    this.defer()
  }
  use (Plugin, options) {
    this.LocalVue.use(Plugin, options)
    return this
  }
  useAll () {
    this.useI18n()
    this.useBootstrapVue()
    this.useCommons()
    this.useRouter()
    return this
  }
  useI18n () {
    this.use(VueI18n)
    return this
  }
  useBootstrapVue () {
    this.use(BootstrapVue)
    return this
  }
  useRouter () {
    this.use(VueRouter)
    this.router = new VueRouter(router)
    guards(this)
    return this
  }
  useCommons () {
    // Common plugins
    this.use(Murmur)
    this.use(VueProgressBar, { color: settings.progressBar.color })
    this.use(VueShortkey, { prevent: settings.hotKeyPrevented })
    this.use(VueScrollTo)
    // Setup VCalendar manually since Webpack is not compatible with
    // dynamic chunk import with third party modules.
    // @see https://github.com/nathanreyes/v-calendar/issues/413#issuecomment-530633437
    this.use(VCalendar, { componentPrefix: 'vc' })
  }
  async configure () {
    // Get the config object
    const config = await this.api.getConfig()
    // Murmur exposes a config attribute which share a Config object
    // with the current vue instance.
    Murmur.config.merge(mode(config.mode))
    // The backend can yet override some configuration
    Murmur.config.merge(config)
    // Override Murmur default value for content-placeholder
    Murmur.config.set('content-placeholder.rows', settings.contentPlaceholder.rows)
    this.api.createIndex(config['defaultProject'])
    if (this.store.state.search.index === '') {
      this.store.commit('search/index', config['defaultProject'])
    }
    // Old a promise that is resolved when the app is configured
    return this.ready && this._readyResolve(this)
  }
  mount (selector = '#app') {
    // Render function returns a router-view component by default
    const render = h => h('router-view')
    // We do not necessarily use the default Vue so we can use this function
    // from our unit tests
    const vm = new this.LocalVue({
      render,
      i18n: this.i18n,
      router: this.router,
      store: this.store
    }).$mount(selector)
    // Return an instance of the Vue constructor we receive.
    return vm
  }
  registerHook (...args) {
    this.store.commit('hooks/register', ...args)
  }
  resetHook (name) {
    this.store.commit('hooks/resetTarget', name)
  }
  resetHooks () {
    this.store.commit('hooks/reset', name)
  }
  defer () {
    this._ready = new Promise((resolve, reject) => {
      this._readyResolve = resolve
      this._readyReject = reject
    })
  }
  get ready () {
    if (!this._ready) {
      this.defer()
    }
    return this._ready
  }
  get i18n () {
    // Configure Languages
    return new VueI18n({
      locale: settings.defaultLocale,
      fallbackLocale: settings.defaultLocale,
      messages: {
        [settings.defaultLocale]: messages
      }
    })
  }
  get app () {
    return this
  }
  get localVue () {
    return this.LocalVue
  }
  get store () {
    return store
  }
  get auth () {
    this._auth = this._auth || new Auth()
    return this._auth
  }
  get config () {
    return Murmur.config
  }
  get api () {
    this._api = this._api || new Api()
    return this._api
  }
  static init (...options) {
    return new App(...options)
  }
}

/* eslint-disable no-new */
export function createApp (LocalVue = Vue) {
  const app = new App(LocalVue)
  // Configure the app with server conf
  app.configure()
  // Create the app with all available plugins
  app.useAll()
  // Returns both the app
  return app
}

if (process.env.NODE_ENV !== 'test' && window) {
  const app = createApp()
  // Mount the app when it's ready
  app.ready.then(() => app.mount())
  // Register the app globally (so plugins car use it)
  window.app = app
}
