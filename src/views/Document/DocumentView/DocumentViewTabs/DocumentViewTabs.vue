<script setup>
import { computed, inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import Hook from '@/components/Hook/Hook'
import TabGroupNavigation from '@/components/TabGroup/TabGroupNavigation/TabGroupNavigation'
import TabGroupNavigationEntry from '@/components/TabGroup/TabGroupNavigation/TabGroupNavigationEntry'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import { useSearchNav } from '@/composables/useSearchNav'
import { useAppStore } from '@/store/modules'

const { tabs } = defineProps({
  tabs: {
    type: Array,
    default: () => []
  }
})

const appStore = useAppStore()
const router = useRouter()
const route = useRoute()
const { searchRoute } = useSearchNav()
const { wheneverRouteActionShortcut } = useKeyboardShortcuts()

const modal = inject('modal', undefined)
const tab = computed(() => route?.query?.tab || appStore.getSettings('documentView', 'tab'))
const tabRoute = ({ tab }) => ({ query: { tab, modal } })

const currentTabIndex = computed(() => {
  return tabs.findIndex((entry) => {
    return entry.tab === tab.value
  })
})

// We must close the current document on "escape" key press only if we are in list view (ie. not in a modal)
wheneverRouteActionShortcut('back', () => !modal && router.push(searchRoute.value))

const previousTabIndex = computed(() => (currentTabIndex.value || tabs.length) - (1 % tabs.length))
const previousTabRoute = computed(() => tabRoute(tabs[previousTabIndex.value]))
wheneverRouteActionShortcut('goToPreviousTab', () => router.push(previousTabRoute.value))

const nextTabIndex = computed(() => (currentTabIndex.value + 1) % tabs.length)
const nextTabRoute = computed(() => tabRoute(tabs[nextTabIndex.value]))
wheneverRouteActionShortcut('goToNextTab', () => router.push(nextTabRoute.value))
</script>

<template>
  <tab-group-navigation nowrap>
    <hook
      name="document-view-tabs:before"
      :bind="{ tab, tabs }"
    />
    <tab-group-navigation-entry
      v-for="entry in tabs"
      :key="entry.title"
      :icon="entry.icon"
      :to="{ query: { tab: entry.tab, modal } }"
      :active="entry.tab === tab"
      manual
    >
      {{ entry.title }}
    </tab-group-navigation-entry>
    <hook
      name="document-view-tabs:after"
      :bind="{ tab, tabs }"
    />
  </tab-group-navigation>
</template>
