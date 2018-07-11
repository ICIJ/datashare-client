import esClient from '@/api/esClient'
import Response from '@/api/Response'

function initialState () {
  return {
    idAndRouting: null,
    doc: null,
    namedEntities: []
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
  }
}

export const actions = {
  get ({commit}, idAndRouting) {
    commit('idAndRouting', idAndRouting)
    return esClient.getEsDoc(idAndRouting.id, idAndRouting.routing).then(
      raw => commit('doc', raw),
      _ => commit('doc', null)
    )
  },
  getNamedEntities ({commit, state}) {
    return esClient.getNamedEntities(state.idAndRouting.id, state.idAndRouting.routing).then(
      raw => commit('namedEntities', raw),
      _ => commit('namedEntities', {hits: {hits: []}})
    )
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations
}
