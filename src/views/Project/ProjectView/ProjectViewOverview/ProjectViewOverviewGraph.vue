<script setup>
import ProjectViewOverviewWidgets from './ProjectViewOverviewWidgets'

defineProps({
  name: {
    type: String
  }
})
</script>

<template>
  <div class="project-view-overview-graph">
    <project-view-overview-widgets :name="name" section="graph" />
  </div>
</template>
