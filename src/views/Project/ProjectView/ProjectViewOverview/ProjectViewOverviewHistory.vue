<script setup>
import ProjectViewOverviewWidgets from './ProjectViewOverviewWidgets'

defineProps({
  name: {
    type: String
  }
})
</script>

<template>
  <div class="project-view-overview-history">
    <project-view-overview-widgets
      :name="name"
      section="history"
    />
  </div>
</template>
