<script setup>
import { computed } from 'vue'

import FiltersPanelSectionFilterTitle from '@/components/FiltersPanel/FiltersPanelSectionFilterTitle'
import FiltersPanelSectionFilterFooter from '@/components/FiltersPanel/FiltersPanelSectionFilterFooter'
import SearchFormControl from '@/components/SearchFormControl'

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
  search: {
    type: String
  },
  searchPlaceholder: {
    type: String,
    default: 'Search...'
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
  hideSearch: {
    type: Boolean
  },
  hideSort: {
    type: Boolean
  }
})

const emit = defineEmits(['toggle', 'update:search'])

const classList = computed(() => {
  return {
    'filters-panel-section-filter--collapsed': props.collapse
  }
})
</script>

<template>
  <div class="filters-panel-section-filter mb-1" :class="classList">
    <filters-panel-section-filter-title
      :title="title"
      :icon="icon"
      :collapse="collapse"
      :count="count"
      :hide-sort="hideSort"
      class="pe-2 mx-2"
      @toggle="emit('toggle', $event)"
    >
      <slot name="title" />
    </filters-panel-section-filter-title>
    <b-collapse :model-value="!collapse">
      <div class="filters-panel-section-filter__content px-2 pt-3">
        <search-form-control
          v-if="!hideSearch"
          :model-value="search"
          :placeholder="searchPlaceholder"
          shadow
          size="sm"
          class="filters-panel-section-filter__content__search mb-3"
          @update:modelValue="emit('update:search', $event)"
        />
        <div class="ps-4">
          <slot />
        </div>
      </div>
      <slot name="footer">
        <filters-panel-section-filter-footer
          :hide-contextualize="hideContextualize"
          :hide-exclude="hideExclude"
          :hide-expand="hideExpand"
          class="ps-2 pe-2"
        />
      </slot>
    </b-collapse>
  </div>
</template>

<style lang="scss" scoped>
.filters-panel-section-filter {
  border-radius: $border-radius;
  transition: $transition-base;
  padding: $spacer-xxs 0;

  &:not(&--collapsed),
  &:hover {
    background: var(--bs-body-bg);
  }

  &:not(&--collapsed) {
    padding: $spacer-xs 0;
  }

  &__content {
    max-height: 280px;
    overflow: auto;
  }
}
</style>
