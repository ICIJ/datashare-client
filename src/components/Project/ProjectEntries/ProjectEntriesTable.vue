<script setup>
import { computed } from 'vue'

import ProjectEntriesTableHead from './ProjectEntriesTableHead'
import ProjectEntriesTableBody from './ProjectEntriesTableBody'

import PageContainer from '@/components/PageContainer/PageContainer'
import PageTable from '@/components/PageTable/PageTable'
import { useBreakpoints } from '@/composables/breakpoints'

const { breakpointDown } = useBreakpoints()
const sort = defineModel('sort', { type: String, default: null })
const order = defineModel('order', { type: String, default: 'desc' })

const props = defineProps({
  projects: {
    type: Array
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
  <page-container fluid class="project-entries-table">
    <page-table v-model:sort="sort" v-model:order="order">
      <template #colgroup>
        <col style="min-width: 200px" />
        <col v-if="!compact" style="min-width: 200px" />
      </template>
      <template #thead>
        <project-entries-table-head :compact-breakpoint="compactBreakpoint" />
      </template>
      <project-entries-table-body :compact-breakpoint="compactBreakpoint" :projects="projects" />
    </page-table>
  </page-container>
</template>
