<script setup>
import ProjectRow from '@/components/Project/ProjectRow/ProjectRow'

defineProps({
  projects: {
    type: Array
  },
  compactBreakpoint: {
    type: String,
    default: 'md'
  }
})
</script>

<template>
  <project-row
    v-for="project in projects"
    :key="project.name"
    :project="project"
    :compact-breakpoint="compactBreakpoint"
  />
</template>
