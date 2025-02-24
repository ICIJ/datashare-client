<script setup>
import { computed } from 'vue'
import { isString } from 'lodash'

import ProjectLink from '@/components/Project/ProjectLink'
const props = defineProps({
  values: {
    type: [Array, String],
    default: () => []
  }
})
const projectList = computed(() => {
  return isString(props.values) ? [props.values] : props.values
})
</script>

<template>
  <div class="d-flex gap-3">
    <project-link v-for="(project, index) in projectList" :key="index" :project="project" />
  </div>
</template>
