<script setup>
import { computed } from 'vue'
import { PhSortDescending, PhSortAscending } from '@phosphor-icons/vue'
import { ButtonIcon } from '@icij/murmur-next'

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
  return props.order === 'desc' ? PhSortAscending : PhSortDescending
})

const toggleOrder = () => {
  if (props.sorted) {
    emit('update:order', props.order === 'desc' ? 'asc' : 'desc')
  } else {
    emit('update:sorted', true)
  }
}
</script>

<template>
  <button-icon
    :icon-left="icon"
    :class="classList"
    class="page-table-th-sort"
    variant="outline-tertiary"
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
  --bs-btn-color: var(--bs-secondary-text-emphasis);

  visibility: hidden;

  &--sorted {
    --bs-btn-color: var(--bs-action-text-emphasis);
    --bs-btn-bg: var(--bs-action-bg-subtle);
  }

  &--sorted,
  .page-table-th:hover & {
    visibility: visible;
  }
}
</style>
