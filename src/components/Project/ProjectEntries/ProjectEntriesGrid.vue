<script setup>
import ProjectCard from '@/components/Project/ProjectCard/ProjectCard'

defineProps({
  projects: {
    type: Array
  }
})
</script>

<template>
  <div class="project-entries-grid container-fluid">
    <div class="row g-4">
      <div v-for="project in projects" :key="project.name" class="col-12 col-lg-6 col-xxl-4">
        <project-card :project="project" class="h-100" />
      </div>
    </div>
  </div>
</template>
