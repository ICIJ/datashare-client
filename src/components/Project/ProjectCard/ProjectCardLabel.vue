<script setup>
import Hook from '@/components/Hook/Hook'
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
    <hook name="project-card-label:before" :bind="{ project }" />
    <project-link :project="project" hide-thumbnail />
    <hook name="project-card-label:after" :bind="{ project }" />
  </h3>
</template>

<style scoped>
.project-card-label {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}
</style>
