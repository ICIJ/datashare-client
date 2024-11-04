<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import DocumentEntriesTableBody from './DocumentEntriesTableBody'
import DocumentEntriesTableHead from './DocumentEntriesTableHead'

import AppModal from '@/components/AppModal/AppModal'
import PageTable from '@/components/PageTable/PageTable'
import { useSearchSettings } from '@/composables/search-settings'

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

const { propertiesOrder } = useSearchSettings()

const sortedProperties = computed(() => {
  return propertiesOrder.filter((property) => {
    return props.properties.includes(property)
  })
})

const route = useRoute()
const router = useRouter()

const showDocument = computed(() => route.name === 'document')
const onHideDocument = () => router.push({ name: 'search' })
</script>

<template>
  <div class="document-entries-table">
    <div class="document-entries-table__header py-3">
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
          :properties="sortedProperties"
        />
      </template>
      <document-entries-table-body
        v-model:selection="selection"
        :compact-breakpoint="compactBreakpoint"
        :entries="entries"
        :properties="sortedProperties"
        :select-mode="selectMode"
      />
    </page-table>
    <app-modal v-model="showDocument" size="xl" hide-footer @hide="onHideDocument">
      <slot />
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
