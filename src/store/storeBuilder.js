import { createStore } from 'vuex'

import { batchStoreBuilder } from './modules/batchSearch'

export function storeBuilder(api) {
  return createStore({
    strict: import.meta.env.MODE === 'development',
    modules: {
      batchSearch: batchStoreBuilder(api)
    }
  })
}
