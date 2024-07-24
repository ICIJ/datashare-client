<script setup>
import { computed } from 'vue'

import IconButton from '@/components/IconButton'

const emit = defineEmits(['update:sorted', 'update:order'])

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

const toggleOrder = () => {
  if (props.sorted) {
    console.log(props.order === 'desc' ? 'asc' : 'desc')
    emit('update:order', props.order === 'desc' ? 'asc' : 'desc')
  } else {
    emit('update:sorted', true)
  }
}
</script>

<template>
  <icon-button
    :icon-left="icon"
    :class="classList"
    class="page-table-th-sort"
    variant="outline-light"
    icon-left-size="1em"
    hide-label
    @click="toggleOrder"
  />
</template>

<style lang="scss" scoped>
.page-table-th-sort {
  --bs-border-width: 0;
  --bs-btn-padding-x: #{$spacer-xxs};
  --bs-btn-padding-y: #{$spacer-xxs};
  --bs-btn-color: var(--bs-light);

  visibility: hidden;

  &--sorted {
    --bs-btn-color: var(--bs-primary-text-emphasis);
    --bs-btn-bg: var(--bs-primary-bg-subtle);
  }

  &--sorted,
  .page-table-th:hover & {
    visibility: visible;
  }
}
</style>
