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
    return this.sendAction(`/api/task/index/file`, { method: 'POST', body: JSON.stringify({ options }) })
  }
  findNames (pipeline, options) {
    return this.sendAction(`/api/task/findNames/${pipeline}`, { method: 'POST', body: JSON.stringify({ options }) })
  }
  stopPendingTasks () {
    return this.sendAction('/api/task/stopAll', { method: 'PUT' })
  }
  stopTask (name) {
    return this.sendAction((`/api/task/stop/${encodeURIComponent(name)}`), { method: 'PUT' })
  }
  deleteDoneTasks () {
    return this.sendAction('/api/task/clean', { method: 'POST', body: '{}' })
  }
  getTasks () {
    return this.sendAction('/api/task/all')
  }
  createIndex () {
    return this.sendAction('/api/index/create', { method: 'PUT' })
  }
  deleteAll (projectId) {
    return this.sendAction(`/api/project/id/${encodeURIComponent(projectId)}`, { method: 'DELETE' }, false)
  }
  getVersion () {
    return this.sendAction('/version')
  }
  getConfig () {
    return this.sendAction('/api/config')
  }
  deleteNamedEntitiesByMentionNorm (mentionNorm) {
    return this.sendAction(`/api/namedEntity/hide/${mentionNorm}`, { method: 'PUT' })
  }
  getSource (document) {
    return this.sendAction(document.url, {}, false)
  }
  getStarredDocuments (project) {
    return this.sendAction(`/api/document/project/starred/${encodeURIComponent(project)}`)
  }
  starDocument (project, documentId) {
    return this.sendAction(`/api/document/project/star/${encodeURIComponent(project)}/${encodeURIComponent(documentId)}`, { method: 'PUT' })
  }
  unstarDocument (project, documentId) {
    return this.sendAction(`/api/document/project/unstar/${encodeURIComponent(project)}/${encodeURIComponent(documentId)}`, { method: 'PUT' })
  }
  tagDocument (project, documentId, routingId, tags) {
    return this.sendAction(`/api/document/project/tag/${encodeURIComponent(project)}/${encodeURIComponent(documentId)}?routing=${encodeURIComponent(routingId)}`, { method: 'PUT', body: JSON.stringify(tags) })
  }
  untagDocument (project, documentId, routingId, tags) {
    return this.sendAction(`/api/document/project/untag/${encodeURIComponent(project)}/${encodeURIComponent(documentId)}?routing=${encodeURIComponent(routingId)}`, { method: 'PUT', body: JSON.stringify(tags) })
  }
  batchSearch (project, name, description, csvFile) {
    const form = new FormData()
    form.append('name', name)
    form.append('description', description)
    form.append('csvFile', csvFile)
    return this.sendAction(`/api/batch/search/${encodeURIComponent(project)}`, { method: 'POST', body: form }, false)
  }
  getBatchSearches () {
    return this.sendAction('/api/batch/search')
  }
  getBatchSearchResults (batchId, from = 0, size = 100) {
    return this.sendAction(`/api/batch/search/result/${encodeURIComponent(batchId)}?from=${encodeURIComponent(from.toString())}&size=${encodeURIComponent(size.toString())}`)
  }
  deleteBatchSearches () {
    return this.sendAction('/api/batch/search', { method: 'DELETE' }, false)
  }
  static getFullUrl (path) {
    const base = process.env.VUE_APP_DS_HOST || `${window.location.protocol}//${window.location.host}`
    const url = new URL(path, base)
    return url.href
  }
  sendAction (url, params = {}, json = true) {
    return this.fetch(DatashareClient.getFullUrl(url), params).then(r => {
      if (r.status >= 200 && r.status < 300) {
        return json ? r.clone().json() : r
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
