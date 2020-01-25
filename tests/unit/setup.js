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
