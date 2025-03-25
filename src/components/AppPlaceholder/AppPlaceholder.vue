<script setup>
import { computed } from 'vue'

const props = defineProps({
  cols: {
    type: [String, Number],
    default: 12
  },
  size: {
    type: String,
    default: 'md'
  },
  tag: {
    type: String,
    default: 'div'
  },
  variant: {
    type: String,
    default: null
  },
  width: {
    type: [String, Number]
  },
  whitespace: {
    type: Boolean
  },
  squared: {
    type: Boolean
  }
})

const widthString = computed(() => {
  return props.width === undefined
    ? undefined
    : typeof props.width === 'number'
      ? props.width.toString() + '%'
      : props.width
})

const colsString = computed(() => {
  return props.cols === undefined ? undefined : typeof props.cols === 'number' ? props.cols.toString() : props.cols
})

const classList = computed(() => {
  return {
    'app-placeholder--squared': props.squared,
    'app-placeholder--whitespace': props.whitespace,
    [`bg-${props.variant}`]: props.variant !== null,
    [`col-${colsString.value}`]: colsString.value !== undefined && widthString.value === undefined,
    [`placeholder-${props.size}`]: props.size !== 'md'
  }
})

const style = computed(() => {
  return {
    width: widthString.value === undefined ? undefined : widthString.value
  }
})
</script>

<template>
  <div class="app-placeholder placeholder rounded" :class="classList" :style="style" />
</template>

<style lang="scss">
.app-placeholder {
  opacity: 0.25;
  animation: placeholder-glow 2s ease-in-out infinite;

  &--squared {
    min-height: 0;
    position: relative;
    padding-top: 100%;
    display: block;
  }

  &--whitespace {
    clip-path: rect(0 calc(100% - #{$spacer-xxs}) 100% 0 round var(--bs-border-radius));
  }
}
</style>
