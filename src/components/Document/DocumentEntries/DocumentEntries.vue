<script setup>
import { pickBy } from 'lodash'
import { computed } from 'vue'

import DocumentEntriesHeader from './DocumentEntriesHeader'
import DocumentEntriesList from './DocumentEntriesList'
import DocumentEntriesGrid from './DocumentEntriesGrid'
import DocumentEntriesTable from './DocumentEntriesTable'

import { LAYOUTS, layoutValidator } from '@/enums/layouts'

const selectMode = defineModel('selectMode', { type: Boolean, default: false })
const selection = defineModel('selection', { type: Array, default: () => [] })
const page = defineModel('page', { type: Number, default: 1 })

const props = defineProps({
  entries: {
    type: Array
  },
  layout: {
    type: String,
    validator: layoutValidator,
    default: LAYOUTS.LIST
  },
  perPage: {
    type: Number,
    default: 25
  },
  total: {
    type: Number,
    default: 0
  },
  properties: {
    type: Array,
    default: () => ['title']
  },
  loading: {
    type: Boolean
  }
})

const component = computed(() => {
  const layouts = {
    [LAYOUTS.LIST]: DocumentEntriesList,
    [LAYOUTS.GRID]: DocumentEntriesGrid,
    [LAYOUTS.TABLE]: DocumentEntriesTable
  }

  return layouts[props.layout]
})

const componentProps = computed(() => {
  return pickBy({ ...props, selectMode: selectMode.value }, (value, name) => {
    return name in component.value.props
  })
})
</script>

<template>
  <component :is="component" v-model:selection="selection" v-bind="componentProps" class="document-entries">
    <slot />
    <template #header>
      <document-entries-header
        v-model:select-mode="selectMode"
        v-model:page="page"
        :total="total"
        :per-page="perPage"
        :loading="loading"
      >
        <slot name="header" />
      </document-entries-header>
    </template>
  </component>
</template>
