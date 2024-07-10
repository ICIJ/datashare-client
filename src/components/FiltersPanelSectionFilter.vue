<script setup>
import { computed } from 'vue'

import FiltersPanelSectionFilterTitle from '@/components/FiltersPanelSectionFilterTitle'

const props = defineProps({
  collapse: {
    type: Boolean
  },
  title: {
    type: String
  },
  name: {
    type: String
  },
  icon: {
    type: String
  }
})

const emit = defineEmits(['toggle'])

const classList = computed(() => {
  return {
    'filters-panel-section-filter--collapsed': props.collapse
  }
})
</script>

<template>
  <div class="filters-panel-section-filter py-1 mb-1 px-2" :class="classList">
    <filters-panel-section-filter-title
      :title="title"
      :icon="icon"
      :collapse="collapse"
      @toggle="emit('toggle', $event)"
    >
      <slot name="title" />
    </filters-panel-section-filter-title>
    <b-collapse :model-value="!collapse">
      <div class="py-3 ps-3">
        <slot />
      </div>
    </b-collapse>
  </div>
</template>

<style lang="scss" scoped>
.filters-panel-section-filter {
  background: var(--bs-body-bg);
  border-radius: $border-radius;
  transition: $transition-base;

  &--collapsed:not(:hover) {
    background: transparent;
  }
}
</style>
