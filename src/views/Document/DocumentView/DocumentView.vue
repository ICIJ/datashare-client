<script setup>
import { computed, inject, markRaw, onBeforeMount, ref, useTemplateRef, watch } from 'vue'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { matches, property } from 'lodash'
import { useElementSize, useScroll, useWindowSize } from '@vueuse/core'

import DocumentViewActions from './DocumentViewActions'
import DocumentViewTabs from './DocumentViewTabs/DocumentViewTabs'
import DocumentViewTitle from './DocumentViewTitle'
import DocumentViewUserActions from './DocumentViewUserActions'

import AppWait from '@/components/AppWait/AppWait'
import ButtonToTop from '@/components/Button/ButtonToTop'
import DocumentContentPlaceholder from '@/components/Document/DocumentContentPlaceholder'
import DocumentPlaceholder from '@/components/Document/DocumentPlaceholder'
import { replaceUrlParamValue } from '@/composables/replaceUrlParamValue'
import { useSearchNav } from '@/composables/useSearchNav'
import { useDocument } from '@/composables/useDocument'
import { useUrlParamWithStore } from '@/composables/useUrlParamWithStore'
import { useAppStore } from '@/store/modules'
import { useWait } from '@/composables/useWait'
import { useScrollParent } from '@/composables/useScrollParent'
import { SIZE } from '@/enums/sizes'

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
  },
  compact: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()

const containerRef = useScrollParent({ topLevelParent: window })
const elementRef = useTemplateRef('element')

const { height: elementHeight } = useElementSize(elementRef)
const { height: windowHeight } = useWindowSize()
const { y: scrollY } = useScroll(containerRef)
const { waitFor: tabWaitFor, loaderId: tabLoaderId } = useWait()
const { whenSearchHasNoEntries } = useSearchNav()
const { document, fetchDocumentOnce, loaderId } = useDocument(elementRef)
const { t } = useI18n()

// Ensure legacy tab names are replaced with new ones for backward compatibility
replaceUrlParamValue({ name: 'tab', oldValue: 'extracted-text', newValue: 'text' })
replaceUrlParamValue({ name: 'tab', oldValue: 'preview', newValue: 'view' })
replaceUrlParamValue({ name: 'tab', oldValue: 'details', newValue: 'metadata' })
replaceUrlParamValue({ name: 'tab', oldValue: 'named-entities', newValue: 'entities' })

// We cannot use a <router-view> to display the tabs because the document view must be independent of the router.
// This independence is crucial to allow the document view to be used in various contexts, such as displaying a document
// in a modal on the batch search results page or embedding it in other parts of the application where the router may
// not be involved.

// Instead of relying on <router-view>, we use a custom list of tabs defined in the `tabs` computed property.
// Each tab is associated with a component that is dynamically imported when the tab is activated.
// The "tab" route query parameter is used to determine which tab is currently active.
// This approach allows us to maintain the active tab state in the URL, enabling deep linking and bookmarking of specific tabs.
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

// Additionally, the "tab" route query parameter is kept in sync with the `appStore`.
// This synchronization ensures that when switching from one document to another, the active tab remains consistent.
// For example, if the user is viewing the "metadata" tab of one document and navigates to another document,
// the application will automatically display the "metadata" tab for the new document as well.
const tab = useUrlParamWithStore('tab', {
  initialValue: 'text',
  get: () => appStore.getSettings('documentView', 'tab'),
  set: tab => appStore.setSettings('documentView', { tab })
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

const fetchTabComponent = tabWaitFor(async (tab) => {
  const entry = tabs.value.find(matches({ tab }))
  component.value = await entry?.component().then(property('default')).then(markRaw)
})

const redirectToDocumentStandalone = () => {
  if (route.name === 'document') {
    const { index, id, routing } = route.params
    const { tab } = route.query
    const params = { index, id, routing }
    const query = { tab }
    return router.replace({ name: 'document-standalone', params, query })
  }
}

const showButtonToTop = computed(() => {
  const heightThreshold = windowHeight.value * 0.2
  return scrollY.value > heightThreshold && elementHeight.value > windowHeight.value
})

const modal = inject('modal', undefined)
// Adjust the size of action buttons based on the compact mode.
const actionsSize = computed(() => (props.compact && !modal ? SIZE.SM : SIZE.MD))

function scrollToTop() {
  scrollY.value = 0
}

// Ensure the selected tab's component is loaded and in sync with the route
watch(tab, fetchTabComponent, { immediate: true })

// Ensure we do not display the document in the context of the search, when there is actually no search
onBeforeMount(whenSearchHasNoEntries(redirectToDocumentStandalone))

// Ensure the document is always in sync with the route
onBeforeMount(fetchRouteDocument)
onBeforeRouteUpdate(fetchRouteDocument)

</script>

<template>
  <app-wait
    ref="element"
    class="document-view d-flex flex-column"
    :for="loaderId"
  >
    <template #waiting>
      <document-placeholder />
    </template>

    <template v-if="document">
      <div
        class="document-view__header d-flex gap-2 mb-2"
      >
        <slot
          name="header-start"
          v-bind="{ document }"
        />
        <document-view-user-actions v-if="!compact" />
        <document-view-actions
          :document="document"
          :no-close="compact"
          :size="actionsSize"
          class="ms-auto"
        />
        <slot
          name="nav"
          v-bind="{ document }"
        >
          <router-view name="nav" />
        </slot>
        <slot
          name="header-end"
          v-bind="{ document }"
        />
      </div>
      <slot
        name="header-end"
        v-bind="{ document }"
      />
      <document-view-title
        :document="document"
      />
      <document-view-user-actions
        v-if="compact"
        class="my-2"
      />
      <document-view-tabs
        :tabs="tabs"
      />
      <app-wait :for="tabLoaderId">
        <component
          :is="component"
          v-if="component"
          :q="q ?? route.query.q"
        />
        <template #waiting>
          <document-content-placeholder class="py-3" />
        </template>
      </app-wait>

      <transition name="fade">
        <button-to-top
          v-if="showButtonToTop"
          class="document-view__to-top"
          @click="scrollToTop"
        />
      </transition>
    </template>
  </app-wait>
</template>

<style lang="scss" scoped>
.document-view {
  width: 0;
  min-width: 100%;
  min-height: calc(70vh);
  flex-basis: 100%;

  &__header {
    max-width: 100%;
    flex-wrap: nowrap;
    overflow: auto;
  }

  &__document-view-tabs{
    flex: 1 1 480px;
  }

  &__to-top.btn {
    position: fixed;
    bottom: $spacer;
    right: $spacer;

    .modal-fullscreen & {
      right: calc(var(--bs-modal-margin) + var(--bs-modal-padding));
    }

    &.fade-enter-active,
    &.fade-leave-active {
      transition: opacity 0.3s;
    }

    &.fade-enter-from,
    &.fade-leave-to {
      opacity: 0;
    }
  }
}
</style>
