import 'whatwg-fetch'
import { fas as fasIcons } from '@fortawesome/free-solid-svg-icons'
import { far as farIcons } from '@fortawesome/free-regular-svg-icons'
import { fab as fabIcons } from '@fortawesome/free-brands-svg-icons'
import { library as fortawesome } from '@fortawesome/fontawesome-svg-core'

// Register all icons
fortawesome.add(...Object.values(fasIcons))
fortawesome.add(...Object.values(farIcons))
fortawesome.add(...Object.values(fabIcons))

// This is a temporary workaround to avoid the following console.log
// that are printed during the tests by vue-wait and vue3-shortkey.
const SILENCED_LOGS = ['installing...', 'doing fixed mapping']
// Save the original log method for later use
const log = global.console.log

global.console = Object.assign(global.console, {
  warn: vi.fn(),
  info: vi.fn(),
  log: vi.fn().mockImplementation((message, ...args) => {
    if (!SILENCED_LOGS.includes(message)) {
      log(message, ...args)
    }
  })
})

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

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
