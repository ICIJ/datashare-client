import castArray from 'lodash/castArray'
import cloneDeep from 'lodash/cloneDeep'
import compact from 'lodash/compact'
import concat from 'lodash/concat'
import difference from 'lodash/difference'
import each from 'lodash/each'
import endsWith from 'lodash/endsWith'
import escapeRegExp from 'lodash/escapeRegExp'
import filterCollection from 'lodash/filter'
import find from 'lodash/find'
import findIndex from 'lodash/findIndex'
import get from 'lodash/get'
import has from 'lodash/has'
import includes from 'lodash/includes'
import isString from 'lodash/isString'
import join from 'lodash/join'
import keys from 'lodash/keys'
import map from 'lodash/map'
import omit from 'lodash/omit'
import orderBy from 'lodash/orderBy'
import range from 'lodash/range'
import random from 'lodash/random'
import reduce from 'lodash/reduce'
import toString from 'lodash/toString'
import uniq from 'lodash/uniq'
import values from 'lodash/values'
import lucene from 'lucene'
import Vue from 'vue'

import Api from '@/api'
import elasticsearch from '@/api/elasticsearch'
import EsDocList from '@/api/resources/EsDocList'
import settings from '@/utils/settings'
import { isNarrowScreen } from '@/utils/screen'
import * as filterTypes from '@/store/filters'
import filters from '@/store/filters'

export const api = new Api()

export function initialState () {
  return cloneDeep({
    query: '',
    from: 0,
    size: 25,
    globalSearch: true,
    filters,
    values: {},
    reversed: [],
    sort: settings.defaultSearchSort,
    field: settings.defaultSearchField,
    response: EsDocList.none(),
    isReady: true,
    error: null,
    index: '',
    showFilters: true,
    starredDocuments: [],
    // Different default layout for narrow screen
    layout: isNarrowScreen() ? 'table' : 'list',
    isDownloadAllowed: false,
    documentsRecommended: [],
    recommendedByUsers: []
  })
}

export const state = initialState()

export const getters = {
  instantiateFilter (state) {
    return ({ type = 'FilterText', options } = { }) => {
      const Type = filterTypes[type]
      const filter = new Type(options)
      // Bind current state to be able to retrieve its values
      filter.bindState(state)
      // Return the instance
      return filter
    }
  },
  instantiatedFilters (state, getters) {
    return orderBy(state.filters.map(filter => getters.instantiateFilter(filter)), 'order', 'asc')
  },
  getFilter (state, getters) {
    return predicate => find(getters.instantiatedFilters, predicate)
  },
  getFields (state) {
    return () => find(settings.searchFields, { key: state.field }).fields
  },
  hasFilterValue (state, getters) {
    return item => !!find(getters.instantiatedFilters,
      filter => filter.name === item.name && filter.values.indexOf(item.value) > -1)
  },
  hasFilterValues (state, getters) {
    return name => !!find(getters.instantiatedFilters,
      filter => filter.name === name && filter.values.length > 0)
  },
  isFilterReversed (state, getters) {
    return name => {
      return !!find(getters.instantiatedFilters, filter => {
        return filter.name === name && filter.reverse
      })
    }
  },
  activeFilters (state, getters) {
    return filterCollection(getters.instantiatedFilters, f => f.hasValues())
  },
  filterValuesAsRouteQuery (state, getters) {
    return () => {
      return reduce(keys(state.values), (memo, name) => {
        // We need to look for the filter's definition in order to us its `id`
        // as key for the URL params. This was we track configured filter instead
        // of arbitrary values provided by the user. This allow to retrieve special
        // behaviors depending on the filter definition.
        const filter = find(getters.instantiatedFilters, { name })
        // We don't add filterValue that match with any existing filters
        // defined in the `aggregation` store.
        if (filter && filter.values.length > 0) {
          const key = filter.reverse ? `f[-${filter.name}]` : `f[${filter.name}]`
          memo[key] = filter.values
        }
        return memo
      }, {})
    }
  },
  toRouteQuery (state, getters) {
    return () => ({
      q: state.query,
      from: state.from,
      size: state.size,
      sort: state.sort,
      index: state.index,
      field: state.field,
      ...getters.filterValuesAsRouteQuery()
    })
  },
  toRouteQueryWithStamp (state, getters) {
    return () => ({
      ...getters.toRouteQuery(),
      // A random string of 6 chars
      stamp: String.fromCharCode.apply(null, range(6).map(() => random(97, 122)))
    })
  },
  retrieveQueryTerms (state) {
    let terms = []
    function getTerm (query, path, start, operator) {
      const term = get(query, join([path, 'term'], '.'), '')
      const field = get(query, join([path, 'field'], '.'), '')
      const prefix = get(query, join([path, 'prefix'], '.'), '')
      const regex = get(query, join([path, 'regex'], '.'), false)
      const negation = ['-', '!'].includes(prefix) || start === 'NOT' || endsWith(operator, 'NOT')
      if (term !== '*' && term !== '' && !includes(map(terms, 'label'), term)) {
        terms = concat(terms, { field: field === '<implicit>' ? '' : field, label: term.replace('\\', ''), negation, regex })
      }
      if (term === '' && has(query, join([path, 'left'], '.'))) {
        retTerms(get(query, 'left'))
      }
    }
    function retTerms (query, operator = null) {
      getTerm(query, 'left', get(query, 'start', null), operator)
      if (get(query, 'right.left', null) === null) {
        getTerm(query, 'right', null, get(query, 'operator', null))
      } else {
        retTerms(get(query, 'right'), get(query, 'operator', null))
      }
    }
    try {
      retTerms(lucene.parse(state.query.replace('\\@', '@')))
      return terms
    } catch (_) {
      return []
    }
  },
  retrieveContentQueryTerms (state, getters) {
    const fields = ['', 'content']
    return filterCollection(getters.retrieveQueryTerms, item => fields.includes(item.field))
  },
  retrieveContentQueryTermsInContent (state, getters) {
    return (text, field) => getters.retrieveContentQueryTerms.map(term => {
      const regex = new RegExp(term.regex ? term.label : escapeRegExp(term.label), 'gi')
      term[field] = (text.match(regex) || []).length
      return term
    })
  },
  retrieveContentQueryTermsInDocument (state, getters) {
    return document => {
      map(['content', 'metadata', 'tags'], field => {
        let extractedField = get(document, ['source', field], '')
        if (isString(extractedField)) {
          extractedField = castArray(extractedField)
        }
        const text = join(compact(values(extractedField)), ' ')
        getters.retrieveContentQueryTermsInContent(text, field)
      })
      return orderBy(getters.retrieveContentQueryTerms, ['content'], ['desc']).sort(a => a.content === 0 && a.metadata > 0)
    }
  },
  sortBy (state) {
    return find(settings.searchSortFields, { name: state.sort })
  }
}

