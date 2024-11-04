<script setup>
import TabGroupNavigation from '@/components/TabGroup/TabGroupNavigation/TabGroupNavigation'
import TabGroupNavigationEntry from '@/components/TabGroup/TabGroupNavigation/TabGroupNavigationEntry'

defineProps({
  document: {
    type: Object,
    required: true
  },
  base: {
    type: String,
    default: 'document'
  }
})
</script>

<template>
  <tab-group-navigation nowrap flush>
    <tab-group-navigation-entry icon="text-align-left" :to="{ name: `${base}.text` }">
      {{ $t('documentViewTabs.text') }}
    </tab-group-navigation-entry>
    <tab-group-navigation-entry icon="file" :to="{ name: `${base}.viewer` }">
      {{ $t('documentViewTabs.viewer') }}
    </tab-group-navigation-entry>
    <tab-group-navigation-entry icon="info" :to="{ name: `${base}.metadata` }">
      {{ $t('documentViewTabs.metadata') }}
    </tab-group-navigation-entry>
    <tab-group-navigation-entry icon="users-three" :to="{ name: `${base}.entities` }">
      {{ $t('documentViewTabs.entities') }}
    </tab-group-navigation-entry>
  </tab-group-navigation>
</template>
