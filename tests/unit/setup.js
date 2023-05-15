import 'whatwg-fetch'
import { fas as fasIcons } from '@fortawesome/free-solid-svg-icons'
import { far as farIcons } from '@fortawesome/free-regular-svg-icons'
import { fab as fabIcons } from '@fortawesome/free-brands-svg-icons'
import { library as fortawesome } from '@fortawesome/fontawesome-svg-core'

// Register all icons
fortawesome.add(...Object.values(fasIcons))
fortawesome.add(...Object.values(farIcons))
fortawesome.add(...Object.values(fabIcons))

global.console = Object.assign(global.console, {
  warn: jest.fn(),
  info: jest.fn()
})

window.matchMedia = jest.fn().mockImplementation((query) => {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn()
  }
})

window.scrollTo = jest.fn()
