<script setup>
import { useDocument } from '@/composables/document'

import TabGroupNavigation from '@/components/TabGroup/TabGroupNavigation/TabGroupNavigation'
import TabGroupNavigationEntry from '@/components/TabGroup/TabGroupNavigation/TabGroupNavigationEntry'


const { documentRoute } = useDocument()
</script>

<template>
  <tab-group-navigation nowrap flush>
    <tab-group-navigation-entry icon="text-align-left" :to="{ name: `${documentRoute.name}.text` }">
      {{ $t('documentViewTabs.text') }}
    </tab-group-navigation-entry>
    <tab-group-navigation-entry icon="file" :to="{ name: `${documentRoute.name}.viewer` }">
      {{ $t('documentViewTabs.viewer') }}
    </tab-group-navigation-entry>
    <tab-group-navigation-entry icon="info" :to="{ name: `${documentRoute.name}.metadata` }">
      {{ $t('documentViewTabs.metadata') }}
    </tab-group-navigation-entry>
    <tab-group-navigation-entry icon="users-three" :to="{ name: `${documentRoute.name}.entities` }">
      {{ $t('documentViewTabs.entities') }}
    </tab-group-navigation-entry>
  </tab-group-navigation>
</template>
