<script setup>
import ProjectActions from '@/components/Project/ProjectActions'

defineProps({
  project: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <td class="project-row-actions">
    <project-actions :project="project" />
  </td>
</template>
