<script setup>
defineProps({
  project: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div class="project-card-description">{{ project.description }}</div>
</template>

<style scoped>
.project-card-description {
  min-height: 60px;
}
</style>
