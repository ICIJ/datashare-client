import Murmur from '@icij/murmur-next'
import VCalendar from 'v-calendar'
import VueScrollTo from 'vue-scrollto'
import VueShortkey from 'vue3-shortkey'
import { createVueWait } from 'vue-wait'
import { createWebHashHistory, createRouter } from 'vue-router'

import { Core } from '@/core/Core'
import { routes } from '@/router'

class CoreSetup extends Core {
  get plugins() {
    return [
      this.plugin,
      this.bootstrapVue,
      this.i18n,
      [this.murmur, { useI18n: false, useBootstrap: false }],
      this.pinia,
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
  get vCalendar() {
    return VCalendar
  }
  get wait() {
    return createVueWait()
  }
  useAll(store = null) {
    this.usePinia()
    this.useVuex(store)
    this.useI18n()
    this.useBootstrapVue()
    this.useCommons()
    this.useWait()
    this.useCore()
    return this
  }
  useVuex(options = null) {
    if (options) {
      this.use(this.store)
      return this
    }
    return super.useVuex()
  }
  useRouter(routes = null) {
    if (routes) {
      const history = createWebHashHistory()
      this._router = createRouter({ routes, history })
      this.use(this.router)
      return this
    }
    return super.useRouter()
  }
  useRouterWithoutGuards() {
    const history = createWebHashHistory()
    this._router = createRouter({ routes, history })
    this.use(this.router)
    return this
  }
  static init(...options) {
    return new CoreSetup(...options)
  }
}

export default CoreSetup
