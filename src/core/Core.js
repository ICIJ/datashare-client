import Vue from 'vue'
import VueI18n from 'vue-i18n'
import VueProgressBar from 'vue-progressbar'
import VueWait from 'vue-wait'
import BootstrapVue from 'bootstrap-vue'
import Murmur from '@icij/murmur'
import VueShortkey from 'vue-shortkey'
import VueScrollTo from 'vue-scrollto'
import VueRouter from 'vue-router'
import VCalendar from 'v-calendar/lib/v-calendar.umd.js'
import compose from 'lodash/fp/compose'

import FiltersMixin from './FiltersMixin'
import HooksMixin from './HooksMixin'
import PipelinesMixin from './PipelinesMixin'
import ProjectsMixin from './ProjectsMixin'

import router from '@/router'
import guards from '@/router/guards'
import messages from '@/lang/en'
import store from '@/store'
import Api from '@/api'
import Auth from '@/api/resources/Auth'
import settings from '@/utils/settings'
import mode from '@/modes'
import { dispatch } from '@/utils/event-bus'

class Base {}
const Behaviors = compose(FiltersMixin, HooksMixin, PipelinesMixin, ProjectsMixin)(Base)

export default class Core extends Behaviors {
  constructor (LocalVue = Vue) {
    super(LocalVue)
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
    this.useWait()
    this.useCore()
    return this
  }
  useI18n () {
    this.use(VueI18n)
    this.i18n = new VueI18n({
      locale: settings.defaultLocale,
      fallbackLocale: settings.defaultLocale,
      messages: {
        [settings.defaultLocale]: messages
      }
    })
    return this
  }
  useBootstrapVue () {
    this.use(BootstrapVue, {
      BPopover: {
        boundaryPadding: 14
      }
    })
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
  useWait () {
    this.use(VueWait)
    this.wait = new VueWait({ useVuex: true })
  }
  useCore () {
    const core = this
    this.use(class VueCore {
      static install (Vue) {
        Vue.prototype.$core = core
      }
    })
  }
  async configure () {
    try {
      // Get the config object
      const config = await this.api.getSettings()
      // Load the user
      this.config.merge(await this.getUser())
      // Murmur exposes a config attribute which share a Config object
      // with the current vue instance.
      this.config.merge(mode(config.mode))
      // The backend can yet override some configuration
      this.config.merge(config)
      // Override Murmur default value for content-placeholder
      this.config.set('content-placeholder.rows', settings.contentPlaceholder.rows)
      // Create the default project for the current user or redirect to login
      this.createDefaultProject()
      // Set the default project
      if (this.store.state.search.index === '') {
        this.store.commit('search/index', config.defaultProject)
      }
      // Old a promise that is resolved when the core is configured
      return this.ready && this._readyResolve(this)
    } catch (error) {
      return this.ready && this._readyReject(error)
    }
  }
  mount (selector = '#app') {
    // Render function returns a router-view component by default
    const render = h => h('router-view')
    // We do not necessarily use the default Vue so we can use this function
    // from our unit tests
    const vm = new this.LocalVue({
      render,
      wait: this.wait,
      i18n: this.i18n,
      router: this.router,
      store: this.store
    }).$mount(selector)
    // Return an instance of the Vue constructor we receive.
    return vm
  }
  defer () {
    this._ready = new Promise((resolve, reject) => {
      this._readyResolve = resolve
      this._readyReject = reject
    })
    // Notify the document the core is ready
    this._ready.then(() => this.dispatch('ready'))
  }
  dispatch (name, ...args) {
    // Add "core" property but kept "app" for retro-compatibility
    // @TODO remove this property
    dispatch(name, { app: this, core: this, ...args })
    return this
  }
  async getUser () {
    try {
      return await this.api.getUser()
    } catch (_) {
      await this.router.push('login')
    }
  }
  get ready () {
    if (!this._ready) {
      this.defer()
    }
    return this._ready
  }
  // Add "core" getter but kept "app" for retro-compatibility
  // @TODO remove this getter
  get app () {
    return this
  }
  get core () {
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
    return new Core(...options)
  }
}
