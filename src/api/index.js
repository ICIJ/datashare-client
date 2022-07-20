import { join, map, replace, toLower } from 'lodash'
import axios from 'axios'

import { EventBus } from '@/utils/event-bus'

export default class Api {
  index (options) {
    return this.sendActionAsText('/api/task/batchUpdate/index/file', { method: 'POST', data: { options } })
  }
  runBatchSearch () {
    return this.sendAction('/api/task/batchSearch', { method: 'POST' })
  }
  runBatchDownload (options) {
    return this.sendAction('/api/task/batchDownload', { method: 'POST', data: { options } })
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
  getTasks (filter) {
    return this.sendAction('/api/task/all', { params: { filter } })
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
  getSource (document, config = {}) {
    return this.sendAction(document.url, config)
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
    return this.sendActionAsText(`/api/${project}/documents/untag/${documentId}?routing=${routingId}`, { method: 'PUT', data })
  }
  tagDocuments (project, docIds, tags) {
    return this.sendActionAsText(`/api/${project}/documents/batchUpdate/tag`, { method: 'POST', data: { docIds, tags } })
  }
  untagDocuments (project, docIds, tags) {
    return this.sendActionAsText(`/api/${project}/documents/batchUpdate/untag`, { method: 'POST', data: { docIds, tags } })
  }
  getDocumentSlice (project, documentId, offset, limit, targetLanguage = null, routing = null) {
    const params = { limit, offset, routing, targetLanguage }
    return this.sendAction(`/api/${project}/documents/content/${documentId}`, { method: 'GET', params })
  }
  searchDocument (project, documentId, query, targetLanguage, routing = null) {
    const params = { query, routing, targetLanguage }
    return this.sendAction(`/api/${project}/documents/searchContent/${documentId}`, { method: 'GET', params })
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
  getBatchSearch (batchId) {
    return this.sendActionAsText(`/api/batch/search/${batchId}`)
  }
  getBatchSearches (from = 0, size = 100, sort = 'batch_date', order = 'asc', query = '*', field = 'all') {
    return this.sendActionAsText('/api/batch/search', { method: 'POST', data: { from, size, sort, order, query, field } })
  }
  getBatchSearchResults (batchId, from = 0, size = 100, queries = [], sort = 'doc_nb', order = 'desc') {
    return this.sendActionAsText(`/api/batch/search/result/${batchId}`, { method: 'POST', data: { from, size, queries, sort, order } })
  }
  copyBatchSearch (batchId, name, description) {
    return this.sendActionAsText(`/api/batch/search/copy/${batchId}`, { method: 'POST', data: { name, description } })
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
  getUserHistory (type, from, size) {
    return this.sendAction('/api/users/me/history', { method: 'GET', params: { type: type, from: from, size: size } })
  }
  addHistoryEvent (projectIds, type, name, uri) {
    return this.sendActionAsText('/api/users/me/history', { method: 'PUT', data: { projectIds, type, name, uri } })
  }
  deleteUserHistory (type) {
    return this.sendAction('/api/users/me/history', { method: 'DELETE', params: { type: type } })
  }
  deleteUserEvent (id) {
    return this.sendAction('/api/users/me/history/event', { method: 'DELETE', params: { id: id } })
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
    return this.sendAction('/api/users/recommendations', { method: 'GET', params: { project: project } })
  }
  getDocumentsRecommendedBy (project, users = []) {
    const userIds = join(users)
    return this.sendAction(`/api/${project}/documents/recommendations`, { method: 'GET', params: { userids: userIds } })
  }
  getNerPipelines () {
    return this.sendAction('/api/ner/pipelines')
  }
  getApiKey (userId) {
    return this.sendActionAsText(`/api/key/${userId}`, { method: 'GET' })
  }
  createApiKey (userId) {
    return this.sendActionAsText(`/api/key/${userId}`, { method: 'PUT' })
  }
  deleteApiKey (userId) {
    return this.sendActionAsText(`/api/key/${userId}`, { method: 'DELETE' })
  }
  getPlugins (query = '') {
    return this.sendAction(`/api/plugins?filter=.*${toLower(query)}.*`)
  }
  installPluginFromId (pluginId) {
    return this.sendAction(`/api/plugins/install?id=${pluginId}`, { method: 'PUT' })
  }
  installPluginFromUrl (pluginUrl) {
    return this.sendAction(`/api/plugins/install?url=${pluginUrl}`, { method: 'PUT' })
  }
  uninstallPlugin (pluginId) {
    return this.sendAction(`/api/plugins/uninstall?id=${pluginId}`, { method: 'DELETE' })
  }
  getExtensions (query = '') {
    return this.sendAction(`/api/extensions?filter=.*${toLower(query)}.*`)
  }
  installExtensionFromId (extensionId) {
    return this.sendAction(`/api/extensions/install?id=${extensionId}`, { method: 'PUT' })
  }
  installExtensionFromUrl (extensionUrl) {
    return this.sendAction(`/api/extensions/install?url=${extensionUrl}`, { method: 'PUT' })
  }
  uninstallExtension (extensionId) {
    return this.sendAction(`/api/extensions/uninstall?id=${extensionId}`, { method: 'DELETE' })
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
