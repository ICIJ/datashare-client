import { compact, concat, findIndex, flattenDeep, get, keys, map, groupBy, sortBy, sumBy, uniqBy, values } from 'lodash'

import EsDocList from '@/api/resources/EsDocList'

export function initialState() {
  return {
    doc: null,
    idAndRouting: null,
    isContentLoaded: false,
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
    showTranslatedContent: true,
    tags: []
  }
}

export const state = initialState()

export const getters = {
  countNamedEntitiesInCategory(state) {
    return (category) => {
      const pages = get(state, ['namedEntitiesPaginatedByCategories', category], [])
      // Sum up all page size
      return sumBy(pages, (page) => get(page, 'hits.length', 0))
    }
  },
  namedEntities(state) {
    const categoriesPages = values(state.namedEntitiesPaginatedByCategories)
    const hits = categoriesPages.map((pages) => pages.map((page) => page.hits))
    return flattenDeep(hits)
  },
  categories(state) {
    return keys(state.namedEntitiesPaginatedByCategories)
  }
}

export const mutations = {
  reset(state) {
    const s = initialState()
    const persistedFields = ['showTranslatedContent']
    persistedFields.forEach((key) => delete s[key])
    Object.keys(s).forEach((key) => {
      state[key] = s[key]
    })
  },
  idAndRouting(state, idAndRouting) {
    mutations.reset(state)
    state.idAndRouting = idAndRouting
  },
  doc(state, raw) {
    if (raw !== null) {
      state.doc = EsDocList.instantiate(raw)
      state.isContentLoaded = state.doc.hasContent
    } else {
      state.doc = null
    }
  },
  content(state, content = null) {
    if (state.doc) {
      state.doc.content = content
      state.isContentLoaded = true
    }
  },
  translations(state, translations = []) {
    if (state.doc) {
      state.doc.translations = translations
    }
  },
  tags(state, tags = []) {
    state.tags = tags
  },
  namedEntities(state, raw) {
    state.namedEntities = new EsDocList(raw).hits
  },
  namedEntitiesPageInCategory(state, { category, page }) {
    if (state.namedEntitiesPaginatedByCategories[category]) {
      state.namedEntitiesPaginatedByCategories[category].push(page)
    }
  },
  namedEntitiesPagesInCategory(state, { category, pages = [] } = {}) {
    state.namedEntitiesPaginatedByCategories[category] = pages
  },
  parentDocument(state, raw) {
    if (raw !== null) {
      state.parentDocument = EsDocList.instantiate(raw)
      state.doc.parent = raw
    } else {
      state.parentDocument = null
    }
    return state.parentDocument
  },
  rootDocument(state, raw) {
    if (raw !== null) {
      state.rootDocument = EsDocList.instantiate(raw)
      state.doc.root = raw
    } else {
      state.rootDocument = null
    }
    return state.rootDocument
  },
  toggleShowTranslatedContent(state, toggle = null) {
    state.showTranslatedContent = toggle !== null ? toggle : !state.showTranslatedContent
  },
  addTag(state, { label, userId }) {
    const user = { id: userId }
    const creationDate = Date.now()
    const tags = compact(label.split(' ')).map((label) => ({ label, user, creationDate }))
    state.tags = uniqBy(concat(state.tags, tags), 'label')
  },
  deleteTag(state, label) {
    state.tags.splice(findIndex(state.tags, { label }), 1)
  },
  isRecommended(state, isRecommended) {
    state.isRecommended = isRecommended
  },
  recommendedBy(state, recommendedBy = []) {
    state.recommendedBy = recommendedBy
  },
  markAsRecommended(state, userId) {
    state.recommendedBy.push(userId)
  },
  unmarkAsRecommended(state, userId) {
    const index = state.recommendedBy.indexOf(userId)
    if (index > -1) {
      state.recommendedBy.splice(index, 1)
    }
  }
}

