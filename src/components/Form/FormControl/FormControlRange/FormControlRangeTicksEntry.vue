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
  <button
    type="button"
    class="form-control-range-ticks-entry btn btn-outline-action"
    :class="classList"
  >
    {{ value }}
  </button>
</template>

<style lang="scss" scoped>
.form-control-range-ticks-entry {
  padding: $spacer-xs;
  text-align: center;
  border-radius: var(--bs-border-radius);
  font-variant-numeric: tabular-nums;
  flex-grow: 1;
  flex-basis: 0;
  width: max-content;

  --bs-btn-bg: transparent;
  --bs-btn-color: var(--bs-link-color);
  --bs-btn-border-color: transparent;
  --bs-btn-hover-bg: var(--bs-btn-bg);
  --bs-btn-hover-color: var(--bs-btn-color);
  --bs-btn-hover-border-color: var(--bs-action);
  --bs-btn-focus-box-shadow: 0 0 0 #{$btn-focus-width} #{mix($action, $white)} inset;

  &--active {
    --bs-btn-bg: var(--bs-action);
    --bs-btn-color: var(--bs-white);
  }
}
</style>
