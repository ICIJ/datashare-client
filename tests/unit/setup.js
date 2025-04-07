import 'whatwg-fetch'

// Save the original log method for later use
const log = global.console.log

global.console = Object.assign(global.console, {
  warn: vi.fn(),
  info: vi.fn(),
  log
})

// We globally mock toastify toast function because toaster components are not mounted
// with the app plugins in test, causing flaky tests and unecessary errors
vi.mock('vue3-toastify', async (importOrifinal) => {
  const actual = await importOrifinal()
  const toast = vi.fn()
  return { ...actual, toast }
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
