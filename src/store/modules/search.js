import {
  castArray,
  concat,
  compact,
  cloneDeep,
  each,
  endsWith,
  flatten,
  filter as filterCollection,
  find,
  findIndex,
  get,
  has,
  includes,
  isString,
  join,
  keys,
  map,
  omit,
  orderBy,
  range,
  random,
  reduce,
  toString,
  uniq
} from 'lodash'
import lucene from 'lucene'

import EsDocList from '@/api/resources/EsDocList'
import filters from '@/store/filters'
import * as filterTypes from '@/store/filters'
import { isNarrowScreen } from '@/utils/screen'
import settings from '@/utils/settings'

export const TAB_NAME = {
  EXTRACTED_TEXT: 'extracted-text',
  PREVIEW: 'preview',
  DETAILS: 'details',
  NAMED_ENTITIES: 'named-entities'
}

export const RESET_KEYS = [
  'error',
  'field',
  'from',
  'index',
  'indices',
  'isReady',
  'layout',
  'query',
  'response',
  'showFilters',
  'excludeFilters',
  'sortFilters',
  'contextualizeFilters',
  'tab',
  'values'
]

export function initialState() {
  return cloneDeep({
    error: null,
    field: settings.defaultSearchField,
    filters,
    from: 0,
    index: '',
    indices: [],
    isReady: true,
    // Different default layout for narrow screen
    layout: isNarrowScreen() ? 'table' : 'list',
    query: '',
    response: EsDocList.none(),
    excludeFilters: [],
    contextualizeFilters: [],
    sortFilters: {},
    showFilters: true,
    values: {},
    tab: TAB_NAME.EXTRACTED_TEXT
  })
}

export const state = initialState()

