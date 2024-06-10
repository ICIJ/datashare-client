import Murmur from '@icij/murmur-next'
import VCalendar from 'v-calendar'
import VueEllipseProgress from 'vue-ellipse-progress'
import VueScrollTo from 'vue-scrollto'
import VueShortkey from 'vue3-shortkey'
import { createVueWait } from 'vue-wait'
import { createMemoryHistory, createRouter, createWebHashHistory } from 'vue-router'

import { Core } from '@/core/Core'
import { routes } from '@/router'
import guards from '@/router/guards'

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

  useRouter(routes = null) {
    if (routes) {
      this.router = createRouter({ routes, history: createMemoryHistory() })
      this.use(this.router)
      return this
    }
    return super.useRouter()
  }

  static init(...options) {
    return new CoreSetup(...options)
  }
}

export default CoreSetup
