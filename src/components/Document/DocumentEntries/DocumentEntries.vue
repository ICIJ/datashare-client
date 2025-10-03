<script setup>
import { pickBy } from 'lodash'
import { computed } from 'vue'

import DocumentEntriesHeader from './DocumentEntriesHeader'
import DocumentEntriesList from './DocumentEntriesList'
import DocumentEntriesGrid from './DocumentEntriesGrid'
import DocumentEntriesTable from './DocumentEntriesTable'

import { LAYOUTS, layoutValidator } from '@/enums/layouts'
import { DISPLAY, displayValidator } from '@/enums/documentFloating'

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
  display: {
    type: String,
    default: DISPLAY.BOTH,
    validator: displayValidator
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
  },
  hideHeader: {
    type: Boolean,
    default: false
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
  <component
    :is="component"
    v-bind="componentProps"
    v-model:selection="selection"
  >
    <slot />
    <template
      v-if="!hideHeader"
      #header
    >
      <document-entries-header
        v-model:select-mode="selectMode"
        v-model:page="page"
        :total="total"
        :per-page="perPage"
      >
        <template #default="{ compact }">
          <slot
            name="header"
            v-bind="{ compact }"
          />
        </template>
      </document-entries-header>
    </template>
    <template #floating>
      <slot name="floating" />
    </template>
  </component>
</template>
