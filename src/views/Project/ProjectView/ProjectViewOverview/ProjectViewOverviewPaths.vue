<script setup>
import ProjectViewOverviewWidgets from './ProjectViewOverviewWidgets'

defineProps({
  name: {
    type: String
  }
})
</script>

<template>
  <div class="project-view-overview-path">
    <project-view-overview-widgets :name="name" section="path" />
  </div>
</template>
