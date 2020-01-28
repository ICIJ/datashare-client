import compact from 'lodash/compact'
import concat from 'lodash/concat'
import findIndex from 'lodash/findIndex'
import flattenDeep from 'lodash/flattenDeep'
import get from 'lodash/get'
import keys from 'lodash/keys'
import map from 'lodash/map'
import sumBy from 'lodash/sumBy'
import uniqBy from 'lodash/uniqBy'
import values from 'lodash/values'

import Auth from '@/api/Auth'
import Api from '@/api'
import esClient from '@/api/esClient'
import Response from '@/api/Response'

export const datashare = new Api()
export const auth = new Auth()

export function initialState () {
  return {
    idAndRouting: null,
    doc: null,
    isLoadingNamedEntities: false,
    namedEntitiesPaginatedByCategories: {
      'PERSON': [],
      'ORGANIZATION': [],
      'LOCATION': [],
      'EMAIL': []
    },
    parentDocument: null,
    showNamedEntities: false,
    tags: []
  }
}

export const state = initialState()

export const getters = {
  countNamedEntitiesInCategory (state) {
    return category => {
      const pages = get(state, ['namedEntitiesPaginatedByCategories', category], [])
      // Sum up all page size
      return sumBy(pages, page => {
        return get(page, 'hits.length', 0)
      })
    }
  },
  namedEntities (state) {
    const categoriesPages = values(state.namedEntitiesPaginatedByCategories)
    const hits = categoriesPages.map(pages => pages.map(page => page.hits))
    return flattenDeep(hits)
  },
  categories (state) {
    return keys(state.namedEntitiesPaginatedByCategories)
  }
}

export const mutations = {
  reset (state) {
    const s = initialState()
    Object.keys(s).forEach(key => { state[key] = s[key] })
  },
  idAndRouting (state, idAndRouting) {
    mutations.reset(state)
    state.idAndRouting = idAndRouting
  },
  doc (state, raw) {
    if (raw !== null) {
      state.doc = Response.instantiate(raw)
    } else {
      state.doc = null
    }
  },
  tags (state, tags) {
    state.tags = tags
  },
  namedEntities (state, raw) {
    state.namedEntities = new Response(raw).hits
  },
  namedEntitiesPageInCategory (state, { category, page }) {
    if (state.namedEntitiesPaginatedByCategories[category]) {
      state.namedEntitiesPaginatedByCategories[category].push(page)
    }
  },
  parentDocument (state, raw) {
    if (raw !== null) {
      state.parentDocument = Response.instantiate(raw)
      state.doc.setParent(raw)
    } else {
      state.parentDocument = null
    }
    return state.parentDocument
  },
  toggleShowNamedEntities (state, toggler = null) {
    state.showNamedEntities = (toggler !== null ? toggler : !state.showNamedEntities)
  },
  toggleIsLoadingNamedEntities (state, toggler = null) {
    state.isLoadingNamedEntities = (toggler !== null ? toggler : !state.isLoadingNamedEntities)
  },
  addTag (state, { tag, userId }) {
    const tags = map(compact(tag.split(' ')), tag => {
      return { label: tag, user: { id: userId }, creationDate: Date.now() }
    })
    state.tags = uniqBy(concat(state.tags, tags), 'label')
  },
  deleteTag (state, tagToDelete) {
    state.tags.splice(findIndex(state.tags, { label: tagToDelete.label }), 1)
  }
}

export const actions = {
  async get ({ commit, state, dispatch }, idAndRouting) {
    commit('idAndRouting', idAndRouting)
    try {
      const doc = await esClient.getEsDoc(idAndRouting.index, idAndRouting.id, idAndRouting.routing)
      commit('doc', doc)
    } catch (_) {
      commit('doc', null)
    }
    return state.doc
  },
  async refresh ({ commit, state }) {
    try {
      const doc = await esClient.getEsDoc(state.doc.index, state.idAndRouting.id, state.idAndRouting.routing)
      commit('doc', doc)
    } catch (_) {
      commit('doc', null)
    }
    return state.doc
  },
  async getParent ({ commit, state }) {
    if (state.doc !== null && state.doc.raw._source.extractionLevel > 0) {
      const currentDoc = state.doc.raw._source
      try {
        const doc = await esClient.getEsDoc(state.doc.index, currentDoc.parentDocument, currentDoc.rootDocument)
        commit('parentDocument', doc)
      } catch (_) {
        commit('parentDocument', null)
      }
    }
    return state.parentDocument
  },
  async getNamedEntitiesTotal ({ state }) {
    const index = state.doc.index
    const { id, routing } = state.idAndRouting
    const raw = await esClient.getDocumentNamedEntities(index, id, routing, 0, 0)
    return (new Response(raw)).total
  },
  async getFirstPageForNamedEntityInCategory ({ state, dispatch }, category) {
    // Count the number of loaded pages
    const namedEntitiesPagesCount = get(state, ['namedEntitiesPaginatedByCategories', category, 'length'], 0)
    // Zero named entities load for this category
    if (namedEntitiesPagesCount === 0) {
      return dispatch('getNextPageForNamedEntityInCategory', category)
    }
  },
  async getFirstPageForNamedEntityInAllCategories ({ dispatch, getters }) {
    for (const category of getters['categories']) {
      await dispatch('getFirstPageForNamedEntityInCategory', category)
    }
  },
  async getNextPageForNamedEntityInCategory ({ state, getters, commit, dispatch }, category) {
    try {
      const from = getters.countNamedEntitiesInCategory(category)
      const index = state.doc.index
      const { id, routing } = state.idAndRouting
      const raw = await dispatch('loadingNamedEntities', () => {
        return esClient.getDocumentNamedEntitiesInCategory(index, id, routing, from, 50, category)
      })
      const page = new Response(raw)
      commit('namedEntitiesPageInCategory', { category, page })
      return page
    } catch (_) {
      return null
    }
  },
  async loadingNamedEntities ({ commit }, callbackWithPromise) {
    commit('toggleIsLoadingNamedEntities', true)
    const result = await callbackWithPromise()
    commit('toggleIsLoadingNamedEntities', false)
    return result
  },
  async getTags ({ state, commit }) {
    try {
      const tags = await datashare.getTags(state.doc.index, state.doc.id)
      commit('tags', tags)
    } catch (_) {
      commit('tags')
    }
    return state.tags
  },
  async tag ({ state, dispatch }, { documents, tag }) {
    await datashare.tagDocuments(state.doc.index, map(documents, 'id'), compact(tag.split(' ')))
    if (documents.length === 1) await dispatch('addTag', tag)
  },
  async addTag ({ state, commit }, tag) {
    const userId = await auth.getUsername()
    commit('addTag', { tag, userId })
  },
  async deleteTag ({ state, commit }, { documents, tag }) {
    await datashare.untagDocuments(state.doc.index, map(documents, 'id'), [tag.label])
    if (documents.length === 1) commit('deleteTag', tag)
  }
}

export default {
  namespaced: true,
  getters,
  state,
  mutations,
  actions
}
