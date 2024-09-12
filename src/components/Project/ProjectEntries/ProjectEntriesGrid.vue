<script setup>
import ProjectCard from '@/components/Project/ProjectCard/ProjectCard'
import PageContainer from '@/components/PageContainer/PageContainer'

defineProps({
  projects: {
    type: Array
  }
})
</script>

<template>
  <page-container fluid class="project-entries-grid">
    <div class="row g-4">
      <div v-for="project in projects" :key="project.name" class="col-12 col-xl-6">
        <project-card :project="project" class="h-100" />
      </div>
    </div>
  </page-container>
</template>
