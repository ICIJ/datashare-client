import fetchPonyfill from 'fetch-ponyfill';

export class DatashareClient {
  constructor({ fetch = window.fetch || fetchPonyfill().fetch } = { }) {
    this.fetch = fetch
  }
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
  getVersion () {
    return this.sendAction('/version')
  }
  static getFullUrl (url) {
    return `${process.env.VUE_APP_DS_HOST || ''}${url}`
  }
  getSource (relativeUrl) {
    return this.fetch(DatashareClient.getFullUrl(relativeUrl), {credentials: 'same-origin'}).then((r) => {
      if (r.status >= 200 && r.status < 300) {
        return r
      } else if (r.status === 401) {
        this.redirectToAuth()
      } else {
        var error = new Error(`${r.status} ${r.statusText}`)
        error.response = r
        throw error
      }
    })
  }

  sendAction (url, params) {
    return this.fetch(DatashareClient.getFullUrl(url), params).then((r) => {
      if (r.status === 401) {
        this.redirectToAuth()
      } else {
        return r
      }
    })
  }

  redirectToAuth () {
    window.location.assign(process.env.VUE_APP_DS_AUTH_SIGNIN)
  }
}

export default DatashareClient
