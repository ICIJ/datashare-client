import esClient from '@/api/esClient'
import Response from '@/api/Response'
import DatashareClient from '@/api/DatashareClient'
import compact from 'lodash/compact'

export const datashare = new DatashareClient()

export function initialState () {
  return {
    idAndRouting: null,
    doc: null,
    namedEntities: [],
    parentDocument: null,
    showNamedEntities: true
  }
}

export const state = initialState

export const mutations = {
  reset (state) {
    const s = initialState()
    Object.keys(s).forEach(key => { state[key] = s[key] })
  },
  idAndRouting (state, idAndRouting) {
    state.idAndRouting = idAndRouting
    state.doc = null
    state.parentDocument = null
  },
  doc (state, raw) {
    if (raw !== null) {
      state.doc = Response.instantiate(raw)
      state.doc.tags.sort()
    } else {
      state.doc = null
    }
  },
  tags (state, tags) {
    state.doc.tags = tags
  },
  namedEntities (state, raw) {
    state.namedEntities = new Response(raw).hits
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
  }
}

export const actions = {
  async get ({ commit, rootState, state, dispatch }, idAndRouting) {
    commit('idAndRouting', idAndRouting)
    try {
      const doc = await esClient.getEsDoc(rootState.search.index, idAndRouting.id, idAndRouting.routing)
      commit('doc', doc)
    } catch (_) {
      commit('doc', null)
    }
    return state.doc
  },
  async refresh ({ commit, rootState, state }) {
    try {
      const doc = await esClient.getEsDoc(rootState.search.index, state.idAndRouting.id, state.idAndRouting.routing)
      commit('doc', doc)
    } catch (_) {
      commit('doc', null)
    }
    return state.doc
  },
  async getParent ({ commit, rootState, state }) {
    if (state.doc !== null && state.doc.raw._source.extractionLevel > 0) {
      const currentDoc = state.doc.raw._source
      try {
        const doc = await esClient.getEsDoc(rootState.search.index, currentDoc.parentDocument, currentDoc.rootDocument)
        commit('parentDocument', doc)
      } catch (_) {
        commit('parentDocument', null)
      }
    }
    return state.parentDocument
  },
  async getNamedEntities ({ commit, rootState, state }) {
    try {
      const raw = await esClient.getNamedEntities(rootState.search.index, state.idAndRouting.id, state.idAndRouting.routing)
      commit('namedEntities', raw)
    } catch (_) {
      commit('namedEntities', { hits: { hits: [] } })
    }
    return state.namedEntities
  },
  async tag ({ commit, rootState, state, dispatch }, { documentId, routingId, tag }) {
    await datashare.tagDocument(rootState.search.index, documentId, routingId, compact(tag.split(' ')))
    return dispatch('refresh')
  },
  async untag ({ commit, rootState, state, dispatch }, { documentId, routingId, tag }) {
    await datashare.untagDocument(rootState.search.index, documentId, routingId, [tag])
    return dispatch('refresh')
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
