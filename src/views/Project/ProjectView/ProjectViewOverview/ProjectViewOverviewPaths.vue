<script setup>
import ProjectViewOverviewWidgets from './ProjectViewOverviewWidgets'

defineProps({
  name: {
    type: String
  }
})
</script>

<template>
  <div class="project-view-overview-paths">
    <project-view-overview-widgets
      :name="name"
      section="paths"
    />
  </div>
</template>
