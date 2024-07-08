<template>
  <b-button
    v-b-tooltip="{ title: label, placement: tooltipPlacement }"
    :to="to"
    v-bind="buttonProps"
    class="icon-button d-inline-flex align-items-center"
    :class="classList"
  >
    <phosphor-icon
      v-if="iconLeft || (!iconLeft && !iconRight && loading)"
      :name="iconLeftOrSpinner"
      :spin="loading"
      :spin-duration="loadingDuration"
      class="icon-button__icon-left"
    />
    <span v-if="!hideLabel" class="icon-button__label">
      <slot v-bind="{ labelOrLoadingText }">{{ labelOrLoadingText }}</slot>
    </span>
    <phosphor-icon
      v-if="iconRight"
      :name="iconRightOrSpinner"
      :spin="loading"
      :spin-duration="loadingDuration"
      class="icon-button__icon-right"
    />
  </b-button>
</template>

<script setup>
import { computed } from 'vue'

import PhosphorIcon from '@/components/PhosphorIcon'

const props = defineProps({
  iconLeft: {
    type: String,
    default: null
  },
  iconRight: {
    type: String,
    default: null
  },
  iconSpinner: {
    type: String,
    default: 'circle-notch'
  },
  hideLabel: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    default: null
  },
  square: {
    type: Boolean,
    default: false
  },
  to: {
    type: Object
  },
  variant: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md'
  },
  block: {
    type: Boolean
  },
  pill: {
    type: Boolean
  },
  pressed: {
    type: Boolean
  },
  tag: {
    type: String,
    default: 'button'
  },
  type: {
    type: String,
    default: 'button'
  },
  loading: {
    type: Boolean
  },
  loadingDuration: {
    type: String,
    default: '1s'
  },
  loadingText: {
    type: String
  },
  tooltipPlacement: {
    type: String,
    default: 'top'
  }
})

const classList = computed(() => {
  return {
    'icon-button--square': props.square,
    'icon-button--loading': props.loading
  }
})

const iconLeftOrSpinner = computed(() => {
  return props.loading ? props.iconSpinner : props.iconLeft
})

const iconRightOrSpinner = computed(() => {
  return props.loading ? props.iconSpinner : props.iconRight
})

const labelOrLoadingText = computed(() => {
  return props.loading && props.loadingText ? props.loadingText : props.label
})

const buttonProps = {
  block: props.block,
  pill: props.pill,
  pressed: props.pressed,
  size: props.size,
  tag: props.tag,
  type: props.type,
  variant: props.variant
}
</script>

<style lang="scss" scoped>
.icon-button {
  &--square {
    padding: 0;
    align-items: center;
    justify-content: center;
    width: calc(#{$btn-line-height * $btn-font-size} + #{$btn-padding-y * 2} + #{$btn-border-width} * 2);
    height: calc(#{$btn-line-height * $btn-font-size} + #{$btn-padding-y * 2} + #{$btn-border-width} * 2);
  }

  &--square.btn-sm {
    width: calc(#{$btn-line-height * $btn-font-size-sm} + #{$btn-padding-y-sm * 2} + #{$btn-border-width} * 2);
    height: calc(#{$btn-line-height * $btn-font-size-sm} + #{$btn-padding-y-sm * 2} + #{$btn-border-width} * 2);
  }

  &--square.btn-lg {
    width: calc(#{$btn-line-height * $btn-font-size-lg} + #{$btn-padding-y-lg * 2} + #{$btn-border-width} * 2);
    height: calc(#{$btn-line-height * $btn-font-size-lg} + #{$btn-padding-y-lg * 2} + #{$btn-border-width} * 2);
  }

  &__icon-left ~ &__label {
    margin-left: $spacer-xxs;
  }

  &__label ~ &__icon-right {
    margin-left: $spacer-xxs;
  }

  &__icon-left,
  &__icon-right {
    height: $line-height-base * $btn-font-size;

    .btn-sm & {
      height: $line-height-base * $btn-font-size-sm;
    }

    .btn-lg & {
      height: $line-height-base * $btn-font-size-lg;
    }
  }
}
</style>
