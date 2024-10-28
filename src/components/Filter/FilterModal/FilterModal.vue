<script setup>
import { computed } from 'vue'

import FilterModalTitle from './FilterModalTitle'

import { useSearchFilter } from '@/composables/search-filter'

const { getFilterComponent } = useSearchFilter()

const modelValue = defineModel({ type: Boolean })
const sort = defineModel('sort', { type: Object })

const { filter, modal } = defineProps({
  filter: {
    type: Object,
    required: true
  },
  modal: {
    type: Boolean
  }
})

const hasExpandModal = computed(() => !modal && !filter.hideExpand)
</script>

<template>
  <b-modal v-if="hasExpandModal" v-model="modelValue" size="lg" hide-footer title-class="flex-grow-1">
    <template #title>
      <filter-modal-title v-model:sort="sort" :filter="filter" />
    </template>
    <component :is="getFilterComponent(filter)" :filter="filter" modal />
  </b-modal>
</template>
