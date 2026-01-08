import 'whatwg-fetch'
import { config } from '@vue/test-utils'
import { ref } from 'vue'

// Provide mock context for bootstrap-vue-next directives that require BApp (v0.30+)
// Different versions use different key formats, so we provide both
const defaultsKeyPlugin = 'BootstrapVueNext__ID__defaults__plugin__' // v0.30.4 (murmur-next)
const defaultsKeyRegistry = 'BootstrapVueNext__ID__defaults__registry__' // v0.30.5
const defaultsValue = ref({})

config.global.provide = {
  ...config.global.provide,
  [defaultsKeyPlugin]: defaultsValue,
  [defaultsKeyRegistry]: defaultsValue
}

// Save the original log method for later use
const log = global.console.log

global.console = Object.assign(global.console, {
  warn: vi.fn(),
  info: vi.fn(),
  log
})

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
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
