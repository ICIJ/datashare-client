<script setup>
import { computed } from 'vue'

import PathTreeBreadcrumb from '@/components/PathTree/PathTreeBreadcrumb/PathTreeBreadcrumb'

const modelValue = defineModel({ type: String })

const { compact } = defineProps({
  compact: {
    type: Boolean
  }
})

const maxDirectories = computed(() => {
  return compact ? 2 : 3
})
</script>

<template>
  <div class="path-tree-view-entry-breadcrumb d-flex gap-1 align-items-center">
    <phosphor-icon v-if="!compact" :name="PhFolderOpen" class="flex-shrink-0" />
    <path-tree-breadcrumb v-model="modelValue" :compact="compact" :max-directories="maxDirectories" datadir-label />
  </div>
</template>
