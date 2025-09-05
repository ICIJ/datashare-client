<script setup>
import ProjectCardActions from './ProjectCardActions'
import ProjectCardDescription from './ProjectCardDescription'
import ProjectCardFooter from './ProjectCardFooter'
import ProjectCardLabel from './ProjectCardLabel'
import ProjectCardThumbnail from './ProjectCardThumbnail'

import Hook from '@/components/Hook/Hook'

defineProps({
  project: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div class="project-card border rounded p-4 d-flex gap-3">
    <hook
      name="project-card:before"
      :bind="{ project }"
    />
    <project-card-thumbnail
      :project="project"
      class="flex-grow-1"
    >
      <slot name="thumbnail" />
    </project-card-thumbnail>
    <div class="d-flex flex-column gap-4 h-100 w-100 flex-truncate">
      <div class="flex-grow-1">
        <div class="d-flex flex-column flex-sm-row justify-content-between mb-2 gap-2">
          <project-card-label :project="project">
            <slot name="label" />
          </project-card-label>
          <project-card-actions :project="project" />
        </div>
        <project-card-description :project="project">
          <slot name="description" />
        </project-card-description>
      </div>
      <project-card-footer :project="project">
        <slot name="footer" />
      </project-card-footer>
    </div>
    <hook
      name="project-card:after"
      :bind="{ project }"
    />
  </div>
</template>
