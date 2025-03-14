import 'whatwg-fetch'

// This mock ensures that the EllipsisTooltip directove from @icij/murmur-next
// is mocked and does not throw an error when used in the tests. It's a temporary
// workaround until the directive is properly unmounted.
vi.mock('@icij/murmur-next', async (importOriginal) => {
  const original = await importOriginal()
  const EllipsisTooltip = {}
  return { ...original, EllipsisTooltip }
})

// This is a another temporary workaround to avoid the following console.log
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
