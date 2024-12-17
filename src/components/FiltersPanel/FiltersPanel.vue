<script setup>
import { computed } from 'vue'

import FiltersPanelToggler from '@/components/FiltersPanel/FiltersPanelToggler'
import FiltersPanelSearch from '@/components/FiltersPanel/FiltersPanelSearch'

const { sticky } = defineProps({
  noToggler: {
    type: Boolean,
    default: false
  },
  noSearch: {
    type: Boolean,
    default: false
  },
  sticky: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])
const classList = computed(() => ({ 'filters-panel--sticky': sticky }))
</script>

<template>
  <div class="filters-panel" :class="classList">
    <filters-panel-toggler v-if="!noToggler" @close="emit('close')" />
    <filters-panel-search v-if="!noSearch" />
    <slot />
  </div>
</template>

<style scoped lang="scss">
.filters-panel {
  padding: $spacer;
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: $spacer-xl;
  background: var(--bs-tertiary-bg-subtle);
  max-width: 320px;
  width: 100%;

  &--sticky {
    position: sticky;
    top: 0;
    overflow: auto;
    height: 100vh;
  }
}
</style>
