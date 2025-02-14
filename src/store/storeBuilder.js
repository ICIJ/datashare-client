import some from 'lodash/some'
import createPersistedState from 'vuex-persistedstate'
import { createStore } from 'vuex'

import { batchStoreBuilder } from './modules/batchSearch'
import { documentStoreBuilder } from './modules/document'
import { indexingStoreBuilder } from './modules/indexing'
import { recommendedStoreBuilder } from './modules/recommended'
import { searchStoreBuilder } from './modules/search'
import { searchBreadcrumbStoreBuilder } from './modules/search-breadcrumb'
import { settingsStoreBuilder } from './modules/settings'
import { starredStoreBuilder } from './modules/starred'
import hooks from './modules/hooks'
import insights from './modules/insights'
import pipelines from './modules/pipelines'
import treeView from './modules/treeView'

export function storeBuilder(api) {
  return createStore({
    modules: {
      batchSearch: batchStoreBuilder(api),
      document: documentStoreBuilder(api),
      hooks,
      indexing: indexingStoreBuilder(api),
      insights,
      pipelines,
      recommended: recommendedStoreBuilder(api),
      search: searchStoreBuilder(api),
      searchBreadcrumb: searchBreadcrumbStoreBuilder(),
      settings: settingsStoreBuilder(api),
      starred: starredStoreBuilder(api),
      treeView
    },
    strict: import.meta.env.MODE === 'development',
    plugins: [
      createPersistedState({
        paths: [
          'document.showTranslatedContent',
          'search.query',
          'search.values',
          'search.excludeFilters',
          'search.contextualizeFilters',
          'search.sortFilters',
          'search.field',
          'search.index',
          'search.indices',
          'search.showFilters',
          'search.layout'
        ],
        filter(mutation) {
          // Only for some mutations
          return some(['search/', 'doc/', 'player/'], (k) => mutation.type.indexOf(k) === 0)
        }
      })
    ]
  })
}
