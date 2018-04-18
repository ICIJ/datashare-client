import 'whatwg-fetch'

export class DatashareClient {
  index (path) {
    return fetch('/task/index/file/' + path.replace(/\//g, '%7C'), {method: 'POST', body: '{}'})
  }
  extract (pipeline) {
    return fetch(`/task/extract/${pipeline}`, {method: 'POST', body: '{}'})
  }
  cleanTasks () {
    return fetch('/task/clean/', {method: 'POST', body: '{}'})
  }
  getTasks () {
    return fetch('/task/')
  }
}
