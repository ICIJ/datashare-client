<script setup>
import { computed } from 'vue'

import IconButton from '@/components/IconButton'

const props = defineProps({
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
    'page-table-th-sort--sorted': props.sorted
  }
})

const icon = computed(() => {
  return props.order === 'desc' ? `sort-descending` : 'sort-ascending'
})
</script>

<template>
  <icon-button
    variant="outline-light"
    class="page-table-th-sort"
    :class="classList"
    :icon-left="icon"
    icon-left-size="1em"
    hide-label
  />
</template>

<style lang="scss" scoped>
.page-table-th-sort {
  --bs-border-width: 0;
  --bs-btn-padding-x: #{$spacer-xxs};
  --bs-btn-padding-y: #{$spacer-xxs};
  --bs-btn-color: var(--bs-light);

  &--sorted {
    --bs-btn-color: var(--bs-body-color);
  }
}
</style>
