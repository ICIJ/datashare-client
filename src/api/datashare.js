import 'whatwg-fetch'

export class DatashareClient {
  index (path, options) {
    return fetch('/task/index/file/' + path.replace(/\//g, '%7C'), {method: 'POST', body: JSON.stringify({options})})
  }
  findNames (pipeline, options) {
    return fetch(`/task/findNames/${pipeline}`, {method: 'POST', body: JSON.stringify({options})})
  }
  cleanTasks () {
    return fetch('/task/clean/', {method: 'POST', body: '{}'})
  }
  getTasks () {
    return fetch('/task/')
  }
}
