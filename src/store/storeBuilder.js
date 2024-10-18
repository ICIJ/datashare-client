import some from 'lodash/some'
import createPersistedState from 'vuex-persistedstate'
import { createStore } from 'vuex'

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

export function storeBuilder(api) {
  return createStore({
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
    strict: import.meta.env.MODE === 'development',
    plugins: [
      createPersistedState({
        paths: [
          'app.redirectAfterLogin',
          'app.sidebar.compact',
          'app.sidebar.closed',
          'app.pins.projects',
          'document.showTranslatedContent',
          'player.autoplay',
          'player.loop',
          'search.query',
          'search.size',
          'search.values',
          'search.excludeFilters',
          'search.contextualizeFilters',
          'search.sortFilters',
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
