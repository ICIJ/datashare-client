<script setup>
import ProjectThumbnail from '@/components/Project/ProjectThumbnail'

defineProps({
  project: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div class="project-card-thumbnail">
    <project-thumbnail width="95px" :project="project" rounded />
  </div>
</template>
