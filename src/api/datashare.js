import 'whatwg-fetch'

export class DatashareClient {
  index (path) {
    return fetch('/tasks/index/file/' + path.replace(/\//g, '%7C'), {method: 'POST', body: '{}'})
  }
  extract (pipeline) {
    return fetch(`/tasks/extract/${pipeline}`, {method: 'POST', body: '{}'})
  }
}