export const getters = {
  instantiateFilter(state, getters, rootState) {
    return ({ type = 'FilterText', options } = {}) => {
      const Type = filterTypes[type]
      const filter = new Type(options)
      // Bind current state to be able to retrieve its values
      filter.bindRootState(rootState)
      // Return the instance
      return filter
    }
  },
  instantiatedFilters(state, getters) {
    return orderBy(
      state.filters.map((filter) => getters.instantiateFilter(filter)),
      'order',
      'asc'
    )
  },
  getFilter(state, getters) {
    return (predicate) => find(getters.instantiatedFilters, predicate)
  },
  getFields(state) {
    return () => find(settings.searchFields, { key: state.field }).fields
  },
  hasFilterValue(state, getters) {
    return (item) =>
      !!find(getters.instantiatedFilters, ({ name, values }) => {
        return name === item.name && values.indexOf(item.value) > -1
      })
  },
  hasFilterValues(state, getters) {
    return (name) => !!find(getters.instantiatedFilters, (filter) => filter.name === name && filter.values.length > 0)
  },
  isFilterContextualized(state, getters) {
    return (name) => {
      return !!find(getters.instantiatedFilters, (filter) => {
        return filter.name === name && filter.contextualized
      })
    }
  },
  isFilterExcluded(state, getters) {
    return (name) => {
      return !!find(getters.instantiatedFilters, (filter) => {
        return filter.name === name && filter.excluded
      })
    }
  },
  filterSorted(state, getters) {
    return (name) => {
      return getters.getFilter({ name })
    }
  },
  filterSortedBy(state, getters) {
    return (name) => {
      return getters.filterSorted(name).sortBy
    }
  },
  filterSortedByOrder(state, getters) {
    return (name) => {
      return getters.filterSorted(name).orderBy
    }
  },
  activeFilters(state, getters) {
    return filterCollection(getters.instantiatedFilters, (f) => f.hasValues())
  },
  filterValuesAsRouteQuery(state, getters) {
    return () => {
      return reduce(
        keys(state.values),
        (memo, name) => {
          // We need to look for the filter's definition in order to us its `id`
          // as key for the URL params. This was we track configured filter instead
          // of arbitrary values provided by the user. This allow to retrieve special
          // behaviors depending on the filter definition.
          const filter = find(getters.instantiatedFilters, { name })
          // We don't add filterValue that match with any existing filters
          // defined in the `aggregation` store.
          if (filter && filter.values.length > 0) {
            const key = filter.excluded ? `f[-${filter.name}]` : `f[${filter.name}]`
            memo[key] = compact(filter.values)
          }
          return memo
        },
        {}
      )
    }
  },
  toRouteQuery(state, getters) {
    return () => ({
      q: state.query,
      from: `${state.from}`,
      perPage: `${getters.getPerPage()}`,
      sort: getters.getSortBy(),
      order: getters.getOrderBy(),
      indices: state.indices.join(','),
      field: state.field,
      tab: state.tab,
      ...getters.filterValuesAsRouteQuery()
    })
  },
  toRouteQueryWithStamp(state, getters) {
    return () => ({
      ...getters.toRouteQuery(),
      // A random string of 6 chars
      stamp: String.fromCharCode.apply(
        null,
        range(6).map(() => random(97, 122))
      )
    })
  },
  retrieveQueryTerms(state) {
    let terms = []
    function getTerm(query, path, start, operator, isFuzzyNumber = false) {
      const term = get(query, join([path, 'term'], '.'), '')
      const field = get(query, join([path, 'field'], '.'), '')
      const prefix = get(query, join([path, 'prefix'], '.'), '')
      const regex = get(query, join([path, 'regex'], '.'), false)
      const negation = ['-', '!'].includes(prefix) || start === 'NOT' || endsWith(operator, 'NOT')
      if (term !== '*' && term !== '' && !includes(map(terms, 'label'), term) && !isFuzzyNumber) {
        terms = concat(terms, {
          field: field === '<implicit>' ? '' : field,
          label: term.replace('\\', ''),
          negation,
          regex
        })
      }
      if (term === '' && has(query, join([path, 'left'], '.'))) {
        retTerms(get(query, 'left'))
      }
    }
    function retTerms(query, operator = null, isLeftFuzzyNumber = false) {
      getTerm(query, 'left', get(query, 'start', null), operator, isLeftFuzzyNumber)
      const isRightFuzzyNumber = get(query, 'left.similarity', null) !== null
      if (get(query, 'right.left', null) === null) {
        getTerm(query, 'right', null, get(query, 'operator', null), isRightFuzzyNumber)
      } else {
        retTerms(get(query, 'right'), get(query, 'operator', null), isRightFuzzyNumber)
      }
    }
    try {
      retTerms(lucene.parse(state.query.replace('\\@', '@')))
      return terms
    } catch (_) {
      return []
    }
  },
  retrieveContentQueryTerms(state, getters) {
    const fields = ['', 'content']
    return filterCollection(getters.retrieveQueryTerms, (item) => fields.includes(item.field))
  },
  sortBy(state) {
    return find(settings.searchSortFields, { name: state.sort })
  },
  getPerPage(state, getters, rootState, rootGetters) {
    return () => rootGetters['app/getSettings']('search', 'perPage')
  },
  getSort(state, getters, rootState, rootGetters) {
    return () => {
      const [sort, order] = rootGetters['app/getSettings']('search', 'orderBy') ?? ['_score', 'desc']
      // Find optional extra params
      const { extraParams = {} } = find(settings.searchSortFields, { name: sort }) ?? {}
      // We add a secondary path filter is the current sort is not the path itself
      const secondarySort = sort === 'path' ? [] : [{ path: { order: 'asc' } }]
      return [{ [sort]: { order, ...extraParams } }, ...secondarySort]
    }
  },
  getSortBy(state, getters, rootState, rootGetters) {
    return () => {
      const [sort] = rootGetters['app/getSettings']('search', 'orderBy') ?? ['_score']
      return sort
    }
  },
  getOrderBy(state, getters, rootState, rootGetters) {
    return () => {
      const [, order] = rootGetters['app/getSettings']('search', 'orderBy') ?? [null, 'desc']
      return order
    }
  }
}

