import esClient from '@/api/esClient'
import Response from '@/api/Response'

export function initialState () {
  return {
    idAndRouting: null,
    doc: null,
    namedEntities: [],
    parentDoc: null
  }
}

export const state = initialState

export const mutations = {
  reset (state) {
    // acquire initial state
    const s = initialState()
    Object.keys(s).forEach(key => { state[key] = s[key] })
  },
  idAndRouting (state, idAndRouting) {
    state.idAndRouting = idAndRouting
    state.doc = null
    state.parentDoc = null
  },
  doc (state, raw) {
    if (raw !== null) {
      state.doc = Response.instantiate(raw)
    } else {
      state.doc = null
    }
  },
  namedEntities (state, raw) {
    state.namedEntities = new Response(raw).hits
  },
  parentDoc (state, raw) {
    if (raw !== null) {
      state.parentDoc = Response.instantiate(raw)
      state.doc.setParent(raw)
    } else {
      state.parentDoc = null
    }
    return state.parentDoc
  }
}

export const actions = {
  async get ({ commit, rootState, state, dispatch }, idAndRouting) {
    commit('idAndRouting', idAndRouting)
    try {
      const doc = await esClient.getEsDoc(rootState.search.index, idAndRouting.id, idAndRouting.routing)
      commit('doc', doc)
    } catch {
      commit('doc', null)
    }
    return state.doc
  },
  async getNamedEntities ({ commit, rootState, state }) {
    try {
      const raw = await esClient.getNamedEntities(rootState.search.index, state.idAndRouting.id, state.idAndRouting.routing)
      commit('namedEntities', raw)
    } catch {
      commit('namedEntities', { hits: { hits: [] } })
    }
    return state.namedEntities
  },
  async getParent ({ commit, rootState, state }) {
    if (state.doc !== null && state.doc.raw._source.extractionLevel > 0) {
      const currentDoc = state.doc.raw._source
      try {
        const doc = await esClient.getEsDoc(rootState.search.index, currentDoc.parentDocument, currentDoc.rootDocument)
        commit('parentDoc', doc)
      } catch {
        commit('parentDoc', null)
      }
    }
    return state.parentDoc
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations
}
