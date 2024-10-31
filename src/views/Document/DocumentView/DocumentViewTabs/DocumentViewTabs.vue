<script setup>
import TabGroupNavigation from '@/components/TabGroup/TabGroupNavigation/TabGroupNavigation'
import TabGroupNavigationEntry from '@/components/TabGroup/TabGroupNavigation/TabGroupNavigationEntry'

defineProps({
  document: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <tab-group-navigation nowrap flush>
    <tab-group-navigation-entry icon="text-align-left" :to="{ name: 'document.text' }">
      {{ $t('documentViewTabs.text') }}
    </tab-group-navigation-entry>
    <tab-group-navigation-entry icon="file" :to="{ name: 'document.viewer' }">
      {{ $t('documentViewTabs.viewer') }}
    </tab-group-navigation-entry>
    <tab-group-navigation-entry icon="info" :to="{ name: 'document.metadata' }">
      {{ $t('documentViewTabs.metadata') }}
    </tab-group-navigation-entry>
    <tab-group-navigation-entry icon="users-three" :to="{ name: 'document.entities' }">
      {{ $t('documentViewTabs.entities') }}
    </tab-group-navigation-entry>
  </tab-group-navigation>
</template>
