<script setup>
const emit = defineEmits(['select'])
</script>

<template>
  <a class="path-tree-breadcrumb-entry-link" @click="emit('select')">
    <slot />
  </a>
</template>

<style lang="scss" scoped>
.path-tree-breadcrumb-entry-link {
  color: inherit;
  cursor: pointer;
}
</style>
