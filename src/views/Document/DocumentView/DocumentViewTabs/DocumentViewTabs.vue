<script setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

import TabGroupNavigation from '@/components/TabGroup/TabGroupNavigation/TabGroupNavigation'
import TabGroupNavigationEntry from '@/components/TabGroup/TabGroupNavigation/TabGroupNavigationEntry'
const props = defineProps({
  documentRoute: { type: Object }
})
const { t } = useI18n()
const tc = (key) => computed(() => t(key))
const entries = [
  {
    title: tc('documentViewTabs.text'),
    icon: 'text-align-left',
    to: { name: `${props.documentRoute.name}.text` }
  },
  {
    title: tc('documentViewTabs.viewer'),
    icon: 'file',
    to: { name: `${props.documentRoute.name}.viewer` }
  },
  {
    title: tc('documentViewTabs.metadata'),
    icon: 'info',
    to: { name: `${props.documentRoute.name}.metadata` }
  },
  {
    title: tc('documentViewTabs.entities'),
    icon: 'users-three',
    to: { name: `${props.documentRoute.name}.entities` }
  }
]
</script>

<template>
  <tab-group-navigation nowrap>
    <tab-group-navigation-entry v-for="entry in entries" :key="entry.title" lazy :icon="entry.icon" :to="entry.to">
      {{ entry.title }}
    </tab-group-navigation-entry>
  </tab-group-navigation>
</template>
