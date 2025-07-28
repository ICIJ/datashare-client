import { computed, inject, provide, useId, watch, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { find, matches, overSome } from 'lodash'
import { useModalController } from 'bootstrap-vue-next'

import { useCore } from '@/composables/useCore'
import { useWait } from '@/composables/useWait'
import DocumentViewerModal from '@/components/Document/DocumentViewerModal/DocumentViewerModal'
import { useDocumentStore } from '@/store/modules'

export const useDocument = function (element) {
  const DOCUMENT_VIEW_FLOATING_ID_KEY = 'documentViewFloatingId'

  const documentStore = useDocumentStore()
  const route = useRoute()
  const router = useRouter()
  const { core } = useCore()
  const { waitFor, loaderId } = useWait()

  const fetchDocument = waitFor(async function ({ index, id, routing } = {}) {
    await documentStore.getDocument({ index, id, routing })
    await documentStore.getParentDocument()
    await documentStore.getRootDocument()
    await documentStore.getTags()
    await documentStore.getRecommendationsByDocuments(await core.auth.getUsername())

    if (document.value) {
      const { route, slicedNameToString } = document.value
      await core.api.addHistoryEvent([index], 'DOCUMENT', slicedNameToString, route)
      core.emit('scroll-tracker:request', { element })
    }
  })

  const fetchDocumentOnce = ({ index, id, routing } = {}) => {
    // This function only fetch document if the index and id are
    // different from the current document in the documentStore.
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
    return find(matched, overSome(predicates))
  })

  const documentParentRoute = computed(() => {
    const { name } = documentRoute.value
    const matchedIndex = route.matched.findIndex(matches({ name }))
    return matchedIndex > -1 ? route.matched[matchedIndex - 1] : null
  })

  const documentStandaloneRoute = computed(() => {
    const params = document.value.routerParams
    return router.resolve({ name: 'document-standalone', params })
  })

  const document = computed(() => {
    return documentStore.document
  })

  const parent = computed(() => {
    return documentStore.parentDocument
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
    provide(DOCUMENT_VIEW_FLOATING_ID_KEY, id)
    return id
  }

  const injectDocumentViewFloatingId = () => {
    return inject(DOCUMENT_VIEW_FLOATING_ID_KEY, null)
  }

  const documentViewFloatingSelector = computed(() => {
    const id = injectDocumentViewFloatingId()
    return id ? `#${id}` : null
  })

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
    documentParentRoute,
    documentStandaloneRoute,
    parent,
    loaderId,
    isActive,
    isRouteActive,
    provideDocumentViewFloatingId,
    injectDocumentViewFloatingId,
    documentViewFloatingSelector,
    watchDocument
  }
}

export const useDocumentModal = function (document) {
  const modalController = useModalController()
  const props = { document }

  function show() {
    return new Promise((resolve) => {
      const component = h(DocumentViewerModal, {
        onOk: resolve,
        onClose: resolve,
        onCancel: resolve
      })

      modalController.create({ component, props })
    })
  }

  function hide() {
    return modalController.hide()
  }

  return { show, hide }
}
