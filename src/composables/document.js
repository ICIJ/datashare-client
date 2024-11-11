import { computed, provide, useId, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { matches, overSome } from 'lodash'

import { useCore } from '@/composables/core'
import { useWait } from '@/composables/wait'

export const useDocument = function (element) {
  const store = useStore()
  const router = useRouter()
  const { core } = useCore()
  const { waitFor } = useWait()
  const loaderId = useId()

  const fetchDocument = waitFor(loaderId, async function ({ index, id, routing } = {}) {
    await store.dispatch('document/get', { index, id, routing })
    await store.dispatch('document/getParent')
    await store.dispatch('document/getRoot')
    await store.dispatch('document/getTags')
    await store.dispatch('document/getRecommendationsByDocuments', await core.auth.getUsername())

    if (document.value) {
      const { route, slicedNameToString } = document.value
      await core.api.addUserHistoryEvent([index], 'DOCUMENT', slicedNameToString, route)
      const container = window.document.body
      core.emit('scroll-tracker:request', { element, container, offset: 0 })
    }
  })

  const fetchDocumentOnce = ({ index, id, routing } = {}) => {
    // This function only fetch document if the index and id are
    // different from the current document in the store.
    if (document.value?.index !== index || document.value?.id !== id) {
      return fetchDocument({ index, id, routing })
    }
  }

  const isActive = function ({ index, id, routing }) {
    return document.value?.index === index && document.value?.id === id && document.value?.routing === routing
  }

  const isRouteActive = function ({ index, id, routing }) {
    return isActive({ index, id, routing }) && !!documentRoute.value
  }

  const documentRoute = computed(() => {
    const { matched } = router.currentRoute.value ?? []
    const predicates = ['document', 'document-standalone'].map((name) => matches({ name }))
    return matched.find(overSome(predicates))
  })

  const document = computed(() => {
    return store.state.document.doc
  })

  const parent = computed(() => {
    return store.state.document.parentDocument
  })

  const documentPath = computed(() => {
    if (core.config.get('mountedDataDir')) {
      return document.value.source.path.replace(core.config.get('dataDir'), core.config.get('mountedDataDir'))
    } else {
      return document.value.source.path
    }
  })

  const documentDirname = computed(() => {
    if (core.config.get('mountedDataDir')) {
      return document.value.source.dirname.replace(core.config.get('dataDir'), core.config.get('mountedDataDir'))
    } else {
      return document.value.source.dirname
    }
  })

  const provideDocumentViewFloatingId = () => {
    const id = useId()
    provide('documentViewFloatingId', id)
    return id
  }

  const watchDocument = function (callback, options) {
    // We watch the document's router params as string to avoid deep watching the object
    // with unnecessary reactivity and unwanted side effects.
    const values = () => Object.values(document.value?.routerParams ?? {}).join(':')
    return watch(values, () => callback(document.value), options)
  }

  return {
    fetchDocument,
    fetchDocumentOnce,
    document,
    documentPath,
    documentDirname,
    documentRoute,
    parent,
    loaderId,
    isActive,
    isRouteActive,
    provideDocumentViewFloatingId,
    watchDocument
  }
}
