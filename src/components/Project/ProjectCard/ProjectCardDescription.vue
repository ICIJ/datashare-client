<script setup>
import Hook from '@/components/Hook/Hook'

defineProps({
  project: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div class="project-card-description">
    <hook name="project-card-description:before" :bind="{ project }" />
    {{ project.description }}
    <hook name="project-card-description:after" :bind="{ project }" />
  </div>
</template>

<style scoped>
.project-card-description {
  min-height: 60px;
}
</style>
