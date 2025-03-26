<script setup>
import PageHeaderNav from '@/components/PageHeader/PageHeaderNav'
import PageContainer from '@/components/PageContainer/PageContainer'

defineProps({
  name: {
    type: String
  }
})
</script>

<template>
  <page-container fluid deck class="project-view">
    <page-header-nav no-toggle-settings />
    <router-view />
  </page-container>
</template>
