import Vue from 'vue'
import VueI18n from 'vue-i18n'
import VueProgressBar from 'vue-progressbar'
import BootstrapVue from 'bootstrap-vue'
import Murmur from '@icij/murmur'
import VueShortkey from 'vue-shortkey'
import VueScrollTo from 'vue-scrollto'
import VCalendar from 'v-calendar/lib/v-calendar.umd.js'

import router from '@/router'
import messages from '@/lang/en'
import store from '@/store'
import DatashareClient from '@/api/DatashareClient'
import settings from '@/utils/settings'
import mode from '@/modes'

import '@/utils/font-awesome'
import '@/main.scss'

export class App {
  constructor (LocalVue = Vue) {
    this.LocalVue = LocalVue
    // Disable production tip when not in production
    this.LocalVue.config.productionTip = process.env.NODE_ENV === 'development'
    // Instantiate a single datashare client
    this.datashareClient = new DatashareClient()
    return this
  }
  use (Plugin, options) {
    this.LocalVue.use(Plugin, options)
    return this
  }
  useAll () {
    this.useI18n()
    this.useBootstrapVue()
    this.useCommons()
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
    // Old a promise that is resolved when the app is configured
    this.ready = this.ready || Promise.resolve().then(async () => {
      // Get the config object
      const config = await this.datashareClient.getConfig()
      // Murmur exposes a config attribute which share a Config object
      // with the current vue instance.
      Murmur.config.merge(mode(config.mode))
      // The backend can yet override some configuration
      Murmur.config.merge(config)
      // Override Murmur default value for content-placeholder
      Murmur.config.set('content-placeholder.rows', settings.contentPlaceholder.rows)
      this.datashareClient.createIndex(config['defaultProject'])
      if (this.store.state.search.index === '') {
        this.store.commit('search/index', config['defaultProject'])
      }
      return this
    })
    return this.ready
  }
  mount (selector) {
    // Render function returns a router-view component by default
    const render = h => h('router-view')
    // Return an instance of the Vue constructor we receive.
    // We do not necessarily use the default Vue so we can use this function
    // from our unit tests
    return new this.LocalVue({
      render,
      i18n: this.i18n,
      router: this.router,
      store: this.store
    }).$mount(selector)
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
  get router () {
    return router
  }
  get store () {
    return store
  }
  static init (...options) {
    return new App(...options)
  }
}

/* eslint-disable no-new */
export function createApp (LocalVue) {
  const app = new App(LocalVue)
  // Configure the app with server conf
  app.configure()
  // Create the app with all available plugins
  const vm = app.useAll().mount('#app')
  // Returns both the vm and the app
  return { vm, app }
}

if (process.env.NODE_ENV !== 'test' && window) {
  const { app } = createApp()
  // Register the app globally (so plugins car use it)
  window.app = app
}
