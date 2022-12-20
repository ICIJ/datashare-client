import 'whatwg-fetch'

global.console = Object.assign(global.console, {
  warn: jest.fn(),
  info: jest.fn()
})

window.matchMedia = jest.fn().mockImplementation(query => {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn()
  }
})

window.WebKitCSSMatrix = class {
  constructor () {
    return { m41: 0, m42: 0 }
  }
}

window.scrollTo = jest.fn()
