<script setup>
import ProjectRow from '@/components/Project/ProjectRow/ProjectRow'

defineProps({
  projects: {
    type: Array
  }
})
</script>
<template>
  <project-row v-for="project in projects" :key="project.name" :project="project" />
</template>
