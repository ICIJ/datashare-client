<script setup>
import PageHeader from '@/components/PageHeader/PageHeader'

defineProps({
  name: {
    type: String
  }
})
</script>

<template>
  <div class="project-view">
    <page-header no-toggle-settings />
    <router-view />
  </div>
</template>
