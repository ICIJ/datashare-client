global.console = Object.assign(global.console, {
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn()
})
