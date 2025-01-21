<script setup>
import ProjectLabel from '@/components/Project/ProjectLabel'

defineProps({
  value: {
    type: String
  }
})
</script>

<template>
  <project-label :project="value" hide-thumbnail />
</template>
