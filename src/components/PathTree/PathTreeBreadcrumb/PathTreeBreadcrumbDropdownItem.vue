<script setup>
import { AppIcon } from '@icij/murmur-next'

defineProps({
  compact: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <b-dropdown-item link-class="path-tree-breadcrumb-dropdown-item d-flex gap-2">
    <app-icon
      v-if="!compact"
      class="flex-shrink-0"
    >
      <i-ph-folder />
    </app-icon>
    <slot />
  </b-dropdown-item>
</template>
