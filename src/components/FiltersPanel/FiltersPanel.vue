<script setup>
import { computed, watch } from 'vue'

import PageOffcanvasReplacement from '@/components/PageOffcanvas/PageOffcanvasReplacement'
import FiltersPanelToggler from '@/components/FiltersPanel/FiltersPanelToggler'
import FiltersPanelSearch from '@/components/FiltersPanel/FiltersPanelSearch'
import { useBreakpoints } from '@/composables/useBreakpoints'
import { SIZE } from '@/enums/sizes'
import { useAppStore } from '@/store/modules'

const q = defineModel('q', { type: String, default: '' })

defineProps({
  noToggler: {
    type: Boolean,
    default: false
  },
  noSearch: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const appStore = useAppStore()
const { breakpointDown } = useBreakpoints()

const show = computed({
  get: () => !closed.value,
  set: (value) => (closed.value = !value)
})

const closed = computed({
  get: () => appStore.filters.closed,
  set: (value) => (appStore.filters.closed = value)
})

const isOffCanvas = computed(() => {
  return breakpointDown.value[SIZE.MD]
})

const classList = computed(() => {
  return {
    'filters-panel--closed': closed.value,
    'filters-panel--off-canvas': isOffCanvas.value
  }
})

// This ensure that when passing in full width, the panel is closed
watch(isOffCanvas, (value) => value && (closed.value = true), { immediate: true })
</script>

<template>
  <page-offcanvas-replacement v-model="show" :active="isOffCanvas">
    <div class="filters-panel" :class="classList">
      <filters-panel-toggler v-if="!noToggler" class="filters-panel__toggler" @close="emit('close')" />
      <filters-panel-search v-if="!noSearch" v-model="q" class="filters-panel__search" />
      <slot />
    </div>
  </page-offcanvas-replacement>
</template>

<style scoped lang="scss">
.filters-panel {
  padding: $spacer;
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: $spacer-xl;
  background: var(--bs-tertiary-bg-subtle);
  flex: 0 0 $filters-panel-width;
  width: $filters-panel-width;
  height: 100vh;
  overflow: auto;

  position: sticky;
  z-index: $zindex-sticky;
  left: 0;
  top: 0;

  &--closed:not(&--off-canvas) {
    display: none;
  }

  &--off-canvas {
    max-width: min(100%, 100vw);
    width: 100%;
    position: relative;

    .filters-panel__search {
      width: 100%;
    }
  }
}
</style>
