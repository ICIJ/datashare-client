<script setup>
import { computed } from 'vue'

import ProjectEntriesCards from './ProjectEntriesCards'
import ProjectEntriesTable from './ProjectEntriesTable'

import { LAYOUTS, layoutValidator } from '@/enums/layouts'

const props = defineProps({
  projects: {
    type: Array
  },
  layout: {
    type: String,
    validator: layoutValidator,
    default: LAYOUTS.CARDS
  }
})

const is = computed(() => {
  return props.layout === LAYOUTS.CARDS ? ProjectEntriesCards : ProjectEntriesTable
})
</script>

<template>
  <div class="project-entries">
    <component :is="is" :projects="projects" />
  </div>
</template>
