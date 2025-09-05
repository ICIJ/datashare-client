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
  height: {
    type: [String, Number]
  },
  whitespace: {
    type: Boolean
  },
  squared: {
    type: Boolean
  },
  repeat: {
    type: Number,
    default: 1
  }
})

const widthString = computed(() => {
  return props.width === undefined
    ? undefined
    : typeof props.width === 'number'
      ? props.width.toString() + '%'
      : props.width
})

const heightString = computed(() => {
  return props.height === undefined
    ? undefined
    : typeof props.height === 'number'
      ? props.height.toString() + '%'
      : props.height
})

const colsString = computed(() => {
  return props.cols === undefined ? undefined : typeof props.cols === 'number' ? props.cols.toString() : props.cols
})

const classList = computed(() => {
  return {
    'app-placeholder--squared': props.squared,
    'app-placeholder--whitespace': props.whitespace,
    [`bg-${props.variant}-subtle`]: props.variant !== null,
    [`bg-default`]: props.variant === null,
    [`col-${colsString.value}`]: colsString.value !== undefined && widthString.value === undefined,
    [`placeholder-${props.size}`]: props.size !== 'md'
  }
})

const style = computed(() => {
  return {
    width: widthString.value,
    height: heightString.value
  }
})
</script>

<template>
  <div
    v-for="i in repeat"
    :key="i"
    class="app-placeholder placeholder rounded"
    :class="classList"
    :style="style"
  />
</template>

<style lang="scss">
.app-placeholder {
  background: var(--bs-tertiary-bg-subtle);
  animation: placeholder-glow 2s ease-in-out infinite;
  opacity: 1;

  .table-striped > tbody > tr:nth-of-type(2n + 1) > td &.bg-default,
  .table-striped > tbody > tr:hover > td &.bg-default,
  .table-striped > tbody > tr:nth-of-type(2n + 1) > td &.bg-tertiary-subtle,
  .table-striped > tbody > tr:hover > td &.bg-tertiary-subtle {
    background: var(--bs-body-bg);
  }

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
