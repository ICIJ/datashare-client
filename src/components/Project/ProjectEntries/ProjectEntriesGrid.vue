<script setup>
import ProjectCard from '@/components/Project/ProjectCard/ProjectCard'
import ProjectCardPlaceholder from '@/components/Project/ProjectCard/ProjectCardPlaceholder'

defineProps({
  projects: {
    type: Array
  },
  loading: {
    type: Boolean
  }
})
</script>

<template>
  <div class="project-entries-grid">
    <div class="row g-4">
      <div v-for="i in Math.max(1, projects.length)" v-if="loading" :key="i" class="col-12 col-xl-6">
        <project-card-placeholder />
      </div>
      <div v-for="project in projects" v-else :key="project.name" class="col-12 col-xl-6">
        <project-card :project="project" class="h-100" />
      </div>
    </div>
  </div>
</template>
