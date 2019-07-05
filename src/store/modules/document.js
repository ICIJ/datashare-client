import esClient from '@/api/esClient'
import Response from '@/api/Response'
import DatashareClient from '@/api/DatashareClient'
import map from 'lodash/map'

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
    // acquire initial state
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
    } else {
      state.doc = null
    }
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
  },
  untag (state, tags = []) {
    map(tags, tag => state.doc.tags.splice(state.doc.tags.indexOf(tag), 1))
  },
  tag (state, tags = []) {
    map(tags, tag => {
      if (state.doc.tags.indexOf(tag) === -1) {
        state.doc.tags.push(tag)
      }
    })
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
  tag ({ commit, rootState, state }, { documentId, routingId, tags }) {
    return datashare.tagDocument(rootState.search.index, documentId, routingId, tags).then(() => commit('tag', tags))
  },
  untag ({ commit, rootState, state }, { documentId, routingId, tags }) {
    return datashare.untagDocument(rootState.search.index, documentId, routingId, tags).then(() => commit('untag', tags))
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
