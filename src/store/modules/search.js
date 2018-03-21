import client from '@/api/client'
import Response from '@/api/Response'
// Vendors
import bodybuilder from 'bodybuilder'

const state = {
  query: '',
  response: Response.none()
}

const getters = {

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
    // Update current  query before processing the search
    commit('query', query)
    // Return a promise
    return client.search({
      index: process.env.CONFIG.es_index,
      type: 'doc',
      size: 200,
      body: bodybuilder()
        .orQuery('match', 'content', query)
        .orQuery('has_child', 'type', 'NamedEntity', {
          'inner_hits': {
            'size': 30
          }
        }, sub => {
          return sub.query('match', 'mention', query)
        })
        .rawOption('_source', {includes: ['*'], excludes: ['content']})
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
