<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import PageHeader from '@/components/PageHeader/PageHeader'
import PageContainer from '@/components/PageContainer/PageContainer'

defineProps({
  name: {
    type: String
  }
})

const route = useRoute()

const hasRouteSettings = computed(() => {
  return route.meta?.settings !== false && route.matched.some(r => !!r.components?.settings)
})
</script>

<template>
  <div class="project-view">
    <page-header :no-toggle-settings="!hasRouteSettings" />
    <page-container fluid>
      <router-view />
    </page-container>
  </div>
</template>
