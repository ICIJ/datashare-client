<script setup>
import Hook from '@/components/Hook/Hook'
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
    <hook
      name="project-row-actions:before"
      :bind="{ project }"
    />
    <project-actions :project="project" />
    <hook
      name="project-row-actions:after"
      :bind="{ project }"
    />
  </td>
</template>
