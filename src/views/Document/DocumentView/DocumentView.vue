<script setup>
import { computed, onBeforeMount, useTemplateRef } from 'vue'
import { useRouter, useRoute, onBeforeRouteUpdate } from 'vue-router'

import DocumentViewActions from './DocumentViewActions'
import DocumentViewTabs from './DocumentViewTabs/DocumentViewTabs'
import DocumentViewTitle from './DocumentViewTitle'
import DocumentViewUserActions from './DocumentViewUserActions'

import { useSearchNav } from '@/composables/search-nav'
import { useDocument } from '@/composables/document'
import { useAppStore } from '@/store/modules/app'

const elementRef = useTemplateRef('element')
const { whenNoSearchEntries } = useSearchNav()
const { document, documentRoute, fetchDocumentOnce, loaderId } = useDocument(elementRef)

const props = defineProps({
  id: {
    type: String
  },
  routing: {
    type: String
  },
  index: {
    type: String
  },
  q: {
    type: String,
    default: ''
  }
})

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()

const tab = computed({
  get: () => appStore.getSettings('documentView', 'tab'),
  set: (tab) => appStore.setSettings({ view: 'documentView', tab })
})

const selectRouteTab = async ({ name, params, query } = route) => {
  if (name === 'error') {
    return
  }
  if (name === documentRoute.value.name) {
    await router.replace({ name: `${documentRoute.value.name}.${tab.value}`, params, query })
  } else {
    tab.value = name?.split('.').pop() ?? 'text'
  }
}

const fetchRouteDocument = async ({ params } = route) => {
  const { index = props.index, id = props.id, routing = props.routing } = params ?? {}
  await fetchDocumentOnce({ index, id, routing })

  // No document found, redirect to error page
  if (!document.value) {
    await router.push({ name: 'error' })
  }
}

const redirectToDocumentStandalone = () => {
  if (route.name.startsWith('document.')) {
    return router.replace({ name: 'document-standalone' })
  }
}

// Ensure we do not display the document in the context of the search, when there is actually no search
onBeforeMount(whenNoSearchEntries(redirectToDocumentStandalone))

// Ensure the selected tab is always in sync with the route
onBeforeMount(selectRouteTab)
onBeforeRouteUpdate(selectRouteTab)

// Ensure the document is always in sync with the route
onBeforeMount(fetchRouteDocument)
onBeforeRouteUpdate(fetchRouteDocument)
</script>

<template>
  <v-wait ref="element" class="document-view d-flex flex-column gap-3" :for="loaderId">
    <template #waiting>
      <content-placeholder />
    </template>

    <div class="document-view__header d-flex justify-content-between align-items-center gap-2">
      <slot name="header-start" v-bind="{ document }" />
      <document-view-user-actions />
      <document-view-actions :document="document" class="ms-auto" />
      <slot name="nav" v-bind="{ document }">
        <router-view name="nav" />
      </slot>
      <slot name="header-end" v-bind="{ document }" />
    </div>

    <document-view-title :document="document" />
    <document-view-tabs :document-route="documentRoute" />

    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </v-wait>
</template>

<style lang="scss" scoped>
.document-view {
  width: 0;
  min-width: 100%;
  flex-basis: 100%;
}
</style>
