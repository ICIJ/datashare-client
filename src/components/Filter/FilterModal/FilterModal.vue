<script setup>
import { computed } from 'vue'

import FilterModalTitle from './FilterModalTitle'

import AppModal from '@/components/AppModal/AppModal'
import { useSearchFilter } from '@/composables/useSearchFilter'

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
  },
  hideCount: {
    type: Boolean
  }
})

const hasExpandModal = computed(() => !modal && !filter.hideExpand)
</script>

<template>
  <app-modal
    v-if="hasExpandModal"
    v-model="modelValue"
    lazy
    size="lg"
    no-footer
    header-close-class="d-none"
    title-class="flex-grow-1"
    body-class="py-0"
  >
    <template #title>
      <filter-modal-title
        v-model:sort="sort"
        :filter="filter"
      />
    </template>
    <component
      :is="getFilterComponent(filter)"
      :filter="filter"
      :hide-count="hideCount"
      modal
    />
  </app-modal>
</template>
