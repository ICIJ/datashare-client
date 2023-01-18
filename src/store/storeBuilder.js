import some from 'lodash/some'
import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

import { batchStoreBuilder } from './modules/batchSearch'
import { documentNotesStoreBuilder } from './modules/documentNotes'
import { documentStoreBuilder } from './modules/document'
import { downloadsBuilder } from './modules/downloads'
import { indexingStoreBuilder } from './modules/indexing'
import { recommendedStoreBuilder } from './modules/recommended'
import { searchStoreBuilder } from './modules/search'
import { settingsStoreBuilder } from './modules/settings'
import { starredStoreBuilder } from './modules/starred'
import app from './modules/app'
import hooks from './modules/hooks'
import insights from './modules/insights'
import pipelines from './modules/pipelines'
import player from './modules/player'
import treeView from './modules/treeView'

Vue.use(Vuex)
export function storeBuilder(api) {
  return new Vuex.Store({
    modules: {
      app,
      batchSearch: batchStoreBuilder(api),
      document: documentStoreBuilder(api),
      documentNotes: documentNotesStoreBuilder(api),
      downloads: downloadsBuilder(api),
      hooks,
      indexing: indexingStoreBuilder(api),
      insights,
      player,
      pipelines,
      recommended: recommendedStoreBuilder(api),
      search: searchStoreBuilder(api),
      settings: settingsStoreBuilder(api),
      starred: starredStoreBuilder(api),
      treeView
    },
    strict: process.env.NODE_ENV === 'development',
    plugins: [
      createPersistedState({
        paths: [
          'app.redirectAfterLogin',
          'document.showTranslatedContent',
          'player.autoplay',
          'player.loop',
          'search.query',
          'search.size',
          'search.values',
          'search.reversedFilters',
          'search.contextualizedFilters',
          'search.sort',
          'search.field',
          'search.index',
          'search.indices',
          'search.showFilters',
          'search.layout'
        ],
        filter(mutation) {
          // Only for some mutations
          return some(['search/', 'app/', 'doc/', 'player/'], (k) => mutation.type.indexOf(k) === 0)
        }
      })
    ]
  })
}