export const mutations = {
  reset (state, excludedKeys = ['index', 'showFilters', 'layout', 'size', 'sort']) {
    const s = initialState()
    Object.keys(s).forEach(key => {
      if (excludedKeys.indexOf(key) === -1) {
        Vue.set(state, key, s[key])
      }
    })
  },
  resetFilters (state, name) {
    const { filters } = initialState()
    Vue.set(state, 'filters', filters)
  },
  resetFiltersAndValues (state, name) {
    const { filters } = initialState()
    Vue.set(state, 'filters', filters)
    Vue.set(state, 'values', {})
    Vue.set(state, 'from', 0)
  },
  resetFilterValues (state) {
    Vue.set(state, 'values', {})
    Vue.set(state, 'from', 0)
  },
  resetQuery (state, name) {
    Vue.set(state, 'query', '')
    Vue.set(state, 'field', settings.defaultSearchField)
    Vue.set(state, 'from', 0)
  },
  setGlobalSearch (state, globalSearch) {
    Vue.set(state, 'globalSearch', globalSearch)
  },
  query (state, query) {
    Vue.set(state, 'query', query)
  },
  from (state, from) {
    Vue.set(state, 'from', Number(from))
  },
  size (state, size) {
    Vue.set(state, 'size', Number(size))
  },
  sort (state, sort) {
    Vue.set(state, 'sort', sort)
  },
  isReady (state, isReady = !state.isReady) {
    Vue.set(state, 'isReady', isReady)
  },
  error (state, error = null) {
    Vue.set(state, 'error', error)
  },
  index (state, index) {
    Vue.set(state, 'index', index)
  },
  layout (state, layout) {
    Vue.set(state, 'layout', layout)
  },
  field (state, field) {
    const fields = settings.searchFields.map(field => field.key)
    Vue.set(state, 'field', fields.indexOf(field) > -1 ? field : settings.defaultSearchField)
  },
  isDownloadAllowed (state, isDownloadAllowed) {
    Vue.set(state, 'isDownloadAllowed', isDownloadAllowed)
  },
  starredDocuments (state, starredDocuments) {
    Vue.set(state, 'starredDocuments', starredDocuments)
  },
  buildResponse (state, raw) {
    Vue.set(state, 'isReady', true)
    Vue.set(state, 'response', new EsDocList(raw))
  },
  addFilterValue (state, filter) {
    // We cast the new filter values to allow several new values at the same time
    const values = castArray(filter.value)
    // Look for existing values for this name
    const existingValues = get(state, ['values', filter.name], [])
    const existingValuesAsString = map(existingValues, value => toString(value))
    Vue.set(state.values, filter.name, uniq(existingValuesAsString.concat(values)))
  },
  setFilterValue (state, filter) {
    Vue.set(state.values, filter.name, castArray(filter.value))
  },
  addFilterValues (state, { filter, values }) {
    const existingValues = get(state, ['values', filter.name], [])
    Vue.set(state.values, filter.name, uniq(existingValues.concat(castArray(values))))
  },
  removeFilterValue (state, filter) {
    // Look for existing values for this name
    const existingValues = get(state, ['values', filter.name], [])
    // Filter the values for this name to remove the given value
    Vue.set(state.values, filter.name, filterCollection(existingValues, value => value !== filter.value))
  },
  removeFilter (state, name) {
    const index = findIndex(state.filters, ({ options }) => options.name === name)
    Vue.delete(state.filters, index)
    if (name in state.values) {
      Vue.delete(state.values, name)
    }
  },
  addFilter (state, { type = 'FilterText', options = {}, position = null } = {}) {
    if (!find(state.filters, filter => filter.options.name === options.name)) {
      if (position === null) {
        state.filters.push({ type, options })
      } else {
        state.filters.splice(position, 0, { type, options })
      }
    }
  },
  excludeFilter (state, name) {
    if (state.reversed.indexOf(name) === -1) {
      state.reversed.push(name)
    }
  },
  includeFilter (state, name) {
    Vue.delete(state.reversed, state.reversed.indexOf(name))
  },
  toggleFilter (state, name) {
    if (state.reversed.indexOf(name) > -1) {
      Vue.delete(state.reversed, state.reversed.indexOf(name))
    } else {
      state.reversed.push(name)
    }
  },
  toggleFilters (state, toggler = !state.showFilters) {
    Vue.set(state, 'showFilters', toggler)
  },
  pushFromStarredDocuments (state, documentIds) {
    Vue.set(state, 'starredDocuments', uniq(concat(state.starredDocuments, documentIds)))
  },
  removeFromStarredDocuments (state, documentIds) {
    Vue.set(state, 'starredDocuments', difference(state.starredDocuments, documentIds))
  },
  documentsRecommended (state, documentsRecommended) {
    Vue.set(state, 'documentsRecommended', documentsRecommended)
  },
  recommendedByUsers (state, recommendedByUsers) {
    Vue.set(state, 'recommendedByUsers', recommendedByUsers)
  }
}

