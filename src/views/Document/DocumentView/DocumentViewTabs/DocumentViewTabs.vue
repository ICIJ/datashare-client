<script setup>
import { useI18n } from 'vue-i18n'
import { computed, inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import TabGroupNavigation from '@/components/TabGroup/TabGroupNavigation/TabGroupNavigation'
import TabGroupNavigationEntry from '@/components/TabGroup/TabGroupNavigation/TabGroupNavigationEntry'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'

const props = defineProps({
  documentRoute: {
    type: Object
  }
})

const modal = inject('modal', undefined)

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const { wheneverActionShortcut } = useKeyboardShortcuts()

const currentTabIndex = computed(() => entries.value.findIndex(({ to: { name } }) => name === route.name))

const previousTabIndex = computed(() => (currentTabIndex.value || entries.value.length) - (1 % entries.value.length))
const previousTabRoute = computed(() => entries.value[previousTabIndex.value].to)
wheneverActionShortcut('goToPreviousTab', () => router.push(previousTabRoute.value))

const nextTabIndex = computed(() => (currentTabIndex.value + 1) % entries.value.length)
const nextTabRoute = computed(() => entries.value[nextTabIndex.value].to)
wheneverActionShortcut('goToNextTab', () => router.push(nextTabRoute.value))

const entries = computed(() => {
  const query = { modal }

  return [
    {
      title: t('documentViewTabs.text'),
      icon: 'text-align-left',
      to: {
        query,
        name: t(`${props.documentRoute.name}.text`)
      }
    },
    {
      title: t('documentViewTabs.viewer'),
      icon: 'file',
      to: {
        query,
        name: t(`${props.documentRoute.name}.viewer`)
      }
    },
    {
      title: t('documentViewTabs.metadata'),
      icon: 'info',
      to: {
        query,
        name: t(`${props.documentRoute.name}.metadata`)
      }
    },
    {
      title: t('documentViewTabs.entities'),
      icon: 'users-three',
      to: {
        query,
        name: t(`${props.documentRoute.name}.entities`)
      }
    }
  ]
})
</script>

<template>
  <tab-group-navigation nowrap>
    <tab-group-navigation-entry v-for="entry in entries" :key="entry.title" lazy :icon="entry.icon" :to="entry.to">
      {{ entry.title }}
    </tab-group-navigation-entry>
  </tab-group-navigation>
</template>
