<script setup>
import ProjectLink from '@/components/Project/ProjectLink'
import ProjectThumbnail from '@/components/Project/ProjectThumbnail'

defineProps({
  project: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <project-link class="project-row-thumbnail d-block" :project="project">
    <project-thumbnail width="100%" :project="project" rounded />
  </project-link>
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
