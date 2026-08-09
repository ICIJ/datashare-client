import 'whatwg-fetch'

// Node 22+ ships a native `localStorage` that throws on access unless the
// runtime is launched with `--localstorage-file`. Some sandboxed CI
// environments hit this at the very first access made by `@vue/devtools-kit`
// (loaded transitively by Pinia). Replace the throwing native getter with an
// in-memory shim so module init code reading `localStorage.getItem(...)`
// directly does not crash; jsdom-provided `window.localStorage` already
// works for tests that explicitly use it.
try {
  // Probe the native global; if it throws, install an in-memory shim.
  void globalThis.localStorage
}
catch {
  const store = new Map()
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: k => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: k => store.delete(k),
      clear: () => store.clear(),
      key: i => Array.from(store.keys())[i] ?? null,
      get length() { return store.size }
    }
  })
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
