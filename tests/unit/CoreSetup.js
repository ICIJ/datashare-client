import Murmur from '@icij/murmur-next'
import VCalendar from 'v-calendar'
import VueEllipseProgress from 'vue-ellipse-progress'
import VueScrollTo from 'vue-scrollto'
import VueShortkey from 'vue3-shortkey'
import { createVueWait } from 'vue-wait'
import { createStore } from 'vuex'
import { createMemoryHistory, createRouter } from 'vue-router'

import { Core } from '@/core/Core'

class CoreSetup extends Core {
  get plugins() {
    return [
      this.plugin,
      this.bootstrapVue,
      this.i18n,
      this.murmur,
      this.store,
      this.vueShortkey,
      this.vueScrollTo,
      this.vueEllipseProgress,
      this.vCalendar,
      this.wait,
      this.router
    ]
  }
  get murmur() {
    return Murmur
  }
  get vueShortkey() {
    return VueShortkey
  }
  get vueScrollTo() {
    return VueScrollTo
  }
  get vueEllipseProgress() {
    return VueEllipseProgress
  }
  get vCalendar() {
    return VCalendar
  }
  get wait() {
    return createVueWait({ useVuex: true })
  }
  useAll(store= null) {
    if (store) {
      this.useVuex(store)
      this.useI18n()
      this.useBootstrapVue()
      this.useCommons()
      this.useWait()
      this.useCore()
      return this
    }
    return super.useAll()
  }
  useVuex(store = null) {
    if (store) {
      this._store = store
      this.use(this.store)
      return this
    }
    return super.useVuex()
  }
  useRouter(routes = null) {
    if (routes) {
      this._router = createRouter({ routes, history: createMemoryHistory() })
      this.use(this.router)
      return this
    }
    return super.useRouter()
  }
  useVuex(options = null) {
    if (options) {
      this._store = createStore(options)
      this.use(this.store)
      return this
    }
    return super.useVuex()
  }

  static init(...options) {
    return new CoreSetup(...options)
  }
}

export default CoreSetup
