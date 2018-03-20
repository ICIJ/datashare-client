import client from '@/api/client'
import Response from '@/api/Response'
// Vendors
import bodybuilder from 'bodybuilder'

const state = {
  q: '',
  response: null
}

const getters = { }

const mutations = {
  query (state, q) {
    state.q = q
    state.response = null
  },
  buildResponse (state, raw) {
    state.response = new Response(raw)
  }
}

const actions = {
  query ({ commit }, q) {
    // Update current  query before processing the search
    commit('query', q)
    // Return a promise
    return client.search({
      index: process.env.CONFIG.es_index,
      type: 'doc',
      size: 200,
      body: bodybuilder()
        .orQuery('match', 'content', q)
        .orQuery('has_child', 'type', 'NamedEntity', {
          'inner_hits': {
            'size': 30
          }
        }, sub => {
          return sub.query('match', 'mention', q)
        })
        .rawOption('highlight', {
          fields: {
            content: {
              fragment_size: 150,
              number_of_fragments: 10,
              pre_tags: ['<mark>'],
              post_tags: ['</mark>']
            }
          }
        })
        .build()
    }).then(raw => { commit('buildResponse', raw) })
  }
}


export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
