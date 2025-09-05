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
  <project-link
    class="project-card-thumbnail d-block"
    :project="project"
  >
    <project-thumbnail
      width="100%"
      :project="project"
      rounded
    />
  </project-link>
</template>

<style lang="scss">
.project-card-thumbnail {
  max-width: 90px;
  width: 100%;

  @include media-breakpoint-down(md) {
    max-width: 60px;
  }

  @include media-breakpoint-down(sm) {
    max-width: 40px;
  }
}
</style>
