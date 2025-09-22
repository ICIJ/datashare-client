<script setup>
import { computed, useTemplateRef } from 'vue'

import PathTree from '@/components/PathTree/PathTree.vue'
import { LAYOUTS, SORT_BY, sortByValidator, ORDER_BY, orderByValidator } from '@/enums/pathTree'
import { useElementVisibilityOnce } from '@/composables/useElementVisibilityOnce'

const path = defineModel('path', { type: String, required: true })

const { compact } = defineProps({
  projects: {
    type: Array,
    default: () => []
  },
  compact: {
    type: Boolean,
    default: false
  },
  noDocuments: {
    type: Boolean,
    default: false
  },
  noLink: {
    type: Boolean,
    default: false
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

const element = useTemplateRef('element')
const wasVisibleOnce = useElementVisibilityOnce(element)
const classList = computed(() => ({
  'path-tree-view-entry-preview--compact': compact
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
