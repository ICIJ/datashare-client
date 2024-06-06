import Murmur from '@icij/murmur-next'
import VCalendar from 'v-calendar'
import VueEllipseProgress from 'vue-ellipse-progress'
import VueScrollTo from 'vue-scrollto'
import VueShortkey from 'vue3-shortkey'
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

  static init(...options) {
    return new CoreSetup(...options)
  }
}

export default CoreSetup
