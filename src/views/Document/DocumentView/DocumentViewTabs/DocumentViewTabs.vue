<script setup>
import { computed, inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import Hook from '@/components/Hook/Hook'
import TabGroupNavigation from '@/components/TabGroup/TabGroupNavigation/TabGroupNavigation'
import TabGroupNavigationEntry from '@/components/TabGroup/TabGroupNavigation/TabGroupNavigationEntry'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import { useSearchNav } from '@/composables/useSearchNav'
import { useAppStore } from '@/store/modules'

const { tabs, noRoute } = defineProps({
  tabs: {
    type: Array,
    default: () => []
  },
  noRoute: {
    type: Boolean,
    default: false
  }
})

const localTab = defineModel('tab', { type: String })

const appStore = useAppStore()
const router = useRouter()
const route = useRoute()
const { searchRouteWithoutRefresh } = useSearchNav()
const { wheneverRouteActionShortcut } = useKeyboardShortcuts()

const modal = inject('modal', undefined)
const routeTab = computed(() => route?.query?.tab || appStore.getSettings('documentView', 'tab'))
const tab = computed(() => noRoute ? localTab.value : routeTab.value)
const tabRoute = ({ tab }) => ({ query: { tab, modal } })
const entryRoute = entry => noRoute ? undefined : tabRoute(entry)

const selectTab = (entry) => {
  if (noRoute) {
    localTab.value = entry.tab
    return
  }
  return router.push(tabRoute(entry))
}

const onEntryClick = (event, entry) => {
  if (noRoute) {
    event.preventDefault()
    selectTab(entry)
  }
}

const currentTabIndex = computed(() => {
  return tabs.findIndex((entry) => {
    return entry.tab === tab.value
  })
})

// We must close the current document on "escape" key press only if we are in list view (ie. not in a modal)
wheneverRouteActionShortcut('back', () => !modal && router.push(searchRouteWithoutRefresh.value))

const previousTabIndex = computed(() => (currentTabIndex.value || tabs.length) - (1 % tabs.length))
wheneverRouteActionShortcut('goToPreviousTab', () => selectTab(tabs[previousTabIndex.value]))

const nextTabIndex = computed(() => (currentTabIndex.value + 1) % tabs.length)
wheneverRouteActionShortcut('goToNextTab', () => selectTab(tabs[nextTabIndex.value]))
</script>

<template>
  <tab-group-navigation
    class="pb-0"
    nowrap
  >
    <hook
      name="document-view-tabs:before"
      :bind="{ tab, tabs }"
    />
    <tab-group-navigation-entry
      v-for="entry in tabs"
      :key="entry.title"
      :icon="entry.icon"
      :to="entryRoute(entry)"
      :active="entry.tab === tab"
      manual
      @click="onEntryClick($event, entry)"
    >
      {{ entry.title }}
    </tab-group-navigation-entry>
    <hook
      name="document-view-tabs:after"
      :bind="{ tab, tabs }"
    />
  </tab-group-navigation>
</template>
