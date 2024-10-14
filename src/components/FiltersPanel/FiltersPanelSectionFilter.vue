<script setup>
import { computed } from 'vue'

import FiltersPanelSectionFilterTitle from '@/components/FiltersPanel/FiltersPanelSectionFilterTitle'
import FiltersPanelSectionFilterFooter from '@/components/FiltersPanel/FiltersPanelSectionFilterFooter'
import FormControlSearch from '@/components/Form/FormControl/FormControlSearch'

const contextualize = defineModel('contextualize', { type: Boolean })
const exclude = defineModel('exclude', { type: Boolean })
const collapse = defineModel('collapse', { type: Boolean })

const props = defineProps({
  flush: {
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
  },
  loading: {
    type: Boolean
  }
})

const emit = defineEmits(['toggle', 'update:search'])

const classList = computed(() => {
  return {
    'filters-panel-section-filter--collapsed': collapse.value,
    'filters-panel-section-filter--loading': props.loading
  }
})
</script>

<template>
  <div class="filters-panel-section-filter mb-1" :class="classList">
    <filters-panel-section-filter-title
      v-model:collapse="collapse"
      :title="title"
      :icon="icon"
      :count="count"
      :hide-sort="hideSort"
      :loading="loading"
      class="pe-2 mx-2"
    >
      <slot name="title" />
    </filters-panel-section-filter-title>
    <b-collapse :model-value="!collapse">
      <div class="filters-panel-section-filter__content px-2 pt-3">
        <form-control-search
          v-if="!hideSearch"
          :model-value="search"
          :placeholder="searchPlaceholder"
          clear-text
          class="filters-panel-section-filter__content__search mb-3"
          @update:modelValue="emit('update:search', $event)"
        />
        <div :class="flush ? '' : 'ps-4 pe-2'">
          <slot />
        </div>
      </div>
      <slot name="footer">
        <filters-panel-section-filter-footer
          v-model:contextualize="contextualize"
          v-model:exclude="exclude"
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
    padding: $spacer-xxs 0;

    &:deep(.filters-panel-section-filter-title) {
      margin-bottom: $spacer-xxs;
    }
  }

  &__content {
    max-height: 380px;
    overflow: auto;
  }
}
</style>
