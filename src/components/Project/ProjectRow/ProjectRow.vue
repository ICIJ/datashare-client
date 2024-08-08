<script setup>
import ProjectRowLabel from './ProjectRowLabel'
import ProjectRowDescription from './ProjectRowDescription'
import ProjectRowDocumentsCount from './ProjectRowDocumentsCount'
import ProjectRowUpdateDate from './ProjectRowUpdateDate'

import PageTableTr from '@/components/PageTable/PageTableTr'

defineProps({
  project: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <page-table-tr class="project-card-row">
    <project-row-label :project="project" />
    <project-row-description :project="project" />
    <project-row-documents-count :project="project" />
    <project-row-update-date :project="project" />
    <project-row-links :project="project" />
    <project-row-actions :project="project" />
  </page-table-tr>
</template>
