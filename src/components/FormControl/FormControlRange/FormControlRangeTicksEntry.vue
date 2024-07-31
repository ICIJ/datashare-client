<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: {
    type: Number
  },
  active: {
    type: Boolean
  }
})

const classList = computed(() => {
  return {
    'form-control-range-ticks-entry--active': props.active
  }
})
</script>

<template>
  <div class="form-control-range-ticks-entry" :class="classList">
    {{ value }}
  </div>
</template>

<style lang="scss" scoped>
.form-control-range-ticks-entry {
  padding: $spacer-xs;
  text-align: center;
  border-radius: var(--bs-border-radius);
  font-variant-numeric: tabular-nums;
  cursor: pointer;

  flex-grow: 1;
  flex-basis: 0;
  width: max-content;

  &--active {
    background-color: var(--bs-action);
    color: var(--bs-white);
  }
}
</style>