export const mutations = {
  reset(state, excludedKeys = ['index', 'indices', 'showFilters', 'layout']) {
    const s = initialState()
    RESET_KEYS.forEach((key) => {
      if (excludedKeys.indexOf(key) === -1) {
        state[key] = s[key]
      }
    })
  },
  resetFilters(state) {
    const { filters } = initialState()
    state.filters = filters
  },
  resetFiltersAndValues(state) {
    const { filters } = initialState()
    state.filters = filters
    state.values = {}
    state.from = 0
  },
  resetFilterValues(state) {
    state.values = {}
    state.from = 0
  },
  resetQuery(state) {
    state.query = ''
    state.field = settings.defaultSearchField
    state.from = 0
  },
  query(state, query) {
    state.query = query
  },
  q(state, query) {
    state.query = query
  },
  from(state, from) {
    state.from = Number(from)
  },
  isReady(state, isReady = !state.isReady) {
    state.isReady = isReady
  },
  error(state, error = null) {
    state.error = error
  },
  index(state, index) {
    state.index = index
    state.indices = [index]
  },
  indices(state, indices) {
    // Clean indices list to ensure we received an array. This means
    // this mutation can also receive a string with a comma separated
    // list of indices.
    const cleaned = flatten(castArray(indices).map((str) => str.split(',')))
    state.indices = cleaned
    state.index = cleaned[0]
  },
  layout(state, layout) {
    state.layout = layout
  },
  field(state, field) {
    const fields = settings.searchFields.map((field) => field.key)
    state.field = fields.indexOf(field) > -1 ? field : settings.defaultSearchField
  },
  buildResponse(state, raw) {
    state.response = new EsDocList(raw)
  },
  addFilterValue(state, filter) {
    // We cast the new filter values to allow several new values at the same time
    const values = castArray(filter.value)
    // Look for existing values for this name
    const existingValues = get(state, ['values', filter.name], [])
    const existingValuesAsString = map(existingValues, (value) => toString(value))
    state.values[filter.name] = uniq(existingValuesAsString.concat(values))
  },
  setFilterValue(state, filter) {
    const values = castArray(filter.value)
    state.values[filter.name] = values
  },
  addFilterValues(state, { filter, values }) {
    const existingValues = get(state, ['values', filter.name], [])
    state.values[filter.name] = uniq(existingValues.concat(castArray(values)))
  },
  removeFilterValue(state, filter) {
    // Look for existing values for this name
    const existingValues = get(state, ['values', filter.name], [])
    // Filter the values for this name to remove the given value
    state.values[filter.name] = filterCollection(existingValues, (value) => value !== filter.value)
  },
  removeFilter(state, name) {
    const i = findIndex(state.filters, ({ options }) => options.name === name)
    delete state.filters[i]
    if (name in state.values) {
      delete state.values[name]
    }
  },
  addFilter(state, { type = 'FilterText', options = {}, position = null } = {}) {
    if (!find(state.filters, (filter) => filter.options.name === options.name)) {
      if (position === null) {
        state.filters.push({ type, options })
      } else {
        state.filters.splice(position, 0, { type, options })
      }
    }
  },
  sortFilter(state, { name, sortBy = '_count', orderBy = 'desc' } = {}) {
    state.sortFilters[name] = { sortBy, orderBy }
  },
  unsortFilter(state, name) {
    delete state.sortFilters[name]
  },
  contextualizeFilter(state, name) {
    if (state.contextualizeFilters.indexOf(name) === -1) {
      state.contextualizeFilters.push(name)
    }
  },
  decontextualizeFilter(state, name) {
    delete state.contextualizeFilters[state.contextualizeFilters.indexOf(name)]
  },
  excludeFilter(state, name) {
    if (state.excludeFilters.indexOf(name) === -1) {
      state.excludeFilters.push(name)
    }
  },
  includeFilter(state, name) {
    const index = state.excludeFilters.indexOf(name)
    delete state.excludeFilters[index]
  },
  toggleFilter(state, name) {
    const index = state.excludeFilters.indexOf(name)
    if (index === -1) {
      state.excludeFilters.push(name)
    } else {
      delete state.excludeFilters[index]
    }
  },
  updateTab(state, tab) {
    state.tab = tab
  }
}

