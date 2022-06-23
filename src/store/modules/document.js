import { compact, concat, findIndex, flattenDeep, get, keys, map, sortBy, sumBy, uniqBy, values } from 'lodash'
import Vue from 'vue'

import Api from '@/api'
import elasticsearch from '@/api/elasticsearch'
import EsDocList from '@/api/resources/EsDocList'

export const api = new Api()

export function initialState () {
  return {
    doc: null,
    idAndRouting: null,
    isContentLoaded: false,
    isTranslatedContentLoaded: false,
    isLoadingNamedEntities: false,
    isRecommended: false,
    namedEntitiesPaginatedByCategories: {
      PERSON: [],
      ORGANIZATION: [],
      LOCATION: [],
      EMAIL: []
    },
    parentDocument: null,
    recommendedBy: [],
    rootDocument: null,
    useContentTextLazyLoading: false,
    showTranslatedContent: true,
    tags: []
  }
}

export const state = initialState()

export const getters = {
  countNamedEntitiesInCategory (state) {
    return category => {
      const pages = get(state, ['namedEntitiesPaginatedByCategories', category], [])
      // Sum up all page size
      return sumBy(pages, page => get(page, 'hits.length', 0))
    }
  },
  namedEntities (state) {
    const categoriesPages = values(state.namedEntitiesPaginatedByCategories)
    const hits = categoriesPages.map(pages => pages.map(page => page.hits))
    return flattenDeep(hits)
  },
  categories (state) {
    return keys(state.namedEntitiesPaginatedByCategories)
  }
}

export const mutations = {
  reset (state) {
    const s = initialState()
    const persistedFields = ['showTranslatedContent']
    persistedFields.forEach(key => delete s[key])
    Object.keys(s).forEach(key => { state[key] = s[key] })
  },
  idAndRouting (state, idAndRouting) {
    mutations.reset(state)
    Vue.set(state, 'idAndRouting', idAndRouting)
  },
  doc (state, raw) {
    if (raw !== null) {
      Vue.set(state, 'doc', EsDocList.instantiate(raw))
      Vue.set(state, 'isContentLoaded', state.doc.hasContent)
      Vue.set(state, 'isTranslatedContentLoaded', state.doc.hasTranslatedContent)
      Vue.set(state, 'useContentTextLazyLoading', state.doc.hasBigContentTextLength)
    } else {
      Vue.set(state, 'doc', null)
    }
  },
  content (state, content = null) {
    if (state.doc) {
      Vue.set(state.doc, 'content', content)
      Vue.set(state, 'isContentLoaded', true)
    }
  },
  translations (state, translations = []) {
    if (state.doc) {
      Vue.set(state.doc, 'translations', translations)
      Vue.set(state, 'isTranslatedContentLoaded', true)
    }
  },
  tags (state, tags = []) {
    Vue.set(state, 'tags', tags)
  },
  namedEntities (state, raw) {
    Vue.set(state, 'namedEntities', new EsDocList(raw).hits)
  },
  namedEntitiesPageInCategory (state, { category, page }) {
    if (state.namedEntitiesPaginatedByCategories[category]) {
      state.namedEntitiesPaginatedByCategories[category].push(page)
    }
  },
  namedEntitiesPagesInCategory (state, { category, pages = [] } = {}) {
    state.namedEntitiesPaginatedByCategories[category] = pages
  },
  parentDocument (state, raw) {
    if (raw !== null) {
      Vue.set(state, 'parentDocument', EsDocList.instantiate(raw))
      state.doc.parent = raw
    } else {
      Vue.set(state, 'parentDocument', null)
    }
    return state.parentDocument
  },
  rootDocument (state, raw) {
    if (raw !== null) {
      Vue.set(state, 'rootDocument', EsDocList.instantiate(raw))
      state.doc.root = raw
    } else {
      Vue.set(state, 'rootDocument', null)
    }
    return state.rootDocument
  },
  toogleShowTransatedContent (state, toggle = null) {
    Vue.set(state, 'showTranslatedContent', (toggle !== null ? toggle : !state.showTranslatedContent))
  },
  addTag (state, { tag, userId }) {
    const tags = map(compact(tag.split(' ')), tag => {
      return { label: tag, user: { id: userId }, creationDate: Date.now() }
    })
    Vue.set(state, 'tags', uniqBy(concat(state.tags, tags), 'label'))
  },
  deleteTag (state, tagToDelete) {
    state.tags.splice(findIndex(state.tags, { label: tagToDelete.label }), 1)
  },
  isRecommended (state, isRecommended) {
    Vue.set(state, 'isRecommended', isRecommended)
  },
  recommendedBy (state, recommendedBy = []) {
    Vue.set(state, 'recommendedBy', recommendedBy)
  },
  markAsRecommended (state, userId) {
    state.recommendedBy.push(userId)
  },
  unmarkAsRecommended (state, userId) {
    const index = state.recommendedBy.indexOf(userId)
    if (index > -1) {
      Vue.delete(state.recommendedBy, index)
    }
  }
}