function actionBuilder(api) {
  return {
    async get({ commit, state }, idAndRouting) {
      try {
        const { id, index, routing } = idAndRouting
        const doc = await api.elasticsearch.getDocumentWithoutContent(index, id, routing)
        commit('idAndRouting', idAndRouting)
        commit('doc', doc)
      } catch (_) {
        commit('doc', null)
      }
      return state.doc
    },
    async getContent({ commit, state }) {
      if (state.doc !== null) {
        const { id, routing } = state.idAndRouting
        const { index } = state.doc
        const doc = await api.elasticsearch.getDocumentWithContent(index, id, routing)
        const translations = get(doc, '_source.content_translated')
        const content = get(doc, '_source.content')
        commit('translations', translations)
        commit('content', content)
        return content
      }
    },
    getContentSlice({ state }, { offset, limit, targetLanguage }) {
      if (state.doc !== null) {
        const { id, routing } = state.idAndRouting
        const { index } = state.doc
        const o = offset ?? 0
        const l = limit ?? 0
        return api.getDocumentSlice(index, id, o, l, targetLanguage, routing)
      }
    },
    async setContent({ commit, state }, content) {
      if (state.doc !== null) {
        commit('content', content)
      }
    },
    async getContentMaxOffset({ state }, { targetLanguage }) {
      if (state.doc !== null) {
        const { id, routing } = state.idAndRouting
        const { index } = state.doc
        const slice = await api.getDocumentSlice(index, id, 0, 0, targetLanguage, routing)
        return slice.maxOffset
      }
    },
    async searchOccurrences({ state }, { query, targetLanguage }) {
      if (state.doc !== null) {
        const { id, routing } = state.idAndRouting
        const { index } = state.doc
        return api.searchDocument(index, id, query, targetLanguage, routing)
      }
      return { count: 0, offsets: [] }
    },
    async getParent({ commit, state }) {
      if (state.doc !== null && state.doc.raw._source.extractionLevel > 0) {
        try {
          const { index } = state.doc
          const { parentDocument: id, rootDocument: routing } = state.doc.raw._source
          const doc = await api.elasticsearch.getDocumentWithoutContent(index, id, routing)
          commit('parentDocument', doc)
        } catch (_) {
          commit('parentDocument', null)
        }
      }
      return state.parentDocument
    },
    async getRoot({ commit, state }) {
      if (state.doc !== null && state.doc.raw._source.extractionLevel > 0) {
        try {
          const { index } = state.doc
          const { rootDocument: id } = state.doc.raw._source
          const doc = await api.elasticsearch.getDocumentWithoutContent(index, id, id)
          commit('rootDocument', doc)
        } catch (_) {
          commit('rootDocument', null)
        }
      }
      return state.rootDocument
    },
    getFirstPageForNamedEntityInCategory({ dispatch, commit }, { category, filterToken = null } = {}) {
      commit('namedEntitiesPagesInCategory', { category, pages: [] })
      return dispatch('getNextPageForNamedEntityInCategory', { category, filterToken })
    },
    async getFirstPageForNamedEntityInAllCategories({ dispatch, getters }, { filterToken = null } = {}) {
      return Promise.all(
        getters.categories.map((category) =>
          dispatch('getFirstPageForNamedEntityInCategory', { filterToken, category })
        )
      )
    },
    async getNextPageForNamedEntityInCategory({ state, getters, commit }, { category, filterToken = null } = {}) {
      try {
        const from = getters.countNamedEntitiesInCategory(category)
        const index = state.doc.index
        const { id, routing } = state.doc
        const raw = await api.elasticsearch.getDocumentNamedEntitiesInCategory(
          index,
          id,
          routing,
          from,
          50,
          category,
          filterToken
        )
        const page = new EsDocList(raw)
        if (from === 0) {
          const pages = [page]
          commit('namedEntitiesPagesInCategory', { category, pages })
        } else {
          commit('namedEntitiesPageInCategory', { category, page })
        }
      } catch (_) {}
    },
    async getTags({ state, commit }) {
      try {
        const tags = await api.getTags(state.doc.index, state.doc.id)
        commit('tags', tags)
      } catch (_) {
        commit('tags')
      }
      return state.tags
    },
    async addTag({ dispatch }, { documents, label }) {
      await dispatch('addTags', { documents, labels: compact(label.split(' ')) })
    },
    async addTags({ dispatch }, { documents, labels }) {
      const grouped = groupBy(documents, 'index')
      for (const [index, subset] of Object.entries(grouped)) {
        await api.tagDocuments(index, map(subset, 'id'), labels)
      }
      await dispatch('getTags')
    },
    async deleteTag({ dispatch }, { documents, label }) {
      const grouped = groupBy(documents, 'index')
      for (const [index, subset] of Object.entries(grouped)) {
        await api.untagDocuments(index, map(subset, 'id'), [label])
      }
      await dispatch('getTags')
    },
    async toggleAsRecommended({ state, dispatch }, userId) {
      try {
        if (state.isRecommended) {
          await api.setUnmarkAsRecommended(state.doc.index, [state.doc.id])
        } else {
          await api.setMarkAsRecommended(state.doc.index, [state.doc.id])
        }
      } finally {
        await dispatch('getRecommendationsByDocuments', userId)
      }
    },
    async getRecommendationsByDocuments({ state, commit }, userId) {
      try {
        const recommendedBy = await api.getRecommendationsByDocuments(state.doc.index, state.doc.id)
        commit('recommendedBy', map(sortBy(get(recommendedBy, 'aggregates', []), 'item.id'), 'item.id'))
        const index = state.recommendedBy.indexOf(userId)
        commit('isRecommended', index > -1)
      } catch (_) {
        commit('recommendedBy', [])
        commit('isRecommended', false)
      }
      return state.recommendedBy
    }
  }
}

export const documentStoreBuilder = function (api) {
  const actions = actionBuilder(api)
  return {
    namespaced: true,
    getters,
    state,
    mutations,
    actions
  }
}
