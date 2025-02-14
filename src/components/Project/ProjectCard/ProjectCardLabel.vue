<script setup>
import ProjectLink from '@/components/Project/ProjectLink'

defineProps({
  project: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <h3 class="project-card-label text-dark-emphasis">
    <project-link :project="project" hide-thumbnail />
  </h3>
</template>

<style scoped>
.project-card-label {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}
</style>
