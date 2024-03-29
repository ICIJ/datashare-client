import 'whatwg-fetch'
import Vue from 'vue'
import { fas as fasIcons } from '@fortawesome/free-solid-svg-icons'
import { far as farIcons } from '@fortawesome/free-regular-svg-icons'
import { fab as fabIcons } from '@fortawesome/free-brands-svg-icons'
import { library as fortawesome } from '@fortawesome/fontawesome-svg-core'

Vue.config.productionTip = false
Vue.config.devtools = false

// Register all icons
fortawesome.add(...Object.values(fasIcons))
fortawesome.add(...Object.values(farIcons))
fortawesome.add(...Object.values(fabIcons))

global.console = Object.assign(global.console, {
  warn: vi.fn(),
  info: vi.fn()
})

document.fonts = {}
document.fonts.ready = Promise.resolve()

window.matchMedia = vi.fn().mockImplementation((query) => {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn()
  }
})

window.scrollTo = vi.fn()
