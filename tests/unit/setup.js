import 'whatwg-fetch'

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

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})

Object.defineProperty(document, 'fonts', {
  ready: Promise.resolve()
})

Object.defineProperty(window, 'scrollTo', vi.fn())
