<script setup>
import { computed } from 'vue'

import ProjectRowActions from './ProjectRowActions'
import ProjectRowLabel from './ProjectRowLabel'
import ProjectRowLinks from './ProjectRowLinks'
import ProjectRowDescription from './ProjectRowDescription'
import ProjectRowDocumentsCount from './ProjectRowDocumentsCount'
import ProjectRowUpdateDate from './ProjectRowUpdateDate'

import PageTableTr from '@/components/PageTable/PageTableTr'
import { useBreakpoints } from '@/composables/useBreakpoints'
import ModeServerOnly from '@/components/Mode/ModeServerOnly'
import ProjectRowUserRoles from '@/components/Project/ProjectRow/ProjectRowUserRoles'

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

const compact = computed(() => breakpointDown.value[props.compactBreakpoint])
</script>

<template>
  <page-table-tr class="project-card-row">
    <project-row-label :project="project" />
    <project-row-description
      v-if="!compact"
      :project="project"
    />
    <project-row-documents-count :project="project" />
    <project-row-update-date :project="project" />
    <mode-server-only>
      <project-row-user-roles :project="project" />
    </mode-server-only>
    <project-row-links
      :project="project"
      :compact-breakpoint="compactBreakpoint"
    />
    <project-row-actions :project="project" />
  </page-table-tr>
</template>
