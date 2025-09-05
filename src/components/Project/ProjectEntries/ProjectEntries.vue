<script setup>
import { pickBy } from 'lodash'
import { computed } from 'vue'

import ProjectEntriesGrid from './ProjectEntriesGrid'
import ProjectEntriesTable from './ProjectEntriesTable'

import { LAYOUTS, layoutValidator } from '@/enums/layouts'

const sort = defineModel('sort', { type: String, default: null })
const order = defineModel('order', { type: String, default: 'desc' })

const props = defineProps({
  projects: {
    type: Array
  },
  layout: {
    type: String,
    validator: layoutValidator,
    default: LAYOUTS.GRID
  },
  loading: {
    type: Boolean,
    default: false
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
    @update:order="order = $event"
    @update:sort="sort = $event"
  />
</template>
