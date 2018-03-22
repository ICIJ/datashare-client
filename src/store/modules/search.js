import client from '@/api/client'
import Response from '@/api/Response'

const state = {
  query: '',
  response: Response.none()
}

const mutations = {
  query (state, query) {
    state.query = query
    state.response = Response.none()
  },
  buildResponse (state, raw) {
    state.response = new Response(raw)
  }
}

const actions = {
  query ({ commit }, query) {
    commit('query', query)
    return client.searchDocs(query).then(raw => { commit('buildResponse', raw) })
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations
}
