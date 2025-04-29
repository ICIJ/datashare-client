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
  <div class="project-view">
    <page-header no-toggle-settings />
    <page-container fluid>
      <router-view />
    </page-container>
  </div>
</template>
