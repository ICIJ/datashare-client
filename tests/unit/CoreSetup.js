import Murmur from '@icij/murmur-next'
import VCalendar from 'v-calendar'
import VueScrollTo from 'vue-scrollto'
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
      this.vueScrollTo,
      this.vCalendar,
      this.router
    ]
  }

  get murmur() {
    return Murmur
  }

  get vueScrollTo() {
    return VueScrollTo
  }

  get vCalendar() {
    return VCalendar
  }

  useAll() {
    this.usePinia()
    this.useI18n()
    this.useBootstrapVue()
    this.useCommons()
    this.useCore()
    return this
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
