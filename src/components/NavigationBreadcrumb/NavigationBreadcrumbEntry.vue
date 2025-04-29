<script setup>
import { computed } from 'vue'

const props = defineProps({
  flush: {
    type: Boolean
  }
})

const classList = computed(() => {
  return {
    'navigation-breadcrumb-entry--flush': props.flush
  }
})
</script>

<template>
  <div class="navigation-breadcrumb-entry" :class="classList">
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped>
.navigation-breadcrumb-entry {
  display: inline-flex;
  align-items: center;
  color: var(--bs-primary-color);

  &:not(&--flush) {
    padding: 0 $spacer;
  }
}
</style>
