<script setup>
import { computed, ref, onBeforeMount, useTemplateRef, markRaw, watch } from 'vue'
import { useRouter, useRoute, onBeforeRouteUpdate } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { matches, property } from 'lodash'

import DocumentViewActions from './DocumentViewActions'
import DocumentViewTabs from './DocumentViewTabs/DocumentViewTabs'
import DocumentViewTitle from './DocumentViewTitle'
import DocumentViewUserActions from './DocumentViewUserActions'

import AppWait from '@/components/AppWait/AppWait'
import DocumentPlaceholder from '@/components/Document/DocumentPlaceholder'
import { useSearchNav } from '@/composables/useSearchNav'
import { useDocument } from '@/composables/useDocument'
import { useUrlParamWithStore } from '@/composables/useUrlParamWithStore'
import { useAppStore } from '@/store/modules'

const elementRef = useTemplateRef('element')
const { t } = useI18n()
const { whenNoSearchEntries } = useSearchNav()
const { document, fetchDocumentOnce, loaderId } = useDocument(elementRef)

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

const tab = useUrlParamWithStore('tab', {
  initialValue: 'text',
  get: () => appStore.getSettings('documentView', 'tab'),
  set: (tab) => appStore.setSettings({ view: 'documentView', tab })
})

const tabs = computed(() => {
  return [
    {
      title: t('documentViewTabs.text'),
      component: () => import('@/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsText.vue'),
      icon: 'text-align-left',
      tab: 'text'
    },
    {
      title: t('documentViewTabs.viewer'),
      component: () => import('@/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsViewer.vue'),
      icon: 'file',
      tab: 'viewer'
    },
    {
      title: t('documentViewTabs.metadata'),
      component: () => import('@/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsMetadata.vue'),
      icon: 'info',
      tab: 'metadata'
    },
    {
      title: t('documentViewTabs.entities'),
      component: () => import('@/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsEntities.vue'),
      icon: 'users-three',
      tab: 'entities'
    }
  ]
})

const component = ref(null)

const fetchRouteDocument = async ({ params } = route) => {
  const { index = props.index, id = props.id, routing = props.routing } = params ?? {}
  await fetchDocumentOnce({ index, id, routing })

  // No document found, redirect to error page
  if (!document.value) {
    await router.push({ name: 'error' })
  }
}

const fetchTabComponent = async (tab) => {
  const entry = tabs.value.find(matches({ tab }))
  component.value = await entry?.component().then(property('default')).then(markRaw)
}

const redirectToDocumentStandalone = () => {
  if (route.name.startsWith('document.')) {
    return router.replace({ name: 'document-standalone' })
  }
}

// Ensure the selected tab's component is loaded and in sync with the route
watch(tab, fetchTabComponent, { immediate: true })

// Ensure we do not display the document in the context of the search, when there is actually no search
onBeforeMount(whenNoSearchEntries(redirectToDocumentStandalone))

// Ensure the document is always in sync with the route
onBeforeMount(fetchRouteDocument)
onBeforeRouteUpdate(fetchRouteDocument)
</script>

<template>
  <app-wait ref="element" class="document-view d-flex flex-column" :for="loaderId">
    <template #waiting>
      <document-placeholder />
    </template>

    <div class="document-view__header mb-3 d-flex justify-content-between align-items-center gap-2">
      <slot name="header-start" v-bind="{ document }" />
      <document-view-user-actions />
      <document-view-actions :document="document" class="ms-auto" />
      <slot name="nav" v-bind="{ document }">
        <router-view name="nav" />
      </slot>
      <slot name="header-end" v-bind="{ document }" />
    </div>

    <document-view-title class="mb-3" :document="document" />
    <document-view-tabs :tabs="tabs" />

    <component :is="component" v-if="component" />
  </app-wait>
</template>

<style lang="scss" scoped>
.document-view {
  width: 0;
  min-width: 100%;
  flex-basis: 100%;
}
</style>
