<script setup>
defineProps({
  title: {
    type: String
  }
})
</script>

<template>
  <h3 class="filters-panel-section-title text-primary-emphasis">
    <slot>{{ title }}</slot>
  </h3>
</template>

<style lang="scss" scoped>
.filters-panel-section-title {
  font-size: 1em;
  padding: 0 0 $spacer-xs;
  margin: 0;
}
</style>
