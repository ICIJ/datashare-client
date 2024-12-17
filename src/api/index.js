import { get, isNull, join, map, omitBy, replace, toLower, trim } from 'lodash'

import settings from '@/utils/settings'

const Method = Object.freeze({
  POST: 'POST',
  PUT: 'PUT',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  GET: 'GET'
})

export class Api {
  constructor(_axios, _EventBus, _elasticsearch) {
    this.axios = _axios
    this.eventBus = _EventBus
    this.elasticsearch = _elasticsearch
  }
  tree(path) {
    return this.sendAction('/api/tree/' + trim(path, '/'), { method: Method.GET })
  }
  index(options = {}) {
    return this.indexPath('file', options)
  }
  indexPath(path, { ocr = false, filter = true, language = null, defaultProject = null } = {}) {
    const ocrLanguage = get(settings, ['iso6392', 'tesseract', language], language)
    const options = omitBy({ ocr, filter, language, ocrLanguage, defaultProject }, isNull)
    const data = { options }
    const trimedPath = trim(path, '/')
    return this.sendActionAsText(`/api/task/batchUpdate/index/${trimedPath}`, { method: Method.POST, data })
  }
  runBatchDownload(options) {
    return this.sendAction('/api/task/batchDownload', { method: Method.POST, data: { options } })
  }
  findNames(pipeline, { syncModels = true, defaultProject = null } = {}) {
    const options = omitBy({ syncModels, defaultProject }, isNull)
    const data = { options }
    return this.sendActionAsText(`/api/task/findNames/${pipeline}`, { method: Method.POST, data })
  }
  stopPendingTasks() {
    return this.sendAction('/api/task/stopAll', { method: Method.PUT })
  }
  stopTask(name) {
    return this.sendActionAsText(`/api/task/stop/${encodeURIComponent(name)}`, { method: Method.PUT })
  }
  deleteTask(name) {
    return this.sendAction(`/api/task/clean/${encodeURIComponent(name)}`, { method: Method.DELETE })
  }
  deleteDoneTasks() {
    return this.sendAction('/api/task/clean', { method: Method.POST })
  }
  getTasks(filter) {
    return this.sendAction('/api/task/all', { params: { filter } })
  }
  createIndex(index) {
    return this.sendActionAsText(`/api/index/${index}`, { method: Method.PUT })
  }
  createProject(data) {
    return this.sendActionAsText(`/api/project/`, { method: Method.POST, data })
  }
  updateProject(data) {
    const { name } = data
    return this.sendActionAsText(`/api/project/${name}`, { method: Method.PUT, data })
  }
  deleteProject(name) {
    return this.sendActionAsText(`/api/project/${name}`, { method: Method.DELETE })
  }
  deleteAll() {
    return this.sendActionAsText(`/api/project/`, { method: Method.DELETE })
  }
  getProject(project) {
    return this.sendAction(`/api/project/${project}`)
  }
  getVersion() {
    return this.sendAction('/version')
  }
  getSettings() {
    return this.sendAction('/settings')
  }
  setSettings(settings) {
    const headers = { 'Content-Type': 'application/json' }
    const responseType = 'text'
    return this.sendAction('/api/settings', { method: 'PATCH', data: { data: settings }, headers, responseType })
  }
  deleteNamedEntitiesByMentionNorm(project, mentionNorm) {
    return this.sendActionAsText(`/api/${project}/namedEntities/hide/${mentionNorm}`, { method: Method.PUT })
  }
  getSource(document, config = {}) {
    return this.sendAction(document.url, config)
  }
  getStarredDocuments(project) {
    return this.sendAction(`/api/${project}/documents/starred`)
  }
  starDocuments(project, data) {
    return this.sendActionAsText(`/api/${project}/documents/batchUpdate/star`, { method: Method.POST, data })
  }
  unstarDocuments(project, data) {
    return this.sendActionAsText(`/api/${project}/documents/batchUpdate/unstar`, { method: Method.POST, data })
  }
  getTags(project, documentId) {
    return this.sendAction(`/api/${project}/documents/tags/${documentId}`)
  }
  tagDocument(project, documentId, routingId, data) {
    return this.sendActionAsText(`/api/${project}/documents/tag/${documentId}?routing=${routingId}`, {
      method: Method.PUT,
      data
    })
  }
  untagDocument(project, documentId, routingId, data) {
    return this.sendActionAsText(`/api/${project}/documents/untag/${documentId}?routing=${routingId}`, {
      method: Method.PUT,
      data
    })
  }
  tagDocuments(project, docIds, tags) {
    return this.sendActionAsText(`/api/${project}/documents/batchUpdate/tag`, {
      method: Method.POST,
      data: { docIds, tags }
    })
  }
  untagDocuments(project, docIds, tags) {
    return this.sendActionAsText(`/api/${project}/documents/batchUpdate/untag`, {
      method: Method.POST,
      data: { docIds, tags }
    })
  }
  getDocumentSlice(project, documentId, offset, limit, targetLanguage = null, routing = null) {
    const params = { limit, offset, routing, targetLanguage }
    return this.sendAction(`/api/${project}/documents/content/${documentId}`, { method: Method.GET, params })
  }
  searchDocument(project, documentId, query, targetLanguage, routing = null) {
    const params = { query, routing, targetLanguage }
    return this.sendAction(`/api/${project}/documents/searchContent/${documentId}`, { method: Method.GET, params })
  }
  batchSearch(name, csvFile, description, project, phraseMatch, fuzziness, fileTypes, paths, published, queryTemplate) {
    const data = new FormData()
    data.append('name', name)
    data.append('csvFile', csvFile)
    data.append('description', description)
    data.append('phrase_matches', phraseMatch)
    data.append('fuzziness', fuzziness)
    map(fileTypes, (fileType) => data.append('fileTypes', fileType.mime))
    map(paths, (path) => data.append('paths', path))
    data.append('published', published)
    data.append('query_template', queryTemplate)
    return this.sendActionAsText(`/api/task/batchSearch/${project}`, { method: Method.POST, data })
  }
  getBatchSearch(batchId) {
    return this.sendAction(`/api/batch/search/${batchId}`)
  }
  getBatchSearchQueries(batchId) {
    return this.sendAction(`/api/batch/search/${batchId}/queries`)
  }
  getBatchSearches(
    from = 0,
    size = 100,
    sort = 'batch_date',
    order = 'asc',
    query = '*',
    field = 'all',
    project = [],
    state = [],
    batchDate = null,
    publishState = null
  ) {
    const searchParams = new URLSearchParams()

    const queryData = {
      from,
      size,
      sort,
      order,
      query,
      field,
      project: project.length ? project : null,
      state: state.length ? state : null,
      batchDate,
      publishState
    }
    for (const q in queryData) {
      if (queryData[q]) {
        searchParams.append(q, queryData[q])
      }
    }
    return this.sendAction('/api/batch/search?' + searchParams, { method: Method.GET })
  }