export const actions = {
  async refresh ({ state, commit, getters }, updateIsReady = true) {
    commit('isReady', !updateIsReady)
    commit('error', null)
    try {
      const raw = await elasticsearch.searchDocs(state.index, state.query, getters.instantiatedFilters, state.from, state.size, state.sort, getters.getFields())
      commit('buildResponse', raw)
      return raw
    } catch (error) {
      commit('isReady', true)
      commit('error', error)
      throw error
    }
  },
  query ({ state, commit, getters, dispatch }, queryOrParams = { index: state.index, query: state.query, from: state.from, size: state.size, sort: state.sort, field: state.field }) {
    const queryHasntValue = key => typeof queryOrParams === 'string' || queryOrParams instanceof String || typeof queryOrParams[key] === 'undefined'
    commit('index', queryHasntValue('index') ? state.index : queryOrParams.index)
    commit('query', queryHasntValue('query') ? queryOrParams : queryOrParams.query)
    commit('from', queryHasntValue('from') ? state.from : queryOrParams.from)
    commit('size', queryHasntValue('size') ? state.size : queryOrParams.size)
    commit('sort', queryHasntValue('sort') ? state.sort : queryOrParams.sort)
    commit('field', queryHasntValue('field') ? state.field : queryOrParams.field)
    return dispatch('refresh', true)
  },
  queryFilter ({ state, getters }, params) {
    return elasticsearch.searchFilter(
      state.index,
      getters.getFilter({ name: params.name }),
      state.query,
      getters.instantiatedFilters,
      state.globalSearch,
      params.options,
      getters.getFields()
    ).then(raw => new EsDocList(raw))
  },
  setFilterValue ({ commit, dispatch }, filter) {
    commit('setFilterValue', filter)
    return dispatch('query')
  },
  addFilterValue ({ commit, dispatch }, filter) {
    commit('addFilterValue', filter)
    return dispatch('query')
  },
  removeFilterValue ({ commit, dispatch }, filter) {
    commit('removeFilterValue', filter)
    return dispatch('query')
  },
  resetFilterValues ({ commit, dispatch }, name) {
    commit('resetFilterValues', name)
    return dispatch('query')
  },
  toggleFilter ({ commit, dispatch }, name) {
    commit('toggleFilter', name)
    return dispatch('query')
  },
  previousPage ({ state, commit, dispatch }, name) {
    commit('from', state.from - state.size)
    return dispatch('query')
  },
  nextPage ({ state, commit, dispatch }, name) {
    commit('from', state.from + state.size)
    return dispatch('query')
  },
  async updateFromRouteQuery ({ state, commit, getters }, query) {
    // Add the query to the state with a mutation to not triggering a search
    if (has(query, 'q')) commit('query', query.q)
    if (has(query, 'index')) commit('index', query.index)
    if (has(query, 'from')) commit('from', query.from)
    if (has(query, 'size')) commit('size', query.size)
    if (has(query, 'sort')) commit('sort', query.sort)
    if (has(query, 'field')) commit('field', query.field)
    // Iterate over the list of filter
    each(getters.instantiatedFilters, filter => {
      // The filter key are formatted in the URL as follow.
      // See `query-string` for more info about query string format.
      each([`f[${filter.name}]`, `f[-${filter.name}]`], (key, index) => {
        // Add the data if the value exist
        if (key in query) {
          // Because the values are grouped for each query parameter and because
          // the `addFilterValue` also accept an array of value, we can directly
          // use the query values.
          commit('addFilterValue', filter.itemParam({ key: query[key] }))
          // Invert the filter if we are using the second key (for reverse filter)
          if (index) commit('excludeFilter', filter.name)
        }
      })
    })
  },
  deleteQueryTerm ({ state, commit, dispatch }, term) {
    function deleteQueryTermFromSimpleQuery (query) {
      if (get(query, 'left.term', '') === term) query = omit(query, 'left')
      if (get(query, 'right.term', '') === term) query = omit(query, 'right')
      if (has(query, 'left.left')) query.left = deleteQueryTermFromSimpleQuery(get(query, 'left', null))
      if (has(query, 'right.left')) query.right = deleteQueryTermFromSimpleQuery(get(query, 'right', null))
      if (has(query, 'right.right') && !has(query, 'right.left') && get(query, 'operator', '').includes('NOT')) query.operator = '<implicit>'
      if (has(query, 'start') && !has(query, 'left')) query = omit(query, 'start')
      if (has(query, 'operator') && (!has(query, 'left') || !has(query, 'right'))) query = omit(query, 'operator')
      if (has(query, 'parenthesized') && (!has(query, 'left') || !has(query, 'right'))) query = omit(query, 'parenthesized')
      return query
    }
    const query = deleteQueryTermFromSimpleQuery(lucene.parse(state.query))
    commit('query', lucene.toString(query))
    return dispatch('query')
  },
  async starDocuments ({ state, commit }, documents) {
    const documentIds = map(documents, 'id')
    await api.starDocuments(state.index, documentIds)
    commit('pushFromStarredDocuments', documentIds)
  },
  async unstarDocuments ({ state, commit }, documents) {
    const documentIds = map(documents, 'id')
    await api.unstarDocuments(state.index, documentIds)
    commit('removeFromStarredDocuments', documentIds)
  },
  toggleStarDocument ({ state, commit, dispatch }, documentId) {
    const documents = [{ id: documentId }]
    if (state.starredDocuments.indexOf(documentId) >= 0) {
      return dispatch('unstarDocuments', documents)
    } else {
      return dispatch('starDocuments', documents)
    }
  },
  async getStarredDocuments ({ state, commit }) {
    const starredDocuments = await api.getStarredDocuments(state.index)
    commit('starredDocuments', starredDocuments)
  },
  async getIsDownloadAllowed ({ state, commit }) {
    try {
      await api.isDownloadAllowed(state.index)
      commit('isDownloadAllowed', true)
    } catch (_) {
      commit('isDownloadAllowed', false)
    }
  },
  async getRecommendationsByProject ({ state, commit }) {
    let recommendedByUsers
    try {
      recommendedByUsers = await api.getRecommendationsByProject(state.index)
      recommendedByUsers = map(recommendedByUsers, 'id')
    } catch (_) {
      recommendedByUsers = []
    }
    commit('recommendedByUsers', recommendedByUsers)
  },
  async getDocumentsRecommendedBy ({ state, commit }, users) {
    let documentsRecommended
    try {
      if (users.length === 0) {
        documentsRecommended = []
      } else {
        documentsRecommended = await api.getDocumentsRecommendedBy(state.index, users)
      }
    } catch (_) {
      documentsRecommended = []
    }
    commit('documentsRecommended', documentsRecommended)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
