<script setup>
import ProjectRow from '@/components/Project/ProjectRow/ProjectRow'
import ProjectRowPlaceholder from '@/components/Project/ProjectRow/ProjectRowPlaceholder'

defineProps({
  projects: {
    type: Array
  },
  compactBreakpoint: {
    type: String,
    default: 'md'
  },
  loading: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <template v-if="loading">
    <project-row-placeholder :repeat="Math.max(1, projects.length)" />
  </template>
  <template v-else>
    <project-row
      v-for="project in projects"
      :key="project.name"
      :project="project"
      :loading="loading"
      :compact-breakpoint="compactBreakpoint"
    />
  </template>
</template>
