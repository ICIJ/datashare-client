import some from 'lodash/some'
import createPersistedState from 'vuex-persistedstate'
import { createStore } from 'vuex'

import { batchStoreBuilder } from './modules/batchSearch'
import { documentStoreBuilder } from './modules/document'
import { indexingStoreBuilder } from './modules/indexing'
import { recommendedStoreBuilder } from './modules/recommended'
import { searchStoreBuilder } from './modules/search'
import { searchBreadcrumbStoreBuilder } from './modules/search-breadcrumb'
import insights from './modules/insights'

export function storeBuilder(api) {
  return createStore({
    modules: {
      batchSearch: batchStoreBuilder(api),
      document: documentStoreBuilder(api),
      indexing: indexingStoreBuilder(api),
      insights,
      recommended: recommendedStoreBuilder(api),
      search: searchStoreBuilder(api),
      searchBredcrumb: searchBreadcrumbStoreBuilder()
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