function actionsBuilder(api) {
  return {
    async refresh({ state, commit, getters }, updateIsReady = true) {
      commit('isReady', !updateIsReady)
      commit('error', null)
      try {
        const indices = state.indices.join(',')
        const raw = await api.elasticsearch.searchDocs(
          indices,
          state.query,
          getters.instantiatedFilters,
          state.from,
          getters.getPerPage(),
          getters.getSort(),
          getters.getFields()
        )
        commit('buildResponse', raw)
        commit('isReady', true)
        return raw
      } catch (error) {
        commit('isReady', true)
        commit('error', error)
        throw error
      }
    },
    updateFromRouteQuery({ commit, getters }, query) {
      const excludedKeys = ['index', 'indices', 'showFilters', 'field', 'layout', 'tab']
      const updatedKeys = ['q', 'index', 'indices', 'from', 'field']
      commit('reset', excludedKeys)
      // Add the query to the state with a mutation to avoid triggering a search
      updatedKeys.forEach((key) => (key in query ? commit(key, query[key]) : null))
      // Iterate over the list of filter
      each(getters.instantiatedFilters, (filter) => {
        // The filter key are formatted in the URL as follow.
        // See `query-string` for more info about query string format.
        each([`f[${filter.name}]`, `f[-${filter.name}]`], (key, isReverse) => {
          // Add the data if the value exist
          if (key in query) {
            // Because the values are grouped for each query parameter and because
            // the `addFilterValue` also accept an array of value, we can directly
            // use the query values.
            commit('addFilterValue', filter.itemParam({ key: query[key] }))
            // Invert the filter if we are using the second key (for reverse filter)
            if (isReverse) {
              commit('excludeFilter', filter.name)
            }
          }
        })
      })
    },
    query(
      { state, commit, dispatch },
      q = {
        index: state.index,
        indices: state.indices,
        query: state.query,
        from: state.from,
        field: state.field
      }
    ) {
      // Only the "query" parameter must be treaten differently
      if (has(q, 'query')) {
        commit('query', q.query)
      } else if (isString(q)) {
        commit('query', q)
      }

      // Then mutates all values if they are in queryOrParams. The mutation
      // for "indices" must be after "index" since the two mutations are
      // updating concurent values.
      ;['index', 'indices', 'from', 'field'].forEach((key) => {
        if (has(q, key)) {
          commit(key, q[key])
        }
      })
      return dispatch('refresh', true)
    },
    queryFilter({ state, getters }, params) {
      return api.elasticsearch
        .searchFilter(
          state.indices.join(','),
          getters.getFilter({ name: params.name }),
          state.query,
          getters.instantiatedFilters,
          getters.isFilterContextualized(params.name),
          params.options,
          getters.getFields(),
          params.from,
          params.size
        )
        .then((raw) => new EsDocList(raw))
    },
    setFilterValue({ commit, dispatch }, filter) {
      commit('setFilterValue', filter)
      return dispatch('query')
    },
    addFilterValue({ commit, dispatch }, filter) {
      commit('addFilterValue', filter)
      return dispatch('query')
    },
    removeFilterValue({ commit, dispatch }, filter) {
      commit('removeFilterValue', filter)
      return dispatch('query')
    },
    resetFilterValues({ commit, dispatch }, name) {
      commit('resetFilterValues', name)
      return dispatch('query')
    },
    toggleFilter({ commit, dispatch }, name) {
      commit('toggleFilter', name)
      return dispatch('query')
    },
    previousPage({ state, commit, dispatch, getters }) {
      commit('from', state.from - getters.getPerPage())
      return dispatch('query')
    },
    nextPage({ state, commit, dispatch, getters }) {
      commit('from', state.from + getters.getPerPage())
      return dispatch('query')
    },
    deleteQueryTerm({ state, commit, dispatch }, term) {
      function deleteQueryTermFromSimpleQuery(query) {
        if (get(query, 'left.term', '') === term) query = omit(query, 'left')
        if (get(query, 'right.term', '') === term) query = omit(query, 'right')
        if (has(query, 'left.left')) query.left = deleteQueryTermFromSimpleQuery(get(query, 'left', null))
        if (has(query, 'right.left')) query.right = deleteQueryTermFromSimpleQuery(get(query, 'right', null))
        if (has(query, 'right.right') && !has(query, 'right.left') && get(query, 'operator', '').includes('NOT'))
          query.operator = '<implicit>'
        if (has(query, 'start') && !has(query, 'left')) query = omit(query, 'start')
        if (has(query, 'operator') && (!has(query, 'left') || !has(query, 'right'))) query = omit(query, 'operator')
        if (has(query, 'parenthesized') && (!has(query, 'left') || !has(query, 'right')))
          query = omit(query, 'parenthesized')
        return query
      }

      const query = deleteQueryTermFromSimpleQuery(lucene.parse(state.query))
      commit('query', lucene.toString(query))
      return dispatch('query')
    },
    async runBatchDownload({ state, getters }, uri = null) {
      // CD TODO: untested function
      const q = ['', null, undefined].indexOf(state.query) === -1 ? state.query : '*'
      const { indices: projectIds } = state
      const { query } = api.elasticsearch.rootSearch(getters.instantiatedFilters, q).build()
      return api.runBatchDownload({
        projectIds,
        query,
        uri
      })
    },
    setTab({ state, commit }, tab) {
      if (state.tab !== tab) {
        commit('updateTab', tab)
      }
    }
  }
}

export function searchStoreBuilder(api) {
  return {
    namespaced: true,
    state,
    getters,
    mutations,
    actions: actionsBuilder(api)
  }
}
