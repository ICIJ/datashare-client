import { EventBus } from '@/utils/event-bus'
import fetchPonyfill from 'fetch-ponyfill'
import map from 'lodash/map'

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
  createIndex () {
    return this.sendAction('/api/index/create', { method: 'PUT' }, false)
  }
  deleteAll (projectId) {
    return this.sendAction(`/api/project/id/${encodeURIComponent(projectId)}`, { method: 'DELETE' }, false)
  }
  getVersion () {
    return this.sendAction('/version')
  }
  getConfig () {
    return this.sendAction('/api/config').catch(err => {
      if (err && err.response.status === 401) {
        return this.sendAction('/config')
      } else {
        throw err
      }
    })
  }
  deleteNamedEntitiesByMentionNorm (mentionNorm) {
    return this.sendAction(`/api/namedEntity/hide/${mentionNorm}`, { method: 'PUT' }, false)
  }
  getSource (document) {
    return this.sendAction(document.url, {}, false)
  }
  getStarredDocuments (project) {
    return this.sendAction(`/api/document/project/starred/${encodeURIComponent(project)}`)
  }
  starDocuments (project, documents) {
    return this.sendAction(`/api/document/project/${encodeURIComponent(project)}/group/star`, { method: 'POST', body: JSON.stringify(documents) })
  }
  unstarDocuments (project, documents) {
    return this.sendAction(`/api/document/project/${encodeURIComponent(project)}/group/unstar`, { method: 'POST', body: JSON.stringify(documents) })
  }
  getTags (project, documentId) {
    return this.sendAction(`/api/document/project/${encodeURIComponent(project)}/tag/${documentId}`)
  }
  tagDocument (project, documentId, routingId, tags) {
    return this.sendAction(`/api/document/project/tag/${encodeURIComponent(project)}/${encodeURIComponent(documentId)}?routing=${encodeURIComponent(routingId)}`, { method: 'PUT', body: JSON.stringify(tags) }, false)
  }
  untagDocument (project, documentId, routingId, tags) {
    return this.sendAction(`/api/document/project/untag/${encodeURIComponent(project)}/${encodeURIComponent(documentId)}?routing=${encodeURIComponent(routingId)}`, { method: 'PUT', body: JSON.stringify(tags) }, false)
  }
  tagDocuments (project, docIds, tags) {
    return this.sendAction(`/api/document/project/${encodeURIComponent(project)}/group/tag`, { method: 'POST', body: JSON.stringify({ docIds, tags }) }, false)
  }
  untagDocuments (project, docIds, tags) {
    return this.sendAction(`/api/document/project/${encodeURIComponent(project)}/group/untag`, { method: 'POST', body: JSON.stringify({ docIds, tags }) }, false)
  }
  batchSearch (name, csvFile, description, project, phraseMatch, fuzziness, fileTypes, paths, published) {
    const body = new FormData()
    body.append('name', name)
    body.append('description', description)
    body.append('csvFile', csvFile)
    body.append('published', published)
    map(fileTypes.split(' '), fileType => body.append('fileTypes', fileType))
    body.append('fuzziness', fuzziness)
    map(paths.split(' '), path => body.append('paths', path))
    body.append('phrase_matches', phraseMatch)
    return this.sendAction(`/api/batch/search/${encodeURIComponent(project)}`, { method: 'POST', body }, false)
  }
  getBatchSearches () {
    return this.sendAction('/api/batch/search')
  }
  getBatchSearchResults (batchId, from = 0, size = 100, queries = [], sort = 'doc_nb', order = 'desc') {
    return this.sendAction(`/api/batch/search/result/${encodeURIComponent(batchId)}`, { method: 'POST', body: JSON.stringify({ from, size, queries, sort, order }) })
  }
  deleteBatchSearch (batchId) {
    return this.sendAction(`/api/batch/search/${encodeURIComponent(batchId)}`, { method: 'DELETE' }, false)
  }
  deleteBatchSearches () {
    return this.sendAction('/api/batch/search', { method: 'DELETE' }, false)
  }
  static getFullUrl (path) {
    const base = process.env.VUE_APP_DS_HOST || `${window.location.protocol}//${window.location.host}`
    const url = new URL(path, base)
    return url.href
  }
  isDownloadAllowed (project) {
    return this.sendAction(`/api/project/isAllowed/${encodeURIComponent(project)}`, {}, false)
  }
  async sendAction (url, params = {}, json = true) {
    const r = await this.fetch(DatashareClient.getFullUrl(url), params)
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

export default DatashareClient
