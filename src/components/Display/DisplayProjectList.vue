<script setup>
import ProjectsButton from '@/components/Project/ProjectsButton'

defineOptions({ name: 'DisplayProjectList' })

defineProps({
  values: {
    type: [Array, String],
    default: () => []
  }
})
</script>

<template>
  <projects-button :projects="values" />
</template>
