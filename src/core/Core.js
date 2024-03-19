// BootstrapVue recommends using this
import 'mutationobserver-shim'

import compose from 'lodash/fp/compose'
import Murmur from '@icij/murmur-next'
import VCalendar from 'v-calendar'
import VueScrollTo from 'vue-scrollto'
import VueShortkey from 'vue3-shortkey'
import VueEllipseProgress from 'vue-ellipse-progress'
import { createBootstrap } from 'bootstrap-vue-next'
import { createVueWait } from 'vue-wait'
import { createApp, defineComponent } from 'vue'
import { createI18n } from 'vue-i18n'
import { createWebHashHistory, createRouter } from 'vue-router'
import { iteratee } from 'lodash'

import ComponentsMixin from './ComponentsMixin'
import FiltersMixin from './FiltersMixin'
import HooksMixin from './HooksMixin'
import I18nMixin from './I18nMixin'
import PipelinesMixin from './PipelinesMixin'
import ProjectsMixin from './ProjectsMixin'
import WidgetsMixin from './WidgetsMixin'

import { dispatch } from '@/utils/event-bus'
import Auth from '@/api/resources/Auth'
import messages from '@/lang/en'
import { getMode, MODE_NAME } from '@/mode'
import { routes } from '@/router'
import guards from '@/router/guards'
import { storeBuilder } from '@/store/storeBuilder'
import settings from '@/utils/settings'

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
  constructor(api = null, mode = getMode(MODE_NAME.LOCAL)) {
    super()
    const Root = defineComponent({ template: '<router-view></router-view>' })
    this._vue = createApp(Root)
    this._api = api
    this._store = storeBuilder(api)
    this._auth = new Auth(mode, this._api)
    // Setup deferred state
    this.defer()
  }
  /**
   * Add a Vue plugin to the instance's LocalVue
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
    this.useVuex()
    this.useI18n()
    this.useBootstrapVue()
    this.useCommons()
    this.useRouter()
    this.useWait()
    this.useCore()
    return this
  }
  /**
   * Configure vue-i18n plugin
   * @returns {Core} the current instance of Core
   */
  useI18n() {
    this._i18n = createI18n({
      warnHtmlMessage: false,
      globalInjection: true,
      legacy: true,
      locale: settings.defaultLocale,
      fallbackLocale: settings.defaultLocale,
      messages: {
        [settings.defaultLocale]: messages
      }
    })
    this.use(this._i18n)
    return this
  }
  /**
   * Configure bootstrap-vue plugin
   * @returns {Core} the current instance of Core
   */
  useBootstrapVue() {
    this.use(
      createBootstrap({
        components: true,
        directives: true,
        BPopover: {
          boundaryPadding: 14
        },
        BTooltip: {
          boundaryPadding: 0
        }
      })
    )
    return this
  }
  /**
   * Configure vue-router plugin
   * @returns {Core} the current instance of Core
   */
  useRouter() {
    const history = createWebHashHistory()
    this.router = createRouter({ routes, history })
    this.use(this.router)
    guards(this)
    return this
  }
  /**
   * Configure vuex plugin
   * @returns {Core} the current instance of Core
   */
  useVuex() {
    this.use(this.store)
    return this
  }
  /**
   * Configure most common Vue plugins (Murmur, VueShortkey, VueScrollTo and VueCalendar)
   * @returns {Core} the current instance of Core
   */
  useCommons() {
    // Common plugins
    this.use(Murmur)
    this.use(VueShortkey, { prevent: settings.hotKeyPrevented })
    this.use(VueScrollTo)
    this.use(VueEllipseProgress)
    // Setup VCalendar manually since Webpack is not compatible with
    // dynamic chunk import with third party modules.
    // @see https://github.com/nathanreyes/v-calendar/issues/413#issuecomment-530633437
    this.use(VCalendar, { componentPrefix: 'vc' })
    return this
  }
  /**
   * Configure vue-wait plugin
   * @returns {Core} the current instance of Core
   */
  useWait() {
    this.wait = createVueWait({ useVuex: true })
    this.use(this.wait)
    return this
  }
  /**
   * Add a $core property to the instance's Vue
   * @returns {Core} the current instance of Core
   */
  useCore() {
    const core = this
    this.use(
      class VueCore {
        static install(app) {
          app.config.globalProperties.$core = core
        }
      }
    )
    return this
  }
  /**
   * Load settings from the server and instantiate most the application configuration.
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
      if (this.mode.modeName !== 'server') {
        if (!(await this.defaultProjectExists())) {
          await this.createDefaultProject()
        }
      }
      this._auth = new Auth(this.mode)
      // Set the default project
      if (!this.store.state.search.indices.length) {
        this.store.commit('search/indices', [this.getDefaultProject()])
      }
      // Check if "Download" functionality is available for the selected project
      // Because otherwise, if the FilterPanel is closed, it is never called
      await this.store.dispatch('downloads/fetchIndicesStatus')
      // Initialize current locale
      await this.initializeI18n()
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
   * Get and update user definitionin place
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
   * The I18n instance
   * @type {I18n}
   */
  get i18n() {
    return this._i18n
  }
  /**
   * The Vue class to instantiate the application with
   * @type {Vue}
   */
  get localVue() {
    return this.LocalVue
  }
  /**
   * The Vuex instance
   * @type {Vuex.Store}
   */
  get store() {
    return this._store
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
export default coreInit
