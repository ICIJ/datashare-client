<script setup>
import ProjectCardUpdateDate from './ProjectCardUpdateDate'
import ProjectCardDescription from './ProjectCardDescription'
import ProjectCardDocumentsCount from './ProjectCardDocumentsCount'
import ProjectCardFooter from './ProjectCardFooter'
import ProjectCardLabel from './ProjectCardLabel'
import ProjectCardThumbnail from './ProjectCardThumbnail'

defineProps({
  project: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div class="project-card border rounded p-4 d-flex gap-3">
    <project-card-thumbnail :project="project" class="flex-grow-1">
      <slot name="thumbnail" />
    </project-card-thumbnail>
    <div class="d-flex flex-column gap-4 h-100 w-100 flex-truncate">
      <div>
        <project-card-label :project="project" class="mb-2">
          <slot name="label" />
        </project-card-label>
        <project-card-description :project="project">
          <slot name="description" />
        </project-card-description>
      </div>
      <div class="d-flex flex-lg-row flex-column lh-lg-1 mt-auto">
        <project-card-update-date :project="project">
          <slot name="update-date" />
        </project-card-update-date>
        <project-card-documents-count :project="project" class="ms-lg-auto">
          <slot name="documents-count" />
        </project-card-documents-count>
      </div>
      <project-card-footer :project="project">
        <slot name="footer" />
      </project-card-footer>
    </div>
  </div>
</template>
