<script setup>
import { computed, inject } from 'vue'
import { PhosphorIcon } from '@icij/murmur-next'

import PageTableThSort from './PageTableThSort'

const props = defineProps({
  name: {
    type: String
  },
  label: {
    type: String,
    required: true
  },
  icon: {
    type: [String, Object, Array]
  },
  emphasis: {
    type: Boolean
  },
  number: {
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
    type: String
  }
})

const sortBy = inject('sortBy')

const isSorted = computed(() => {
  return props.sorted || (props.name && sortBy() === props.name)
})

const orderBy = inject('orderBy')

const classList = computed(() => {
  return {
    'page-table-th--emphasis': props.emphasis,
    'page-table-th--hide-label': props.hideLabel,
    'page-table-th--compact': props.compact,
    'page-table-th--sortable': props.sortable,
    'page-table-th--sorted': isSorted.value,
    'page-table-th--number': props.number
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
      <span class="page-table-th__content">
        <phosphor-icon v-if="icon" :name="icon" class="me-1 my-2" />
        <span :class="labelClassList">{{ label }}</span>
        <page-table-th-sort
          v-if="sortable"
          class="ms-1"
          :sorted="isSorted"
          :order="order ?? orderBy()"
          @update:sorted="sortBy(name)"
          @update:order="orderBy($event)"
        />
      </span>
    </slot>
  </b-th>
</template>

<style lang="scss" scoped>
.page-table-th {
  vertical-align: middle;

  &--compact {
    width: 2rem;
  }

  &--sorted.page-table-th--sortable {
    color: var(--bs-action-text-emphasis);
  }

  &__content {
    display: flex;
    justify-content: start;
    align-items: center;
  }

  &--number &__content {
    justify-content: end;
  }
}
</style>
