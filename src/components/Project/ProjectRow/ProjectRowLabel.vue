<script setup>
import ProjectRowThumbnail from './ProjectRowThumbnail'

import ProjectLabel from '@/components/Project/ProjectLabel'

defineProps({
  project: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <td class="project-row-label">
    <div class="d-flex gap-3 align-items-start">
      <project-row-thumbnail :project="project" rounded class="flex-shrink-0" />
      <project-label :project="project" hide-thumbnail class="fw-medium" />
    </div>
  </td>
</template>
