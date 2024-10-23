<script setup>
import { computed } from 'vue'

import ProjectRowLabel from './ProjectRowLabel'
import ProjectRowDescription from './ProjectRowDescription'
import ProjectRowDocumentsCount from './ProjectRowDocumentsCount'
import ProjectRowUpdateDate from './ProjectRowUpdateDate'

import PageTableTr from '@/components/PageTable/PageTableTr'
import { useBreakpoints } from '@/composables/breakpoints'

const { breakpointDown } = useBreakpoints()

const props = defineProps({
  project: {
    type: Object,
    required: true
  },
  compactBreakpoint: {
    type: String,
    default: 'md'
  }
})

const compact = computed(() => {
  return breakpointDown.value[props.compactBreakpoint]
})
</script>

<template>
  <page-table-tr class="project-card-row">
    <project-row-label :project="project" />
    <project-row-description v-if="!compact" :project="project" />
    <project-row-documents-count :project="project" />
    <project-row-update-date :project="project" />
    <project-row-links :project="project" :compact-breakpoint="compactBreakpoint" />
    <project-row-actions :project="project" />
  </page-table-tr>
</template>
