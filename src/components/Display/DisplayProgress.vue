<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: {
    type: Number
  },
  variant: {
    type: String,
    default: 'primary'
  },
  noLabel: {
    type: Boolean,
    default: false
  }
})

const clampValue = computed(() => {
  return Math.max(0, Math.min(1, props.value))
})

const barStyle = computed(() => {
  return {
    width: `${clampValue.value * 100}%`
  }
})

const classList = computed(() => {
  return {
    [`display-progress--${props.variant}`]: true
  }
})
</script>

<template>
  <span class="display-progress" :class="classList">
    <span v-if="!noLabel" class="display-progress__label">
      {{ $n(clampValue, { useGrouping: false, style: 'percent' }) }}
    </span>
    <span class="display-progress__value" aria-hidden>
      <span class="display-progress__value__bar" :style="barStyle"></span>
    </span>
  </span>
</template>

<style lang="scss" scoped>
.display-progress {
  --display-progress-label-width: 3em;
  --display-progress-bg: var(--bs-secondary-bg-subtle);
  --display-progress-bar-bg: var(--bs-primary);
  --display-progress-bar-height: 4px;
  --display-progress-bar-width: 100px;

  display: inline-flex;
  max-width: calc(var(--display-progress-label-width) + var(--display-progress-bar-width));
  width: 100%;
  align-items: center;
  gap: $spacer-xs;

  @each $variant, $value in $theme-colors {
    &.display-progress--#{$variant} {
      --display-progress-bar-bg: var(--bs-#{$variant});
    }
  }

  &__label {
    font-size: $font-size-sm;
    color: var(--bs-secondary-text-emphasis);
    display: block;
    width: var(--display-progress-label-width);
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  &__value {
    display: block;
    max-width: var(--display-progress-bar-width);
    width: 100%;
    height: var(--display-progress-bar-height);
    background: var(--display-progress-bg);
    border-radius: var(--bs-border-radius);
    position: relative;
    flex-grow: 1;

    &__bar {
      display: inline-block;
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      background: var(--display-progress-bar-bg);
      border-radius: inherit;
    }
  }
}

@include color-mode(dark) {
  .display-progress {
    --display-progress-bg: #{$gray-600};
    --bs-action: var(--bs-white);
  }
}
</style>
