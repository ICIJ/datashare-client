<script setup>
import PathTreeBreadcrumb from '@/components/PathTree/PathTreeBreadcrumb/PathTreeBreadcrumb'

const modelValue = defineModel({ type: String })

defineProps({
  /**
   * Whether to render in compact mode (no gaps between entries)
   */
  compact: {
    type: Boolean
  }
})
</script>

<template>
  <div class="path-tree-view-entry-breadcrumb d-flex flex-grow-1 gap-1 align-items-center">
    <phosphor-icon
      v-if="!compact"
      :name="PhFolderOpen"
      class="flex-shrink-0"
    />
    <path-tree-breadcrumb
      v-model="modelValue"
      class="flex-grow-1"
      :compact="compact"
      datadir-label
    />
  </div>
</template>