  getBatchSearchResults(
    batchId,
    from = 0,
    size = 100,
    queries = [],
    sort = 'doc_nb',
    order = 'desc',
    contentTypes = [],
    queriesExcluded = false
  ) {
    const data = { from, size, queries, sort, order, contentTypes, queriesExcluded }
    return this.sendAction(`/api/batch/search/result/${batchId}`, { method: Method.POST, data })
  }
  copyBatchSearch(batchId, name, description) {
    const data = { name, description }
    return this.sendActionAsText(`/api/task/batchSearch/copy/${batchId}`, { method: Method.POST, data })
  }
  deleteBatchSearch(batchId) {
    return this.sendActionAsText(`/api/batch/search/${batchId}`, { method: Method.DELETE })
  }
  deleteBatchSearches() {
    return this.sendActionAsText('/api/batch/search', { method: Method.DELETE })
  }
  updateBatchSearch(batchId, published) {
    return this.sendAction(`/api/batch/search/${batchId}`, { method: 'PATCH', data: { data: { published } } })
  }
  static getFullUrl(path) {
    const base = import.meta.env.VITE_DS_HOST || `${window.location.protocol}//${window.location.host}`
    const url = new URL(path, base)
    return url.href
  }
  isDownloadAllowed(project) {
    return this.sendActionAsText(`/api/project/isDownloadAllowed/${project}`)
  }
  retrieveNotes(project) {
    return this.sendAction(replace(`/api/${project}/notes`, '//', '/'))
  }
  getUser() {
    return this.sendAction('/api/users/me')
  }
  getUserHistory(type, from, size, sort, desc, projects) {
    sort = sort ?? 'modification_date'
    desc = desc ?? true
    const params = { type, from, size, sort, desc, projects }
    return this.sendAction('/api/users/me/history', { method: Method.GET, params })
  }
  addUserHistoryEvent(projectIds, type, name, uri) {
    const data = { projectIds, type, name, uri }
    return this.sendActionAsText('/api/users/me/history', { method: Method.PUT, data })
  }
  renameSavedSearch(eventId, newName) {
    return this.sendAction('/api/users/me/history', {
      method: Method.PUT,
      data: { eventId, name: newName, type: 'SEARCH' }
    })
  }
  deleteUserHistory(type) {
    return this.sendAction('/api/users/me/history', { method: Method.DELETE, params: { type } })
  }
  deleteUserHistoryEvent(id) {
    return this.sendAction('/api/users/me/history/event', { method: Method.DELETE, params: { id } })
  }
  setMarkAsRecommended(project, data) {
    return this.sendActionAsText(`/api/${project}/documents/batchUpdate/recommend`, { method: Method.POST, data })
  }
  setUnmarkAsRecommended(project, data) {
    return this.sendActionAsText(`/api/${project}/documents/batchUpdate/unrecommend`, { method: Method.POST, data })
  }
  getRecommendationsByDocuments(project, docId) {
    return this.sendAction(`/api/users/recommendationsby?project=${project}&docIds=${docId}`)
  }
  getRecommendationsByProject(project) {
    return this.sendAction('/api/users/recommendations', { method: Method.GET, params: { project } })
  }
  getDocumentUserRecommendations(from, size, project) {
    const params = { from, size, project }
    return this.sendAction('/api/document-user-recommendation/', { method: Method.GET, params })
  }
  getDocumentsRecommendedBy(project, users = []) {
    const userids = join(users)
    return this.sendAction(`/api/${project}/documents/recommendations`, { method: Method.GET, params: { userids } })
  }
  getNerPipelines() {
    return this.sendAction('/api/ner/pipelines')
  }
  getApiKey(userId) {
    return this.sendAction(`/api/key/${userId}`, { method: Method.GET })
  }
  createApiKey(userId) {
    return this.sendAction(`/api/key/${userId}`, { method: Method.PUT })
  }
  deleteApiKey(userId) {
    return this.sendActionAsText(`/api/key/${userId}`, { method: Method.DELETE })
  }
  getPlugins(query = '') {
    return this.sendAction(`/api/plugins?filter=.*${toLower(query)}.*`)
  }
  installPluginFromId(pluginId) {
    return this.sendAction(`/api/plugins/install?id=${pluginId}`, { method: Method.PUT })
  }
  installPluginFromUrl(pluginUrl) {
    return this.sendAction(`/api/plugins/install?url=${pluginUrl}`, { method: Method.PUT })
  }
  uninstallPlugin(pluginId) {
    return this.sendAction(`/api/plugins/uninstall?id=${pluginId}`, { method: Method.DELETE })
  }
  getExtensions(query = '') {
    return this.sendAction(`/api/extensions?filter=.*${toLower(query)}.*`)
  }
  installExtensionFromId(extensionId) {
    return this.sendAction(`/api/extensions/install?id=${extensionId}`, { method: Method.PUT })
  }
  installExtensionFromUrl(extensionUrl) {
    return this.sendAction(`/api/extensions/install?url=${extensionUrl}`, { method: Method.PUT })
  }
  uninstallExtension(extensionId) {
    return this.sendAction(`/api/extensions/uninstall?id=${extensionId}`, { method: Method.DELETE })
  }
  ocrLanguages() {
    return this.sendAction('/api/settings/ocr/languages')
  }
  textLanguages() {
    return this.sendAction('/api/settings/text/languages')
  }

  getMappingsByFields(projectIds, fields) {
    return this.sendActionAsText(`/api/index/search/${projectIds}/_mapping/field/${fields}`, { method: Method.GET })
  }

  async sendAction(url, config = {}) {
    try {
      const r = await this.axios?.request({ url: Api.getFullUrl(url), ...config })
      return r ? r.data : null
    } catch (error) {
      this.eventBus?.emit('http::error', error)
      throw error
    }
  }
  async sendActionAsText(url, config = {}) {
    const headers = { 'Content-Type': 'text/plain;charset=UTF-8' }
    const responseType = 'text'
    return this.sendAction(url, { headers, responseType, ...config })
  }
}
