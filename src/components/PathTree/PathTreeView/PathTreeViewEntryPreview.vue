<script setup>
import { computed, useTemplateRef } from 'vue'

import PathTree from '@/components/PathTree/PathTree.vue'
import { LAYOUTS, SORT_BY, sortByValidator, ORDER_BY, orderByValidator } from '@/enums/pathTree'
import { useElementVisibilityOnce } from '@/composables/useElementVisibilityOnce'

const path = defineModel('path', { type: String, required: true })

const props = defineProps({
  /**
   * List of projects to use with the nested PathTree component
   */
  projects: {
    type: Array,
    default: () => []
  },
  /**
   * Whether to render in compact mode (no gaps between entries)
   */
  compact: {
    type: Boolean,
    default: false
  },
  /**
   * Whether to hide documents in the nested PathTree (only show directories)
   */
  noDocuments: {
    type: Boolean,
    default: false
  },
  /**
   * Whether to disable links in the nested PathTree (always render as plain text)
   */
  noLink: {
    type: Boolean,
    default: false
  },
  /**
   * Sort to use for rendering the nested PathTree component
   */
  sortBy: {
    type: String,
    default: SORT_BY.KEY,
    validator: sortByValidator
  },
  /**
   * Order to use for rendering the nested PathTree component
   */
  orderBy: {
    type: String,
    default: ORDER_BY.ASC,
    validator: orderByValidator
  }
})

const element = useTemplateRef('element')
const wasVisibleOnce = useElementVisibilityOnce(element)
const classList = computed(() => ({
  'path-tree-view-entry-preview--compact': props.compact
}))
</script>

<template>
  <div
    ref="element"
    class="path-tree-view-entry-preview"
    :class="classList"
  >
    <path-tree
      v-if="wasVisibleOnce"
      v-model:path="path"
      :projects="projects"
      :layout="LAYOUTS.LIST"
      :compact="compact"
      :no-documents="noDocuments"
      :no-link="noLink"
      :sort-by="sortBy"
      :order-by="orderBy"
      flat
      no-preview
      no-breadcrumb
      no-label
      no-search
      no-search-link
      no-stats
      squared
    />
  </div>
</template>

<style lang="scss" scoped>
.path-tree-view-entry-preview {
  --path-tree-view-entry-preview-padding-x: 0;
  --path-tree-view-entry-preview-padding-y: 0;

  border-top: 1px solid var(--bs-border-color);
  aspect-ratio: 1 / 1;
  overflow: auto;
  padding-inline: var(--path-tree-view-entry-preview-padding-x);
  padding-block: var(--path-tree-view-entry-preview-padding-y);

  &--compact {
    --path-tree-view-entry-preview-padding-x: #{$spacer-xs};
  }
}
</style>
