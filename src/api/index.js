import join from 'lodash/join'
import map from 'lodash/map'
import replace from 'lodash/replace'
import axios from 'axios'

import { EventBus } from '@/utils/event-bus'

export default class Api {
  index (options) {
    return this.sendActionAsText('/api/task/batchUpdate/index/file', { method: 'POST', data: { options } })
  }
  runBatchSearch () {
    return this.sendAction('/api/task/batchSearch', { method: 'POST' })
  }
  findNames (pipeline, options) {
    return this.sendActionAsText(`/api/task/findNames/${pipeline}`, { method: 'POST', data: { options } })
  }
  stopPendingTasks () {
    return this.sendAction('/api/task/stopAll', { method: 'PUT' })
  }
  stopTask (name) {
    return this.sendActionAsText((`/api/task/stop/${encodeURIComponent(name)}`), { method: 'PUT' })
  }
  deleteDoneTasks () {
    return this.sendAction('/api/task/clean', { method: 'POST' })
  }
  getTasks () {
    return this.sendAction('/api/task/all')
  }
  createProject (project) {
    return this.sendActionAsText(`/api/index/${project}`, { method: 'PUT' })
  }
  deleteAll (project) {
    return this.sendActionAsText(`/api/project/${project}`, { method: 'DELETE' })
  }
  getVersion () {
    return this.sendAction('/version')
  }
  getSettings () {
    return this.sendAction('/settings')
  }
  setSettings (settings) {
    const headers = { 'Content-Type': 'application/json' }
    const responseType = 'text'
    return this.sendAction('/api/settings', { method: 'PATCH', data: { data: settings }, headers, responseType })
  }
  deleteNamedEntitiesByMentionNorm (project, mentionNorm) {
    return this.sendActionAsText(`/api/${project}/namedEntities/hide/${mentionNorm}`, { method: 'PUT' })
  }
  getSource (document) {
    return this.sendAction(document.url, {})
  }
  getStarredDocuments (project) {
    return this.sendAction(`/api/${project}/documents/starred`)
  }
  starDocuments (project, data) {
    return this.sendActionAsText(`/api/${project}/documents/batchUpdate/star`, { method: 'POST', data })
  }
  unstarDocuments (project, data) {
    return this.sendActionAsText(`/api/${project}/documents/batchUpdate/unstar`, { method: 'POST', data })
  }
  getTags (project, documentId) {
    return this.sendAction(`/api/${project}/documents/tags/${documentId}`)
  }
  tagDocument (project, documentId, routingId, data) {
    return this.sendActionAsText(`/api/${project}/documents/tag/${documentId}?routing=${routingId}`, { method: 'PUT', data })
  }
  untagDocument (project, documentId, routingId, data) {
    return this.sendActionAsText(`/api/${project}/documents/untag//${documentId}?routing=${routingId}`, { method: 'PUT', data })
  }
  tagDocuments (project, docIds, tags) {
    return this.sendActionAsText(`/api/${project}/documents/batchUpdate/tag`, { method: 'POST', data: { docIds, tags } })
  }
  untagDocuments (project, docIds, tags) {
    return this.sendActionAsText(`/api/${project}/documents/batchUpdate/untag`, { method: 'POST', data: { docIds, tags } })
  }
  batchSearch (name, csvFile, description, project, phraseMatch, fuzziness, fileTypes, paths, published) {
    const data = new FormData()
    data.append('name', name)
    data.append('csvFile', csvFile)
    data.append('description', description)
    data.append('phrase_matches', phraseMatch)
    data.append('fuzziness', fuzziness)
    map(fileTypes, fileType => data.append('fileTypes', fileType.mime))
    map(paths, path => data.append('paths', path))
    data.append('published', published)
    return this.sendActionAsText(`/api/batch/search/${project}`, { method: 'POST', data })
  }
  getBatchSearches () {
    return this.sendAction('/api/batch/search')
  }
  getBatchSearchResults (batchId, from = 0, size = 100, queries = [], sort = 'doc_nb', order = 'desc') {
    return this.sendActionAsText(`/api/batch/search/result/${batchId}`, { method: 'POST', data: { from, size, queries, sort, order } })
  }
  deleteBatchSearch (batchId) {
    return this.sendActionAsText(`/api/batch/search/${batchId}`, { method: 'DELETE' })
  }
  deleteBatchSearches () {
    return this.sendActionAsText('/api/batch/search', { method: 'DELETE' })
  }
  updateBatchSearch (batchId, published) {
    return this.sendAction(`/api/batch/search/${batchId}`, { method: 'PATCH', data: { data: { published } } })
  }
  static getFullUrl (path) {
    const base = process.env.VUE_APP_DS_HOST || `${window.location.protocol}//${window.location.host}`
    const url = new URL(path, base)
    return url.href
  }
  isDownloadAllowed (project) {
    return this.sendActionAsText(`/api/project/isDownloadAllowed/${project}`)
  }
  retrieveNotes (project) {
    return this.sendAction(replace(`/api/${project}/notes`, '//', '/'))
  }
  getUser () {
    return this.sendAction('/api/users/me')
  }
  setMarkAsRecommended (project, docIds) {
    return this.sendActionAsText(`/api/${project}/documents/batchUpdate/recommend`, { method: 'POST', data: docIds })
  }
  setUnmarkAsRecommended (project, docIds) {
    return this.sendActionAsText(`/api/${project}/documents/batchUpdate/unrecommend`, { method: 'POST', data: docIds })
  }
  getRecommendationsByDocuments (project, docId) {
    return this.sendAction(`/api/users/recommendationsby?project=${project}&docIds=${docId}`)
  }
  getRecommendationsByProject (project) {
    return this.sendAction(`/api/users/recommendations?project=${project}`)
  }
  getDocumentsRecommendedBy (project, users) {
    return this.sendAction(`/api/${project}/documents/recommendations?userids=${join(users)}`)
  }
  getNerPipelines () {
    return this.sendAction('/api/ner/pipelines')
  }
  async sendAction (url, config = {}) {
    try {
      const r = await axios.request({ url: Api.getFullUrl(url), ...config })
      return r ? r.data : null
    } catch (error) {
      EventBus.$emit('http::error', error)
      throw error
    }
  }
  async sendActionAsText (url, config = {}) {
    const headers = { 'Content-Type': 'text/plain;charset=UTF-8' }
    const responseType = 'text'
    return this.sendAction(url, { headers, responseType, ...config })
  }
}
