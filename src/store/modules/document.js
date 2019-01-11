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
    } else {
      state.parentDoc = null
    }
  }
}

export const actions = {
  get ({commit, rootState}, idAndRouting) {
    commit('idAndRouting', idAndRouting)
    return esClient.getEsDoc(rootState.search.index, idAndRouting.id, idAndRouting.routing).then(
      raw => commit('doc', raw),
      _ => commit('doc', null)
    )
  },
  getNamedEntities ({ commit, state, rootState }) {
    return esClient.getNamedEntities(rootState.search.index, state.idAndRouting.id, state.idAndRouting.routing).then(
      raw => commit('namedEntities', raw),
      _ => commit('namedEntities', {hits: {hits: []}})
    )
  },
  getParent ({ commit, state, rootState }) {
    if (state.doc !== null && state.doc.raw._source.extractionLevel > 0) {
      let currentDoc = state.doc.raw._source
      return esClient.getEsDoc(rootState.search.index, currentDoc.parentDocument, currentDoc.rootDocument).then(
        raw => commit('parentDoc', raw),
        _ => commit('parentDoc', null)
      )
    } else {
      return null
    }
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations
}
