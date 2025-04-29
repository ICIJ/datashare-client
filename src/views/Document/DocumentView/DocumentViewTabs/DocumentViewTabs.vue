<script setup>
import { computed, inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import Hook from '@/components/Hook/Hook'
import TabGroupNavigation from '@/components/TabGroup/TabGroupNavigation/TabGroupNavigation'
import TabGroupNavigationEntry from '@/components/TabGroup/TabGroupNavigation/TabGroupNavigationEntry'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
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
const { wheneverActionShortcut } = useKeyboardShortcuts()

const modal = inject('modal', undefined)
const tab = computed(() => route?.query?.tab || appStore.getSettings('documentView', 'tab'))

const currentTabIndex = computed(() => {
  return tabs.findIndex((entry) => {
    return entry.tab === tab.value
  })
})

const previousTabIndex = computed(() => (currentTabIndex.value || tabs.length) - (1 % tabs.length))
const previousTabRoute = computed(() => {
  const { tab } = tabs[previousTabIndex.value]
  const query = { tab, modal }
  return { query }
})
wheneverActionShortcut('goToPreviousTab', () => router.push(previousTabRoute.value))

const nextTabIndex = computed(() => (currentTabIndex.value + 1) % tabs.length)
const nextTabRoute = computed(() => {
  const { tab } = tabs[nextTabIndex.value]
  const query = { tab, modal }
  return { query }
})
wheneverActionShortcut('goToNextTab', () => router.push(nextTabRoute.value))
</script>

<template>
  <tab-group-navigation nowrap>
    <hook name="document-view-tabs:before" :bind="{ tab, tabs }" />
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
    <hook name="document-view-tabs:after" :bind="{ tab, tabs }" />
  </tab-group-navigation>
</template>
