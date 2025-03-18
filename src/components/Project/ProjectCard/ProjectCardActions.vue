<script setup>
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
    <project-actions :project="project" />
  </div>
</template>