export const actions = {
  async get ({ commit, state }, idAndRouting) {
    try {
      const { id, index, routing } = idAndRouting
      const doc = await elasticsearch.getDocumentWithoutContent(index, id, routing)
      commit('idAndRouting', idAndRouting)
      commit('doc', doc)
    } catch (_) {
      commit('doc', null)
    }
    return state.doc
  },
  async getContent ({ commit, state }) {
    if (state.doc !== null) {
      const { id, routing } = state.idAndRouting
      const { index } = state.doc
      const doc = await elasticsearch.getDocumentWithContent(index, id, routing)
      const translations = get(doc, '_source.content_translated')
      const content = get(doc, '_source.content')
      commit('translations', translations)
      commit('content', content)
      return content
    }
  },
  getContentSlice ({ commit, state }, { offset, limit }) {
    if (state.doc !== null) {
      const { id, routing } = state.idAndRouting
      const { index } = state.doc
      const o = offset ?? 0
      const l = limit ?? 0
      return api.getDocumentSlice(index, id, o, l, routing)
    }
  },
  async setContent ({ commit, state }, content) {
    if (state.doc !== null) {
      commit('content', content)
    }
  },
  async getContentMaxOffset ({ state }) {
    if (state.doc !== null) {
      const { id, routing } = state.idAndRouting
      const { index } = state.doc
      const slice = await api.getDocumentSlice(index, id, 0, 0, routing)
      return slice.maxOffset
    }
  },
  async getParent ({ commit, state }) {
    if (state.doc !== null && state.doc.raw._source.extractionLevel > 0) {
      try {
        const { index } = state.doc
        const { parentDocument: id, rootDocument: routing } = state.doc.raw._source
        const doc = await elasticsearch.getDocumentWithoutContent(index, id, routing)
        commit('parentDocument', doc)
      } catch (_) {
        commit('parentDocument', null)
      }
    }
    return state.parentDocument
  },
  async getRoot ({ commit, state }) {
    if (state.doc !== null && state.doc.raw._source.extractionLevel > 0) {
      try {
        const { index } = state.doc
        const { rootDocument: id } = state.doc.raw._source
        const doc = await elasticsearch.getDocumentWithoutContent(index, id, id)
        commit('rootDocument', doc)
      } catch (_) {
        commit('rootDocument', null)
      }
    }
    return state.rootDocument
  },
  getFirstPageForNamedEntityInCategory ({ dispatch, commit }, { category, filterToken = null } = {}) {
    commit('namedEntitiesPagesInCategory', { category, pages: [] })
    return dispatch('getNextPageForNamedEntityInCategory', { category, filterToken })
  },
  async getFirstPageForNamedEntityInAllCategories ({ dispatch, getters }, { filterToken = null } = {}) {
    for (const category of getters.categories) {
      await dispatch('getFirstPageForNamedEntityInCategory', { filterToken, category })
    }
  },
  async getNextPageForNamedEntityInCategory ({ state, getters, commit }, { category, filterToken = null } = {}) {
    try {
      const from = getters.countNamedEntitiesInCategory(category)
      const index = state.doc.index
      const { id, routing } = state.doc
      const raw = await elasticsearch.getDocumentNamedEntitiesInCategory(index, id, routing, from, 50, category, filterToken)
      const page = new EsDocList(raw)
      if (from === 0) {
        const pages = [page]
        return commit('namedEntitiesPagesInCategory', { category, pages })
      } else {
        return commit('namedEntitiesPageInCategory', { category, page })
      }
    } catch (_) {
      return null
    }
  },
  async getTags ({ state, commit }) {
    try {
      const tags = await api.getTags(state.doc.index, state.doc.id)
      commit('tags', tags)
    } catch (_) {
      commit('tags')
    }
    return state.tags
  },
  async tag ({ state, dispatch }, { documents, tag, userId }) {
    const index = state.doc ? state.doc.index : get(documents, '0.index', null)
    await api.tagDocuments(index, map(documents, 'id'), compact(tag.split(' ')))
    if (documents.length === 1) await dispatch('addTag', { tag, userId })
  },
  async addTag ({ state, commit }, { tag, userId }) {
    commit('addTag', { tag, userId })
  },
  async deleteTag ({ state, commit }, { documents, tag }) {
    await api.untagDocuments(state.doc.index, map(documents, 'id'), [tag.label])
    if (documents.length === 1) commit('deleteTag', tag)
  },
  async toggleAsRecommended ({ state, commit }, userId) {
    if (state.isRecommended) {
      await api.setUnmarkAsRecommended(state.doc.index, [state.doc.id])
      commit('unmarkAsRecommended', userId)
      commit('isRecommended', false)
    } else {
      await api.setMarkAsRecommended(state.doc.index, [state.doc.id])
      commit('markAsRecommended', userId)
      commit('isRecommended', true)
    }
  },
  async getRecommendationsByDocuments ({ state, commit }, userId) {
    try {
      const recommendedBy = await api.getRecommendationsByDocuments(state.doc.index, state.doc.id)
      commit('recommendedBy', map(sortBy(get(recommendedBy, 'aggregates', []), 'item.id'), 'item.id'))
      const index = state.recommendedBy.indexOf(userId)
      if (index > -1) {
        commit('isRecommended', true)
      }
    } catch (_) {
      commit('recommendedBy', [])
    }
    return state.recommendedBy
  }
}

export default {
  namespaced: true,
  getters,
  state,
  mutations,
  actions
}
