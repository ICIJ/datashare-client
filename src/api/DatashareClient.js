import { EventBus } from '@/utils/event-bus'
import fetchPonyfill from 'fetch-ponyfill'

export class DatashareClient {
  constructor () {
    if (window.fetch) {
      // Build-in fetch method must never be called by an object other than Window
      this.fetch = (...args) => window.fetch(...args)
    } else {
      this.fetch = fetchPonyfill().fetch
    }
  }
  index (options) {
    return this.sendAction(`/api/task/index/file`, { method: 'POST', body: JSON.stringify({ options }), credentials: 'same-origin' })
  }
  findNames (pipeline, options) {
    return this.sendAction(`/api/task/findNames/${pipeline}`, { method: 'POST', body: JSON.stringify({ options }), credentials: 'same-origin' })
  }
  stopPendingTasks () {
    return this.sendAction('/api/task/clean/', { method: 'POST', body: '{}', credentials: 'same-origin' })
  }
  deleteDoneTasks () {
    return this.sendAction('/api/task/clean/', { method: 'POST', body: '{}', credentials: 'same-origin' })
  }
  getTasks () {
    return this.sendAction('/api/task/', { credentials: 'same-origin' })
  }
  createIndex () {
    return this.sendAction('/api/search/createIndex', { method: 'PUT', credentials: 'same-origin' })
  }
  getVersion () {
    return this.sendAction('/version')
  }
  getConfig () {
    return this.sendAction('/config')
  }
  deleteNamedEntitiesByMentionNorm (mentionNorm) {
    return this.sendAction(`/api/namedEntity/hide/${mentionNorm}`, { method: 'PUT', credentials: 'same-origin' })
  }
  static getFullUrl (url) {
    return `${process.env.VUE_APP_DS_HOST || ''}${url}`
  }
  getSource (relativeUrl) {
    return this.sendAction(relativeUrl, { credentials: 'same-origin' })
  }
  getIndices () {
    return this.sendAction('/api/user/indices')
  }
  sendAction (url, params) {
    return this.fetch(DatashareClient.getFullUrl(url), params).then(r => {
      if (r.status >= 200 && r.status < 300) {
        return r
      } else {
        EventBus.$emit('http::error', r)
        const error = new Error(`${r.status} ${r.statusText}`)
        error.response = r
        throw error
      }
    })
  }
}

export default DatashareClient
