<script setup>
import { AppIcon } from '@icij/murmur-next'

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
    <app-icon
      v-if="!compact"
      class="flex-shrink-0"
    >
      <i-ph-folder-open />
    </app-icon>
    <path-tree-breadcrumb
      v-model="modelValue"
      class="flex-grow-1"
      :compact="compact"
      datadir-label
    />
  </div>
</template>
