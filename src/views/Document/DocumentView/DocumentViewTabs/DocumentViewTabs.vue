<script setup>
import { useI18n } from 'vue-i18n'
import { computed, inject } from 'vue'

import TabGroupNavigation from '@/components/TabGroup/TabGroupNavigation/TabGroupNavigation'
import TabGroupNavigationEntry from '@/components/TabGroup/TabGroupNavigation/TabGroupNavigationEntry'

const props = defineProps({
  documentRoute: {
    type: Object
  }
})

const { t } = useI18n()

const modal = inject('modal', undefined)

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
