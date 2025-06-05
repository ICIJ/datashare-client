// BootstrapVue recommends using this
import 'mutationobserver-shim'

import compose from 'lodash/fp/compose'
import Murmur from '@icij/murmur-next'
import VCalendar from 'v-calendar'
import VueScrollTo from 'vue-scrollto'
import Vue3Toastify, { toast } from 'vue3-toastify'
import { createBootstrap } from 'bootstrap-vue-next'
import { createApp, defineComponent, h } from 'vue'
import { createI18n } from 'vue-i18n'
import { createRouter, createWebHashHistory } from 'vue-router'
import { iteratee } from 'lodash'

import ComponentsMixin from './ComponentsMixin'
import FiltersMixin from './FiltersMixin'
import HooksMixin from './HooksMixin'
import I18nMixin from './I18nMixin'
import PipelinesMixin from './PipelinesMixin'
import ProjectsMixin from './ProjectsMixin'
import WidgetsMixin from './WidgetsMixin'

import { apiInstance } from '@/api/apiInstance'
import { dispatch, EventBus } from '@/utils/eventBus'
import { getMode, MODE_NAME } from '@/mode'
import { routes } from '@/router'
import { pinia } from '@/store/pinia'
import Auth from '@/api/resources/Auth'
import ToastBody from '@/components/Dismissable/DismissableToastBody'
import guards from '@/router/guards'
import messages from '@/lang/en'
import settings from '@/utils/settings'
import { getTheme, setTheme } from '@/composables/useTheme'
import * as stores from '@/store/modules'

class Base {}
const Behaviors = compose(
  ComponentsMixin,
  FiltersMixin,
  HooksMixin,
  I18nMixin,
  PipelinesMixin,
  ProjectsMixin,
  WidgetsMixin
)(Base)

