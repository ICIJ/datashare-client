<script setup>
import { computed, inject, ref, useSlots } from 'vue'

import PathTreeViewEntryName from './PathTreeViewEntryName'
import PathTreeViewEntrySearchLink from './PathTreeViewEntrySearchLink'
import PathTreeViewEntryPreview from './PathTreeViewEntryPreview'
import PathTreeViewEntryStats from './PathTreeViewEntryStats'
import { LAYOUTS, layoutValidator, SORT_BY, sortByValidator, ORDER_BY, orderByValidator } from '@/enums/pathTree'

const collapse = defineModel('collapse', { type: Boolean })
const selected = defineModel('selected', { type: Boolean })
const indeterminate = defineModel('indeterminate', { type: Boolean })
const path = defineModel('path', { type: String, required: true })

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  projects: {
    type: Array,
    default: () => []
  },
  selectMode: {
    type: Boolean,
    default: null
  },
  compact: {
    type: Boolean,
    default: null
  },
  documents: {
    type: Number,
    default: 0
  },
  directories: {
    type: Number,
    default: 0
  },
  flush: {
    type: Boolean
  },
  size: {
    type: Number,
    default: 0
  },
  noHeader: {
    type: Boolean
  },
  loading: {
    type: Boolean
  },
  noCaret: {
    type: Boolean
  },
  noDocuments: {
    type: Boolean
  },
  noLink: {
    type: Boolean
  },
  noPreview: {
    type: Boolean
  },
  noStats: {
    type: Boolean
  },
  noSearchLink: {
    type: Boolean
  },
  layout: {
    type: String,
    default: LAYOUTS.TREE,
    validator: layoutValidator
  },
  level: {
    type: Number,
    default: 0
  },
  squared: {
    type: Boolean
  },
  stretched: {
    type: Boolean
  },
  to: {
    type: Object,
    default: null
  },
  sortBy: {
    type: String,
    default: SORT_BY.KEY,
    validator: sortByValidator
  },
  orderBy: {
    type: String,
    default: ORDER_BY.ASC,
    validator: orderByValidator
  }
})

const active = ref(false)
const slots = useSlots()

const classList = computed(() => {
  return {
    'path-tree-view-entry--active': active.value,
    'path-tree-view-entry--selected': selected.value,
    'path-tree-view-entry--compact': compactOrInjected.value,
    'path-tree-view-entry--no-link': props.noLink,
    'path-tree-view-entry--squared': props.squared,
    'path-tree-view-entry--stretched': props.stretched,
    'path-tree-view-entry--flush': props.flush && props.level === 0,
    [`path-tree-view-entry--root`]: isRoot.value,
    [`path-tree-view-entry--${props.layout}`]: true
  }
})

const selectModeOrInjected = computed(() => props.selectMode ?? inject('selectMode', false))
const compactOrInjected = computed(() => props.compact ?? inject('compact', false))
const tag = computed(() => (props.to && !props.noLink ? 'router-link' : 'div'))
const isGridView = computed(() => props.layout === LAYOUTS.GRID)
const isRoot = computed(() => props.level === 0)
const hasPreview = computed(() => isGridView.value && !isRoot.value)
const hasChildren = computed(() => !!slots.default)
</script>

<template>
  <component
    :is="tag"
    :to="to"
    class="path-tree-view-entry"
    :class="classList"
  >
    <div
      v-if="!noHeader"
      class="path-tree-view-entry__header d-flex align-items-center"
      @mouseenter="active = true"
      @mouseleave="active = false"
    >
      <path-tree-view-entry-name
        v-model:collapse="collapse"
        v-model:selected="selected"
        v-model:indeterminate="indeterminate"
        :compact="compactOrInjected"
        :name="name"
        :loading="loading"
        :select-mode="selectModeOrInjected"
        :layout="layout"
        :level="level"
        :no-caret="noCaret"
        :no-link="noLink"
        :no-search-link="noSearchLink"
      >
        <template #icon>
          <slot name="icon" />
        </template>
        <slot name="name" />
      </path-tree-view-entry-name>
      <path-tree-view-entry-search-link
        v-if="!noSearchLink && isGridView"
        class="path-tree-view-entry__header__search-link"
        :path="path"
        :projects="projects"
      />
      <path-tree-view-entry-stats
        v-if="!noStats && !isGridView"
        :path="path"
        class="ms-auto"
        :projects="projects"
        :no-search-link="noSearchLink"
        :compact="compactOrInjected"
        :documents="documents"
        :directories="directories"
        :size="size"
        :selected="selected"
        :active="compactOrInjected ? selected : active"
      />
    </div>
    <div v-if="!noPreview && hasPreview">
      <slot name="preview">
        <path-tree-view-entry-preview
          v-model:path="path"
          :compact="compact"
          :no-documents="noDocuments"
          :projects="projects"
          :sort-by="sortBy"
          :order-by="orderBy"
        />
      </slot>
    </div>
    <b-collapse
      v-if="hasChildren"
      :model-value="!collapse"
      class="path-tree-view-entry__subdirectories"
    >
      <slot v-bind="{ collapse, selected, active }" />
    </b-collapse>
  </component>
