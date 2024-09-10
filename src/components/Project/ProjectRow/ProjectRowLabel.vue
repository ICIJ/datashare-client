<script setup>
import ProjectRowThumbnail from './ProjectRowThumbnail'

import ProjectLink from '@/components/Project/ProjectLink'

defineProps({
  project: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <td class="project-row-label">
    <div class="d-flex gap-3 align-items-middle">
      <project-row-thumbnail :project="project" rounded class="flex-shrink-0" />
      <project-link :project="project" hide-thumbnail class="fw-medium" />
    </div>
  </td>
</template>
