<script setup>
defineProps({
  project: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <td class="project-row-description">
    <slot>{{ project.description }}</slot>
  </td>
</template>
