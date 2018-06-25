import 'whatwg-fetch'

export class DatashareClient {
  index (path, options) {
    return fetch(`/task/index/file${path}`, {method: 'POST', body: JSON.stringify({options}), credentials: 'same-origin'})
  }
  findNames (pipeline, options) {
    return fetch(`/task/findNames/${pipeline}`, {method: 'POST', body: JSON.stringify({options}), credentials: 'same-origin'})
  }
  cleanTasks () {
    return fetch('/task/clean/', {method: 'POST', body: '{}', credentials: 'same-origin'})
  }
  getTasks () {
    return fetch('/task/', {credentials: 'same-origin'})
  }
  createIndex () {
    return fetch('/search/createIndex', {method: 'PUT', credentials: 'same-origin'})
  }
  getSource (url) {
    return fetch(url).then((r) => {
      if (r.status >= 200 && r.status < 300) {
        return r
      } else {
        var error = new Error(`${r.status} ${r.statusText}`)
        error.response = r
        throw error
      }
    })
  }
}
