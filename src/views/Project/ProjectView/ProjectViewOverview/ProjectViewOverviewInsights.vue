<script setup>
import ProjectViewOverviewWidgets from './ProjectViewOverviewWidgets'

defineProps({
  name: {
    type: String
  }
})
</script>

<template>
  <div class="project-view-overview-insights">
    <project-view-overview-widgets :name="name" />
  </div>
</template>