/**
  @class
  @classdesc Class representing the core application with public methods for plugins.
  @mixes FiltersMixin
  @mixes HooksMixin
  @mixes I18nMixin
  @mixes PipelinesMixin
  @mixes ProjectsMixin
  @mixes WidgetsMixin
  @typicalname datashare
*/
class Core extends Behaviors {
  /**
   * Create an application
   * @param api - Datashare api interface
   * @param mode - mode of authentication ('local' or 'server'
   */
  constructor(api = apiInstance, mode = getMode(MODE_NAME.LOCAL)) {
    super()
    const Root = defineComponent({ name: 'Datashare', template: '<router-view></router-view>' })
    this._vue = createApp(Root)
    this._api = api
    this._auth = new Auth(mode, this._api)
    // Setup deferred state
    this.defer()
  }
  /**
   * Add a Vue plugin to the app
   * @param {Object} Plugin - The actual Vue plugin class
   * @param {Object} options - Option to pass to the plugin
   * @returns {Core} the current instance of Core
   */
  use(Plugin, options) {
    this.vue.use(Plugin, options)
    return this
  }
  /**
   * Configure all default Vue plugins for this application
   * @returns {Core} the current instance of Core
   */
  useAll() {
    this.usePinia()
    this.useI18n()
    this.useBootstrapVue({
      directives: true,
      components: {
        BPopover: {
          offset: '16px'
        },
        BTooltip: {
          offset: '6px',
          delay: {
            show: 0,
            hide: 0
          }
        }
      }
    })
    this.useCommons()
    this.useCore()
    return this
  }
  /**
   * Configure vue-i18n plugin
   * @returns {Core} the current instance of Core
   */
  useI18n() {
    const numberFormats = {
      'en-US': {
        currency: {
          style: 'currency',
          currency: 'USD',
          notation: 'standard'
        },
        decimal: {
          style: 'decimal',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        },
        percent: {
          style: 'percent',
          useGrouping: false
        }
      }
    }
    this._i18n = createI18n({
      warnHtmlInMessage: 'off',
      warnHtmlMessage: 'off',
      globalInjection: true,
      legacy: false,
      locale: settings.defaultLocale,
      fallbackLocale: settings.defaultLocale,
      messages: {
        [settings.defaultLocale]: messages
      },
      numberFormats
    })
    this.use(this._i18n)
    return this
  }
  /**
   * Configure bootstrap-vue plugin
   * @returns {Core} the current instance of Core
   */
  useBootstrapVue() {
    this._bootstrapVue = createBootstrap({ components: true, directives: true })
    this.use(this.bootstrapVue)
    return this
  }
  /**
   * Configure vue-router plugin
   * @returns {Core} the current instance of Core
   */
  useRouter() {
    const history = createWebHashHistory()
    this._router = createRouter({ routes, history })
    this.use(this.router)
    guards(this)
    return this
  }
  /**
   * Configure pinia
   * @returns {Core} the current instance of Core
   */
  usePinia() {
    this.use(this.pinia)
    return this
  }
  /**
   * Configure most common Vue plugins (Murmur, VueScrollTo and VueCalendar)
   * @returns {Core} the current instance of Core
   */
  useCommons() {
    this.use(VueScrollTo)
    // Set up VCalendar manually since Webpack is not compatible with
    // dynamic chunk import with third party modules.
    // @see https://github.com/nathanreyes/v-calendar/issues/413#issuecomment-530633437
    this.use(VCalendar, { componentPrefix: 'vc' })
    // Murmur is loaded without installing Vue i18n and Bootstrap Vue
    // to avoid adding them twice to the Vue instance.
    this.use(Murmur, { useI18n: false, useBootstrap: false })
    // Vue Toastify uses as separated vue instance so we must install vue-i18n
    // separately to ensure vue-i18n's methods and components are available in the toastify plugin.
    this.use(Vue3Toastify, {
      clearOnUrlChange: false,
      hideProgressBar: true,
      autoClose: 5000,
      useHandler: (app) => app.use(this.i18n)
    })
    return this
  }
  /**
   * Add a $core property to the instance's Vue
   * @returns {Core} the current instance of Core
   */
  useCore() {
    this._plugin = this.buildCorePlugin()
    this.use(this.plugin)
    return this
  }
  /**
   * Build a VueCore instance with the current Core instance
   * as a parameter of the global properties.
   * @returns {VueCore}
   */
  buildCorePlugin() {
    const core = this
    return class VueCore {
      static install(app) {
        app.config.globalProperties.$core = core
        app.config.compilerOptions.whitespace = 'preserve'
        // inject a globally available $toast object
        app.config.globalProperties.$toast = {
          toast(body, { title = null, href = null, linkLabel = null, ...options } = {}) {
            const closeOnClick = options.closeOnClick ?? !href
            const props = { title, body, href, linkLabel }
            const toastProps = { closeOnClick, ...options, icon: false, closeButton: false }
            toast?.(({ closeToast, toastProps }) => h(ToastBody, { closeToast, toastProps, ...props }), toastProps)
          },
          error(body, options) {
            this.toast(body, { ...options, type: 'error' })
          },
          danger(body, options) {
            this.toast(body, { ...options, type: 'error' })
          },
          warning(body, options) {
            this.toast(body, { ...options, type: 'warning' })
          },
          info(body, options) {
            this.toast(body, { ...options, type: 'info' })
          },
          success(body, options) {
            this.toast(body, { ...options, type: 'success' })
          }
        }
      }
    }
  }
  /**
   * Load settings from the server and instantiate most of the application configuration.
   * @async
   * @fullfil {Core} - The instance of the core application
   * @reject {Object} - The Error object
   * @returns {Promise<Object>}
   */
  async configure() {
    try {
      // Override Murmur default value for content-placeholder
      this.config.set('content-placeholder.rows', settings.contentPlaceholder.rows)
      // Get the config object
      await this.loadSettings()
      // Create the default project for the current user or redirect to login
      if (this.mode.modeName !== MODE_NAME.SERVER) {
        if (!(await this.defaultProjectExists())) {
          await this.createDefaultProject()
        }
      }
      this._auth = new Auth(this.mode)
      // Instantiate the search store
      const searchStore = this.stores.useSearchStore()
      // Set the default project only if none is already selected
      if (!searchStore.indices.length) {
        searchStore.setIndex(this.getDefaultProject())
      }
      // Initialize current locale
      await this.initializeI18n()
      // Set initial value of the theme
      setTheme(getTheme())
      // Hold a promise that is resolved when the core is configured
      return this.ready && this._readyResolve(this)
    } catch (error) {
      return this.ready && this._readyReject(error)
    }
  }

  getDefaultProject() {
    const userProjects = this.config.get('projects', []).map(iteratee('name'))
    if (userProjects.length === 0) {
      return ''
    }
    const defaultProject = this.config.get('defaultProject', '')
    return userProjects.indexOf(defaultProject) === -1 ? userProjects[0] : defaultProject
  }

  getDefaultDataDir() {
    return this.config.get('mountedDataDir') || this.config.get('dataDir')
  }

