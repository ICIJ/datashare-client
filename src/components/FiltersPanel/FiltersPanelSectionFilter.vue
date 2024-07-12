<script setup>
import { computed } from 'vue'

import FiltersPanelSectionFilterTitle from '@/components/FiltersPanel/FiltersPanelSectionFilterTitle'
import FiltersPanelSectionFilterFooter from '@/components/FiltersPanel/FiltersPanelSectionFilterFooter'

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
  count: {
    type: Number,
    default: 0
  },
  icon: {
    type: String
  },
  hideContextualize: {
    type: Boolean
  },
  hideExclude: {
    type: Boolean
  },
  hideExpand: {
    type: Boolean
  },
  hideSort: {
    type: Boolean
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
      :count="count"
      :hide-sort="hideSort"
      class="pe-2"
      @toggle="emit('toggle', $event)"
    >
      <slot name="title" />
    </filters-panel-section-filter-title>
    <b-collapse :model-value="!collapse">
      <div class="filters-panel-section-filter__entries py-3 ps-3 pe-2">
        <slot />
      </div>
      <slot name="footer">
        <filters-panel-section-filter-footer
          :hide-contextualize="hideContextualize"
          :hide-exclude="hideExclude"
          :hide-expand="hideExpand"
        />
      </slot>
    </b-collapse>
  </div>
</template>

<style lang="scss" scoped>
.filters-panel-section-filter {
  border-radius: $border-radius;
  transition: $transition-base;

  &:not(&--collapsed),
  &:hover {
    background: var(--bs-body-bg);
  }

  &__entries {
    max-height: 240px;
    overflow: auto;
  }
}
</style>
