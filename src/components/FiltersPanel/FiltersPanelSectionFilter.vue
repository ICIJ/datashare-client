<script setup>
import { computed } from 'vue'

import FiltersPanelSectionFilterTitle from '@/components/FiltersPanel/FiltersPanelSectionFilterTitle'
import FiltersPanelSectionFilterActions from '@/components/FiltersPanel/FiltersPanelSectionFilterActions'
import FormControlSearch from '@/components/Form/FormControl/FormControlSearch'

const contextualize = defineModel('contextualize', { type: Boolean })
const exclude = defineModel('exclude', { type: Boolean })
const expand = defineModel('expand', { type: Boolean })
const collapse = defineModel('collapse', { type: Boolean })
const search = defineModel('search', { type: String })
const sort = defineModel('sort', { type: Object })

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
  searchPlaceholder: {
    type: String,
    default: 'Search...'
  },
  count: {
    type: Number,
    default: 0
  },
  icon: {
    type: [String, Object, Array]
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
  },
  modal: {
    type: Boolean
  },
  actionsPositionTitle: {
    type: Boolean,
    default: false
  },
  titleClass: {
    type: [String, Object, Array]
  },
  contentClass: {
    type: [String, Object, Array]
  },
  footerClass: {
    type: [String, Object, Array]
  }
})

const classList = computed(() => {
  return {
    'filters-panel-section-filter--collapsed': collapse.value,
    'filters-panel-section-filter--modal': props.modal,
    'filters-panel-section-filter--loading': props.loading
  }
})

const isVisible = computed(() => props.modal || !collapse.value)
</script>

<template>
  <div class="filters-panel-section-filter" :class="classList">
    <filters-panel-section-filter-title
      v-if="!modal"
      v-model:collapse="collapse"
      v-model:sort="sort"
      :title="title"
      :class="titleClass"
      :icon="icon"
      :count="count"
      :hide-sort="hideSort"
      :loading="loading"
      class="mx-2"
    >
      <template #actions>
        <filters-panel-section-filter-actions
          v-if="actionsPositionTitle"
          v-model:contextualize="contextualize"
          v-model:exclude="exclude"
          v-model:expand="expand"
          :hide-contextualize="hideContextualize"
          :hide-exclude="hideExclude"
          :hide-expand="modal || hideExpand"
          class="filters-panel-section-filter__footer px-2"
        />
        <slot name="actions" />
      </template>
    </filters-panel-section-filter-title>
    <b-collapse :model-value="isVisible">
      <div class="filters-panel-section-filter__content" :class="contentClass">
        <slot name="search" v-bind="{ search, searchPlaceholder }">
          <form-control-search
            v-if="!hideSearch"
            v-model="search"
            :placeholder="searchPlaceholder"
            clear-text
            class="filters-panel-section-filter__content__search mb-3"
          />
        </slot>
        <div :class="flush ? '' : 'ps-4 pe-2'">
          <slot />
        </div>
      </div>
      <slot name="footer">
        <filters-panel-section-filter-actions
          v-if="!actionsPositionTitle"
          v-model:contextualize="contextualize"
          v-model:exclude="exclude"
          v-model:expand="expand"
          :hide-contextualize="hideContextualize"
          :hide-exclude="hideExclude"
          :hide-expand="modal || hideExpand"
          class="filters-panel-section-filter__footer px-2 pt-2"
          :class="footerClass"
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
  margin-bottom: $spacer-xs;

  &--collapsed {
    margin-bottom: $spacer-xxs;
  }

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
    padding: $spacer $spacer-md $spacer-md;
  }

  &--modal &__content {
    padding: 0;
    max-height: none;
    min-height: 20vh;
    overflow: visible;
  }

  &--modal &__content__search,
  &--modal &__footer {
    position: sticky;
    background: $modal-content-bg;
    z-index: 10;
  }

  &--modal &__content__search {
    top: 0;
    padding: $spacer-sm 0;
  }

  &--modal &__footer {
    bottom: 0;
    padding: $spacer-xs 0;
  }
}
</style>
