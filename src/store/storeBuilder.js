import some from 'lodash/some'
import createPersistedState from 'vuex-persistedstate'
import { createStore } from 'vuex'

import { batchStoreBuilder } from './modules/batchSearch'
import { documentStoreBuilder } from './modules/document'
import { searchStoreBuilder } from './modules/search'

export function storeBuilder(api) {
  return createStore({
    modules: {
      batchSearch: batchStoreBuilder(api),
      document: documentStoreBuilder(api),
      search: searchStoreBuilder(api)
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
