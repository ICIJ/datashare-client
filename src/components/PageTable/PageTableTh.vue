<script setup>
import { computed } from 'vue'
import { PhosphorIcon } from '@icij/murmur-next'

import PageTableThSort from './PageTableThSort'

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  icon: {
    type: String
  },
  emphasis: {
    type: Boolean
  },
  hideLabel: {
    type: Boolean
  },
  compact: {
    type: Boolean
  },
  sortable: {
    type: Boolean
  },
  sorted: {
    type: Boolean
  },
  order: {
    type: String,
    default: 'desc'
  }
})

const classList = computed(() => {
  return {
    'page-table-th--emphasis': props.emphasis,
    'page-table-th--compact': props.hideLabel,
    'page-table-th--sortable': props.sortable,
    'page-table-th--sorted': props.sorted
  }
})

const labelClassList = computed(() => {
  return {
    'visually-hidden': props.hideLabel
  }
})
</script>

<template>
  <b-th class="page-table-th text-nowrap" :class="classList">
    <slot>
      <span class="d-flex align-items-center">
        <phosphor-icon v-if="icon" :name="icon" class="me-1 my-2" />
        <span :class="labelClassList">{{ label }}</span>
        <page-table-th-sort
          v-if="sortable"
          class="ms-1"
          :sorted="sorted"
          :order="order"
          @update:sorted="$emit('update:sorted', $event)"
          @update:order="$emit('update:order', $event)" />
      </span>
    </slot>
  </b-th>
</template>

<style lang="scss" scoped>
.page-table-th {
  vertical-align: $table-cell-vertical-align;

  &--compact {
    width: 2rem;
  }

  &--sorted.page-table-th--sortable {
    color: var(--bs-primary-text-emphasis);
  }
}
</style>
