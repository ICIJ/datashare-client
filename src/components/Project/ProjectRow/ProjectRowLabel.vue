<script setup>
import ProjectRowThumbnail from './ProjectRowThumbnail'

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
  <td class="project-row-label">
    <hook
      name="project-row-label:before"
      :bind="{ project }"
    />
    <div class="d-flex gap-3 align-items-middle">
      <project-row-thumbnail
        :project="project"
        rounded
        class="flex-shrink-0 d-flex"
      />
      <project-link
        :project="project"
        hide-thumbnail
        class="fw-medium"
      />
    </div>
    <hook
      name="project-row-label:after"
      :bind="{ project }"
    />
  </td>
</template>
