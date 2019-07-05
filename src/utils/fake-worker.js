/**
 * This is a quick and dirty workaround to fix Worker on JSDom and Jest.
 * It implements a very simple version of the Worker API.
 */
export default class FakeWorker {
  constructor () {
    this.events = { message: [] }
  }
  terminate () {
    this.events = { message: [] }
  }
  addEventListener (name = 'message', func) {
    this.events[name] = this.events[name] || []
    this.events[name].push(func)
  }
  removeEventListener (name = 'message', func) {
    this.events[name] = this.events[name] || []
    this.events[name] = this.events[name].filter(registeredFunc => registeredFunc !== func)
  }
  postMessage (data) {
    this.events['message'].forEach(func => {
      func({ data })
    })
  }
}
