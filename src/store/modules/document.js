import client from '@/api/client'
import Response from '@/api/Response'

const state = {
  idAndRouting: null,
  doc: null
}

const mutations = {
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
  }
}

const actions = {
  get ({commit}, idAndRouting) {
    commit('idAndRouting', idAndRouting)
    return client.getEsDoc(idAndRouting.id, idAndRouting.routing).then(
      raw => commit('doc', raw),
      _ => commit('doc', null)
    )
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations
}
