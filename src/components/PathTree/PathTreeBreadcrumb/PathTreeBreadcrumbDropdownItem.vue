<script setup>
defineProps({
  compact: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <b-dropdown-item link-class="path-tree-breadcrumb-dropdown-item d-flex gap-2">
    <phosphor-icon
      v-if="!compact"
      :name="PhFolder"
      class="flex-shrink-0"
    />
    <slot />
  </b-dropdown-item>
</template>
