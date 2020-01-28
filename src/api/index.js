import map from 'lodash/map'
import replace from 'lodash/replace'

import { EventBus } from '@/utils/event-bus'

export default class Api {
  constructor () {
    // Build-in fetch method must never be called by an object other than Window
    this.fetch = (...args) => window.fetch(...args)
  }
  index (options) {
    return this.sendAction(`/api/task/batchUpdate/index/file`, { method: 'POST', body: JSON.stringify({ options }) })
  }
  runBatchSearch () {
    return this.sendAction(`/api/task/batchSearch`, { method: 'POST' })
  }
  findNames (pipeline, options) {
    return this.sendAction(`/api/task/findNames/${pipeline}`, { method: 'POST', body: JSON.stringify({ options }) })
  }
  stopPendingTasks () {
    return this.sendAction('/api/task/stopAll', { method: 'PUT' })
  }
  stopTask (name) {
    return this.sendAction((`/api/task/stop/${encodeURIComponent(name)}`), { method: 'PUT' }, false)
  }
  deleteDoneTasks () {
    return this.sendAction('/api/task/clean', { method: 'POST', body: '{}' })
  }
  getTasks () {
    return this.sendAction('/api/task/all')
  }
  createIndex (project) {
    return this.sendAction(`/api/index/${project}`, { method: 'PUT' }, false)
  }
  deleteAll (project) {
    return this.sendAction(`/api/project/${project}`, { method: 'DELETE' }, false)
  }
  getVersion () {
    return this.sendAction('/version')
  }
  getConfig () {
    return this.sendAction('/api/config').catch(err => {
      if (err && err.response && err.response.status === 401) {
        return this.sendAction('/config')
      } else {
        throw err
      }
    })
  }
  setConfig (config) {
    return this.sendAction('/api/config', { method: 'PATCH', body: JSON.stringify({ data: config }), headers: { 'Content-Type': 'application/json' } }, false)
  }
  deleteNamedEntitiesByMentionNorm (project, mentionNorm) {
    return this.sendAction(`/api/${project}/namedEntities/hide/${mentionNorm}`, { method: 'PUT' }, false)
  }
  getSource (document) {
    return this.sendAction(document.url, {}, false)
  }
  getStarredDocuments (project) {
    return this.sendAction(`/api/${project}/documents/starred`)
  }
  starDocuments (project, documents) {
    return this.sendAction(`/api/${project}/documents/batchUpdate/star`, { method: 'POST', body: JSON.stringify(documents) })
  }
  unstarDocuments (project, documents) {
    return this.sendAction(`/api/${project}/documents/batchUpdate/unstar`, { method: 'POST', body: JSON.stringify(documents) })
  }
  getTags (project, documentId) {
    return this.sendAction(`/api/${project}/documents/tags/${documentId}`)
  }
  tagDocument (project, documentId, routingId, tags) {
    return this.sendAction(`/api/${project}/documents/tag/${documentId}?routing=${routingId}`, { method: 'PUT', body: JSON.stringify(tags) }, false)
  }
  untagDocument (project, documentId, routingId, tags) {
    return this.sendAction(`/api/${project}/documents/untag//${documentId}?routing=${routingId}`, { method: 'PUT', body: JSON.stringify(tags) }, false)
  }
  tagDocuments (project, docIds, tags) {
    return this.sendAction(`/api/${project}/documents/batchUpdate/tag`, { method: 'POST', body: JSON.stringify({ docIds, tags }) }, false)
  }
  untagDocuments (project, docIds, tags) {
    return this.sendAction(`/api/${project}/documents/batchUpdate/untag`, { method: 'POST', body: JSON.stringify({ docIds, tags }) }, false)
  }
  batchSearch (name, csvFile, description, project, phraseMatch, fuzziness, fileTypes, paths, published) {
    const body = new FormData()
    body.append('name', name)
    body.append('csvFile', csvFile)
    body.append('description', description)
    body.append('phrase_matches', phraseMatch)
    body.append('fuzziness', fuzziness)
    map(fileTypes, fileType => body.append('fileTypes', fileType.mime))
    map(paths, path => body.append('paths', path))
    body.append('published', published)
    return this.sendAction(`/api/batch/search/${project}`, { method: 'POST', body }, false)
  }
  getBatchSearches () {
    return this.sendAction('/api/batch/search')
  }
  getBatchSearchResults (batchId, from = 0, size = 100, queries = [], sort = 'doc_nb', order = 'desc') {
    return this.sendAction(`/api/batch/search/result/${batchId}`, { method: 'POST', body: JSON.stringify({ from, size, queries, sort, order }) })
  }
  deleteBatchSearch (batchId) {
    return this.sendAction(`/api/batch/search/${batchId}`, { method: 'DELETE' }, false)
  }
  deleteBatchSearches () {
    return this.sendAction('/api/batch/search', { method: 'DELETE' }, false)
  }
  updateBatchSearch (batchId, published) {
    return this.sendAction(`/api/batch/search/${batchId}`, { method: 'PATCH', body: JSON.stringify({ data: { published: published } }) })
  }
  static getFullUrl (path) {
    const base = process.env.VUE_APP_DS_HOST || `${window.location.protocol}//${window.location.host}`
    const url = new URL(path, base)
    return url.href
  }
  isDownloadAllowed (project) {
    return this.sendAction(`/api/project/isDownloadAllowed/${project}`, {}, false)
  }
  retrieveNotes (project, path) {
    return this.sendAction(replace(`/api/${project}/notes/${path}`, '//', '/'))
  }
  async sendAction (url, params = {}, json = true) {
    const r = await this.fetch(Api.getFullUrl(url), params)
    if (r.status >= 200 && r.status < 300) {
      return json ? r.clone().json() : r
    } else {
      EventBus.$emit('http::error', r)
      const error = new Error(`${r.status} ${r.statusText}`)
      error.response = r
      throw error
    }
  }
}
