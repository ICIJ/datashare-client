<script setup>
import { computed } from 'vue'

const props = defineProps({
  dragging: {
    type: Boolean
  }
})

const classList = computed(() => {
  return {
    'separator-line-drag--dragging': props.dragging
  }
})
</script>

<template>
  <a class="separator-line-drag" :class="classList" />
</template>

<style lang="scss" scoped>
.separator-line-drag {
  cursor: grab;
  width: 0.5em;

  &--dragging {
    cursor: grabbing;
  }
}
</style>
