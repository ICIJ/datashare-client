<script setup>
import { computed } from 'vue'

defineOptions({
  name: 'SearchBreadcrumbEntryQueryTerm'
})

const props = defineProps({
  term: {
    type: String
  },
  prefix: {
    type: String,
    default: null
  },
  icon: {
    type: String,
    default: 'magnifying-glass'
  },
  color: {
    type: String,
    default: null
  }
})

const classList = computed(() => {
  return {
    'search-breadcrumb-entry-query-term--negative': props.prefix === '-'
  }
})

const style = computed(() => {
  return {
    '--color': props.color
  }
})
</script>

<template>
  <icon-button
    variant="outline-primary"
    class="search-breadcrumb-entry-query-term me-2"
    :class="classList"
    :style="style"
    :icon-left="icon"
    icon-right="x"
  >
    {{ term }}
  </icon-button>
</template>

<style lang="scss" scoped>
.search-breadcrumb-entry-query-term {
  border-style: dashed;
  border-color: var(--color, currentColor);

  &:not(:hover) {
    color: var(--bs-body-color);
    background: var(--bs-body-bg);
  }

  &--negative {
    text-decoration: line-through;
  }

  &:deep(.icon-button__icon-left) {
    color: var(--color, currentColor);
  }

  &:deep(.icon-button__icon-right) {
    color: var(--bs-light);
  }
}
</style>
