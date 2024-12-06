<script setup>
import { pickBy } from 'lodash'
import { computed } from 'vue'

import ProjectEntriesGrid from './ProjectEntriesGrid'
import ProjectEntriesTable from './ProjectEntriesTable'

import { LAYOUTS, layoutValidator } from '@/enums/layouts'

defineModel('sort', { type: String, default: null })
defineModel('order', { type: String, default: 'desc' })

const props = defineProps({
  projects: {
    type: Array
  },
  layout: {
    type: String,
    validator: layoutValidator,
    default: LAYOUTS.GRID
  }
})

const component = computed(() => {
  return props.layout === LAYOUTS.GRID ? ProjectEntriesGrid : ProjectEntriesTable
})

const componentProps = computed(() => {
  return pickBy(props, (value, name) => {
    return name in component.value.props
  })
})
</script>

<template>
  <component
    :is="component"
    v-bind="componentProps"
    class="project-entries"
    @update:order="$emit('update:order', $event)"
    @update:sort="$emit('update:sort', $event)"
  />
</template>
