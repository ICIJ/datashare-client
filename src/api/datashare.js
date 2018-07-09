import 'whatwg-fetch'

export class DatashareClient {
  index (options) {
    return this.sendAction(`/api/task/index/file`, {method: 'POST', body: JSON.stringify({options}), credentials: 'same-origin'})
  }
  findNames (pipeline, options) {
    return this.sendAction(`/api/task/findNames/${pipeline}`, {method: 'POST', body: JSON.stringify({options}), credentials: 'same-origin'})
  }
  cleanTasks () {
    return this.sendAction('/api/task/clean/', {method: 'POST', body: '{}', credentials: 'same-origin'})
  }
  getTasks () {
    return this.sendAction('/api/task/', {credentials: 'same-origin'})
  }
  createIndex () {
    return this.sendAction('/api/search/createIndex', {method: 'PUT', credentials: 'same-origin'})
  }
  static getFullUrl (url) {
    let dsHost = process.env.CONFIG.ds_host || ''
    return `${dsHost}${url}`
  }
  getSource (url) {
    return fetch(DatashareClient.getFullUrl(url)).then((r) => {
      if (r.status >= 200 && r.status < 300) {
        return r
      } else if (r.status === 401) {
        window.location.assign(window.location.hostname + ':' + window.location.port + process.env.CONFIG.ds_auth_signin)
      } else {
        var error = new Error(`${r.status} ${r.statusText}`)
        error.response = r
        throw error
      }
    })
  }
  sendAction (url, params) {
    return fetch(DatashareClient.getFullUrl(url), params).then((r) => {
      if (r.status === 401) {
        window.location.assign(window.location.protocol + '//' +
          window.location.hostname + ':' + window.location.port + process.env.CONFIG.ds_auth_signin)
      } else {
        return r
      }
    })
  }
}
