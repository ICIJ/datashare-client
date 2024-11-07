<script setup>
import { computed, onBeforeMount, useTemplateRef } from 'vue'
import { useRouter, useRoute, onBeforeRouteUpdate } from 'vue-router'
import { useStore } from 'vuex'

import DocumentViewActions from './DocumentViewActions'
import DocumentViewTabs from './DocumentViewTabs/DocumentViewTabs'
import DocumentViewTitle from './DocumentViewTitle'
import DocumentViewUserActions from './DocumentViewUserActions'

import { useDocument } from '@/composables/document'

const elementRef = useTemplateRef('element')
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
const store = useStore()

const tab = computed({
  get: () => store.getters['app/getSettings']('documentView', 'tab'),
  set: (tab) => store.commit('app/setSettings', { view: 'documentView', tab })
})

const selectRouteTab = ({ name, params, query } = route) => {
  if (name === documentRoute.value.name) {
    router.replace({ name: `${documentRoute.value.name}.${tab.value}`, params, query })
  } else {
    tab.value = name?.split('.').pop() ?? 'text'
  }
}

const fetchRouteDocument = ({ params } = route) => {
  const { index = props.index, id = props.id, routing = props.routing } = params ?? {}
  fetchDocumentOnce({ index, id, routing })
}

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
      <document-view-user-actions :document="document" />
      <document-view-actions :document="document" class="ms-auto" />
      <slot name="nav" v-bind="{ document }">
        <router-view name="nav" />
      </slot>
    </div>

    <document-view-title :document="document" />
    <document-view-tabs :document="document" />

    <router-view />
  </v-wait>
</template>

<style lang="scss" scoped>
.document-view {
  width: 0;
  min-width: 100%;
  flex-basis: 100%;
}
</style>