  /**
   * Mount the instance's vue application
   * @param {String} [selector=#app] - Query selector to the mounting point
   * @returns {Vue} The instantiated Vue
   */
  mount(selector = '#app') {
    this.vue.mount(selector)
    // Return an instance of the int constructor we receive.
    return this.vue
  }
  /**
   * Build a promise to be resolved when the application is configured.
   */
  defer() {
    this._ready = new Promise((resolve, reject) => {
      this._readyResolve = resolve
      this._readyReject = reject
    })
    // Notify the document the core is ready
    this._ready.then(() => this.dispatch('ready'))
  }
  /**
   * Dispatch an event from the document root, passing the core application through event message.
   * @param {String} name - Name of the event to fire
   * @param {...Mixed} args - Additional params to pass to the event
   * @returns {Core} the current instance of Core
   */
  dispatch(name, ...args) {
    dispatch(name, { app: this, core: this, ...args })
    return this
  }
  /**
   * Get the current signed user.
   * @async
   * @fullfil {Object} Current user
   * @returns {Promise<Object>}
   */
  getUser() {
    return this.api.getUser()
  }
  /**
   * Get and update user definition in place
   * @async
   * @returns {Promise}
   */
  async loadUser() {
    // Load the user
    this.config.merge(await this.getUser())
  }
  /**
   * Get settings (both from the server settings and the current mode)
   * @async
   * @returns {Promise}
   */
  async loadSettings() {
    // Get the config object
    const serverSettings = await this.api.getSettings()
    // Load the user and update the settings accordingly
    await this.loadUser()
    // Murmur exposes a config attribute which shares a Config object
    // with the current vue instance.
    this.config.merge(getMode(serverSettings.mode))
    // The backend can yet override some configuration
    this.config.merge(serverSettings)
  }
  /**
   * Append the given title to the page title
   * @param {String} title - Title to append to the page
   * @param {String} [suffix=Datashare] - Suffix to the title
   */
  setPageTitle(title = null, suffix = 'Datashare') {
    if (document && document.title) {
      document.title = title ? `${title} - ${suffix}` : suffix
    }
  }
  /**
   * Register a callback to an event using the EventBus singleton.
   * @param {String} event
   * @param {*} callback
   */
  on(event, callback) {
    EventBus.on(event, callback)
  }
  /**
   * Unregister a callback to an event using the EventBus singleton.
   * @param {String} event
   * @param {*} callback
   */
  off(event, callback) {
    EventBus.off(event, callback)
  }
  /**
   * Emit an event using the EventBus singleton.
   * @param {String} event
   * @param {*} payload
   */
  emit(event, payload) {
    EventBus.emit(event, payload)
  }
  /**
   * Get a promise that is resolved when the application is ready
   * @fullfil {Object} The actual application core instance.
   * @type {Promise<Object>}
   */
  get ready() {
    if (!this._ready) {
      this.defer()
    }
    return this._ready
  }
  /**
   * The application core instance. Deprecated in favor or the `core` property.
   * @type {Core}
   * @deprecated
   */
  get app() {
    return this
  }
  /**
   * The application core instance
   * @type {Core}
   */
  get core() {
    return this
  }
  /**
   * The Bootstrap Vue plugin instance.
   * @returns {Plugin}
   */
  get bootstrapVue() {
    return this._bootstrapVue
  }
  /**
   * The I18n instance
   * @type {I18n}
   */
  get i18n() {
    return this._i18n
  }
  /**
   * The VueRouter instance
   * @type {VueRouter}
   */
  get router() {
    return this._router
  }
  /**
   * The Pinia instance
   * @type {Pinia}
   */
  get pinia() {
    return pinia
  }
  /**
   * All Pinia stores available in the application
   */
  get stores() {
    return stores
  }
  /**
   * The CorePlugin instance
   * @returns {*}
   */
  get plugin() {
    return this._plugin
  }
  /**
   * The Auth module instance
   * @type {Auth}
   */
  get auth() {
    return this._auth
  }
  /**
   * The configuration object provided by Murmur
   * @type {Object}
   */
  get config() {
    return Murmur.config
  }
  /**
   * The Datashare api interface
   * @type {Api}
   */
  get api() {
    return this._api
  }
  /**
   * The Vue app
   * @type {Vue}
   */
  get vue() {
    return this._vue
  }
  /**
   * Get current Datashare mode
   * @type {String}
   */
  get mode() {
    return getMode(this.config.get('mode'))
  }
  /**
   * instantiate a Core class (useful for chaining usage or mapping)
   * @param {...Mixed} options - Options to pass to the Core constructor
   * @returns {Core}
   */
  static init(...options) {
    return new Core(...options)
  }
}

// Force usage of Core.init instead of constructor
const coreInit = Object.freeze({
  isInstanceOfCore: (object) => object instanceof Core,
  init: Core.init
})

export { Core }
export default coreInit
