<script setup>
import ProjectLabel from '@/components/Project/ProjectLabel'

defineProps({
  project: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <h3 class="project-card-label text-dark-emphasis">
    <project-label :project="project" hide-thumbnail />
  </h3>
</template>

<style scoped>
.project-card-label {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}
</style>
