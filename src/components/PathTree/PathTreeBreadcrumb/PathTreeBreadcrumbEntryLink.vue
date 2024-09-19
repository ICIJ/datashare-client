<script setup lang="ts">
const emit = defineEmits(['select'])
</script>

<template>
  <a class="path-tree-breadcrumb-entry-link" @click="emit('select')">
    <slot />
  </a>
</template>
