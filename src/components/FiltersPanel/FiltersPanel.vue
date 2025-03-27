<script setup>
import { computed, watch } from 'vue'

import FiltersPanelToggler from '@/components/FiltersPanel/FiltersPanelToggler'
import FiltersPanelSearch from '@/components/FiltersPanel/FiltersPanelSearch'
import { useBreakpoints } from '@/composables/useBreakpoints'
import { SIZE } from '@/enums/sizes'
import { useAppStore } from '@/store/modules'

const q = defineModel('q', { type: String, default: '' })

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

const appStore = useAppStore()
const { breakpointDown } = useBreakpoints()

const closed = computed({
  get: () => appStore.filters.closed,
  set: (value) => (appStore.filters.closed = value)
})

const fullWidth = computed(() => {
  return breakpointDown.value[SIZE.MD]
})

const classList = computed(() => {
  return {
    'filters-panel--sticky': sticky,
    'filters-panel--closed': closed.value,
    'filters-panel--full-width': fullWidth.value
  }
})

// This ensure that when passing in full width, the panel is closed
watch(fullWidth, (value) => value && (closed.value = true), { immediate: true })
</script>

<template>
  <div class="filters-panel" :class="classList">
    <filters-panel-toggler v-if="!noToggler" class="filters-panel__toggler" @close="emit('close')" />
    <filters-panel-search v-if="!noSearch" v-model="q" class="filters-panel__search" />
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

  &--full-width {
    max-width: min(100%, 100vw);
    width: 100%;
    position: fixed;
    z-index: $zindex-sticky;
    right: 0;
    left: 0;
    bottom: 0;

    .filters-panel__search {
      width: 100%;
    }
  }
}
</style>
