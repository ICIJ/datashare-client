<script setup>
import ProjectButton from '@/components/Project/ProjectButton'

defineProps({
  document: {
    type: Object
  }
})
</script>

<template>
  <td>
    <project-button
      :project="document.project"
      no-search
      disabled
    />
  </td>
</template>
