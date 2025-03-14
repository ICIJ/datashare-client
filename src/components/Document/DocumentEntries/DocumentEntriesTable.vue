<script setup>
import { property } from 'lodash'
import { computed } from 'vue'

import DocumentEntriesTableBody from './DocumentEntriesTableBody'
import DocumentEntriesTableHead from './DocumentEntriesTableHead'

import AppModal from '@/components/AppModal/AppModal'
import DocumentFloating from '@/components/Document/DocumentFloating'
import PageTable from '@/components/PageTable/PageTable'
import { useSearchProperties } from '@/composables/search-properties'
import { useDocument } from '@/composables/document'
import { useSearchFilter } from '@/composables/search-filter'

const sort = defineModel('sort', { type: String, default: null })
const order = defineModel('order', { type: String, default: 'desc' })
const selection = defineModel('selection', { type: Array, default: () => [] })

const props = defineProps({
  entries: {
    type: Array
  },
  selectMode: {
    type: Boolean,
    default: false
  },
  compactBreakpoint: {
    type: String,
    default: 'md'
  },
  properties: {
    type: Array,
    default: () => ['title']
  }
})

const { refreshRoute: refreshSearchRoute } = useSearchFilter()

const { documentRoute } = useDocument()
const showDocument = computed(() => !!documentRoute.value)

const { fields } = useSearchProperties()

const visibleFields = computed(() => {
  return fields.filter((field) => {
    return field.required || props.properties.includes(field.key)
  })
})

const visibleFieldsKeys = computed(() => visibleFields.value.map(property('key')))
</script>

<template>
  <div class="document-entries-table">
    <div class="document-entries-table__header">
      <slot name="header" />
    </div>
    <page-table v-model:sort="sort" v-model:order="order" :select-mode="selectMode">
      <template #colgroup>
        <col v-if="selectMode" style="width: 3rem" />
      </template>
      <template #thead>
        <document-entries-table-head
          :compact-breakpoint="compactBreakpoint"
          :select-mode="selectMode"
          :properties="visibleFieldsKeys"
        />
      </template>
      <document-entries-table-body
        v-model:selection="selection"
        :compact-breakpoint="compactBreakpoint"
        :entries="entries"
        :properties="visibleFieldsKeys"
        :select-mode="selectMode"
      />
    </page-table>
    <app-modal
      :model-value="showDocument"
      body-class="py-0 px-5"
      no-footer
      no-header
      fullscreen
      lazy
      @hide="refreshSearchRoute"
    >
      <document-floating class="my-3">
        <slot name="carousel" />
        <slot />
      </document-floating>
    </app-modal>
  </div>
</template>

<style lang="scss" scoped>
.document-entries-table {
  position: relative;

  &__header {
    background: var(--bs-body-bg);
    position: sticky;
    top: 0;
    z-index: 10;
    min-width: 0;
    max-width: 100%;
    width: 100%;
  }
}
</style>
