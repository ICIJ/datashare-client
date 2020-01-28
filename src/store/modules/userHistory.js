import uniqBy from 'lodash/uniqBy'
import Document from '@/api/resources/Document'

export const state = {
  rawDocuments: []
}

export const getters = {
  getDocuments (state) {
    return () => state.rawDocuments.map(Document.create)
  }
}

export const mutations = {
  addDocument (state, document) {
    // We only save raw info about the document to avoid saving to many
    // information in browser memory
    state.rawDocuments.push(document.serializedForStorage)
    // Remove duplicates and only keep the 500 last docs
    state.rawDocuments = uniqBy(state.rawDocuments.reverse().slice(0, 500), '_id').reverse()
  },
  clear (state) {
    state.rawDocuments = []
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations
}
