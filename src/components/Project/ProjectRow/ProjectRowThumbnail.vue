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
  <div class="project-row-thumbnail">
    <project-thumbnail width="100%" :project="project" rounded />
  </div>
</template>

<style lang="scss">
.project-row-thumbnail {
  max-width: 50px;
  width: 100%;

  @include media-breakpoint-down(sm) {
    display: none;
  }
}
</style>
