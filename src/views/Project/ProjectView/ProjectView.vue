<script setup>
import PageHeader from '@/components/PageHeader/PageHeader'
import PageContainer from '@/components/PageContainer/PageContainer'

defineProps({
  name: {
    type: String
  }
})
</script>

<template>
  <page-container fluid top class="project-view">
    <page-header no-toggle-settings />
    <router-view />
  </page-container>
</template>
