global.console = Object.assign(global.console, {
  warn: jest.fn(),
  info: jest.fn()
})
