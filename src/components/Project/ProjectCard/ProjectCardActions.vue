<script setup>
import Hook from '@/components/Hook/Hook'
import ProjectActions from '@/components/Project/ProjectActions'

defineProps({
  project: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div class="project-actions">
    <hook name="project-card-actions:before" :bind="{ project }" />
    <project-actions :project="project" />
    <hook name="project-card-actions:after" :bind="{ project }" />
  </div>
</template>