</template>

<style lang="scss">
.path-tree-view-entry {
  --path-tree-view-entry-bg: transparent;
  --path-tree-view-entry-border: none;
  --path-tree-view-entry-border-radius: none;
  --path-tree-view-entry-cursor: default;
  --path-tree-view-entry-margin-top: 1px;
  --path-tree-view-entry-header-height: 3.5rem;
  --path-tree-view-entry-header-line-height: 1;
  --path-tree-view-entry-header-padding: #{$spacer-sm} #{$spacer};
  --path-tree-view-entry-header-bg: transparent;
  --path-tree-view-entry-header-color: inherit;
  --path-tree-view-entry-header-border-radius: var(--bs-border-radius);
  --path-tree-view-entry-header-search-link-visibility: hidden;
  --path-tree-view-entry-header-search-link-offset: -#{$spacer};
  --path-tree-view-entry-subdirectories-gap: #{$spacer-xl};

  border: var(--path-tree-view-entry-border);
  border-radius: var(--path-tree-view-entry-border-radius);
  background: var(--path-tree-view-entry-bg);
  cursor: var(--path-tree-view-entry-cursor);
  margin-top: var(--path-tree-view-entry-margin-top);
  display: block;
  position: relative;

  &--compact {
    --path-tree-view-entry-margin-top: 0;
    --path-tree-view-entry-header-padding: 2px 0;
    --path-tree-view-entry-header-height: 1.75rem;
    --path-tree-view-entry-header-search-link-offset: -#{$spacer-sm};
  }

  &--squared {
    --path-tree-view-entry-border-radius: 0;
    --path-tree-view-entry-header-border-radius: 0;
    --path-tree-view-entry-margin-top: 0;
  }

  &--stretched > &__header:after {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1;
    content: "";
  }

  &--flush {
    --path-tree-view-entry-header-padding: #{$spacer-sm} 0;
    --path-tree-view-entry-header-search-link-offset: -#{$spacer-sm};
  }

  &--grid:not(&--root) {
    --path-tree-view-entry-border: 1px solid var(--bs-border-color);
    --path-tree-view-entry-border-radius: var(--bs-border-radius);
    --path-tree-view-entry-header-border-radius: var(--bs-border-radius) var(--bs-border-radius) 0 0;
  }

  &--grid > .path-tree-view-entry__subdirectories {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
    gap: var(--path-tree-view-entry-subdirectories-gap);
  }

  &--grid.path-tree-view-entry--compact {
    --path-tree-view-entry-subdirectories-gap: #{$spacer};
  }

  &--active {
    --path-tree-view-entry-header-search-link-visibility: visible
  }

  &--active:not(&--no-link) {
    --path-tree-view-entry-cursor: pointer;
  }

  &--active:not(&--compact):not(&--no-link) {
    --path-tree-view-entry-header-bg: var(--bs-tertiary-bg-subtle);
  }

  &--active.path-tree-view-entry--grid:not(&--no-link) {
    --path-tree-view-entry-bg: var(--bs-secondary-bg-subtle);
    --path-tree-view-entry-header-bg: transparent;
  }

  &--selected:not(&--compact),
  &--selected:not(&--compact).path-tree-view-entry--active {
    --path-tree-view-entry-header-bg: var(--bs-action);
    --path-tree-view-entry-header-color: var(--bs-white);
  }

  & > &__header {
    border-radius: var(--path-tree-view-entry-header-border-radius);
    padding: var(--path-tree-view-entry-header-padding);
    background: var(--path-tree-view-entry-header-bg);
    color: var(--path-tree-view-entry-header-color);
    height: var(--path-tree-view-entry-header-height);
    line-height: var(--path-tree-view-entry-header-line-height);
  }

  & > &__header > &__header__search-link {
    visibility: var(--path-tree-view-entry-header-search-link-visibility);
    margin-right: var(--path-tree-view-entry-header-search-link-offset);
  }
}
</style>
