<template>
  <b-button
    v-bind="buttonProps"
    :id="buttonId"
    ref="element"
    :to="to"
    class="button-icon"
    :class="classList"
    :aria-label="tooltipText"
    @mousenter="currentHover = true"
    @mouseleave="currentHover = false"
  >
    <slot name="start" />
    <phosphor-icon
      v-if="iconLeft || (!iconLeft && !iconRight && loading)"
      v-b-tooltip.top.body="{ title: iconLeftLabel, offset: iconLeftLabelOffset, delay: tooltipDelay }"
      :name="iconLeftOrSpinner"
      :size="iconLeftSize"
      :weight="iconLeftWeight"
      :hover-weight="iconLeftHoverWeight"
      :spin="loading"
      :spin-duration="loadingDuration"
      :variant="iconLeftVariant"
      :hover-variant="iconLeftHoverVariant"
      :hover="currentHover"
      class="button-icon__icon-left"
    />
    <span v-if="!hideLabel" class="button-icon__label">
      <slot v-bind="{ labelOrLoadingText }">{{ labelOrLoadingText }}</slot>
    </span>
    <phosphor-icon
      v-if="iconRight"
      v-b-tooltip.top.body="{ title: iconRightLabel, offset: iconRightLabelOffset, delay: tooltipDelay }"
      :name="iconRightOrSpinner"
      :size="iconRightSize"
      :weight="iconRightWeight"
      :hover-weight="iconRightHoverWeight"
      :spin="loading"
      :spin-duration="loadingDuration"
      :variant="iconRightVariant"
      :hover-variant="iconRightHoverVariant"
      :hover="currentHover"
      class="button-icon__icon-right"
      @click="click('icon-right')"
    />
    <button-icon-counter v-if="counter !== null" :counter="counter" :variant="counterVariant" :style="counterStyle" />
    <slot name="end" />
    <b-tooltip
      v-if="hasTooltip"
      teleport-to="body"
      :delay="tooltipDelay"
      :boundary-padding="20"
      :placement="tooltipPlacement"
      :target="elementRef"
      :title="tooltipText"
    />
  </b-button>
</template>

<script setup>
import { computed, ref, inject, useTemplateRef } from 'vue'
import { uniqueId } from 'lodash'
import { PhosphorIcon } from '@icij/murmur-next'
import { PhCircleNotch } from '@phosphor-icons/vue'

import ButtonIconCounter from './ButtonIconCounter'

import { SIZE } from '@/enums/sizes'
import { VARIANT, variantValidator } from '@/enums/variants'
import { iconWeightValidator } from '@/enums/iconWeights'
import { PLACEMENT, placementValidator } from '@/enums/placements'

const injectedVariant = inject('variant', VARIANT.ACTION)
const injectedSize = inject('size', SIZE.MD)
const elementRef = useTemplateRef('element')

defineOptions({
  name: 'ButtonIcon'
})

const props = defineProps({
  id: {
    type: String
  },
  iconLeft: {
    type: [String, Object, Array],
    default: null
  },
  iconLeftVariant: {
    type: String,
    default: null,
    validator: variantValidator
  },
  iconLeftHoverVariant: {
    type: String,
    default: null,
    validator: variantValidator
  },
  iconLeftWeight: {
    type: String,
    default: null,
    validator: iconWeightValidator
  },
  iconLeftHoverWeight: {
    type: String,
    default: null,
    validator: iconWeightValidator
  },
  iconLeftSize: {
    type: String
  },
  iconLeftLabel: {
    type: String,
    default: null
  },
  iconLeftLabelOffset: {
    type: Number,
    default: 19
  },
  iconRight: {
    type: [String, Object, Array],
    default: null
  },
  iconRightVariant: {
    type: String,
    default: null,
    validator: variantValidator
  },
  iconRightHoverVariant: {
    type: String,
    default: null,
    validator: variantValidator
  },
  iconRightWeight: {
    type: String,
    default: null,
    validator: iconWeightValidator
  },
  iconRightHoverWeight: {
    type: String,
    default: null,
    validator: iconWeightValidator
  },
  iconRightSize: {
    type: String
  },
  iconRightLabel: {
    type: String,
    default: null
  },
  iconRightLabelOffset: {
    type: Number,
    default: 19
  },
  iconSpinner: {
    type: [String, Object],
    default: PhCircleNotch
  },
  hideLabel: {
    type: Boolean,
    default: false
  },
  hideTooltip: {
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
    type: String
  },
  size: {
    type: String
  },
  block: {
    type: Boolean
  },
  pill: {
    type: Boolean
  },
  pressed: {
    type: Boolean,
    default: null
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
  tooltipLabel: {
    type: String,
    default: null
  },
  tooltipPlacement: {
    type: String,
    default: PLACEMENT.TOP,
    validator: placementValidator
  },
  tooltipDelay: {
    type: Object,
    default: () => ({ show: 0, hide: 0 })
  },
  showTooltipForce: {
    type: Boolean
  },
  hover: {
    type: Boolean
  },
  counter: {
    type: Number,
    default: null
  },
  counterVariant: {
    type: String,
    default: VARIANT.SECONDARY,
    validator: variantValidator
  },
  counterStyle: {
    type: [String, Object],
    default: null
  },
  truncate: {
    type: Boolean
  }
})

const emit = defineEmits(['click:icon-right'])

function click(name) {
  emit(`click:${name}`)
}

const currentHover = ref(false)

const buttonId = computed(() => props.id ?? uniqueId('button-icon-'))

const classList = computed(() => {
  return {
    'button-icon--square': props.square,
    'button-icon--loading': props.loading,
    'button-icon--truncate': props.truncate,
    'button-icon--hover': props.currentHover,
    'button-icon--use-injected-variant': !props.variant,
    'button-icon--use-injected-size': !props.size
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

const tooltipText = computed(() => {
  return props.tooltipLabel ?? props.label
})

const hasTooltip = computed(() => {
  return !!tooltipText.value && !props.hideTooltip && (props.showTooltipForce || props.hideLabel)
})

const buttonProps = computed(() => ({
  block: props.block,
  pill: props.pill,
  pressed: props.pressed,
  size: props.size ?? injectedSize,
  tag: props.tag,
  type: props.type,
  variant: props.variant ?? injectedVariant
}))
</script>

<style lang="scss">
.button-icon {
  --button-icon-square-size: calc(
    #{$btn-line-height * $btn-font-size} + #{$btn-padding-y * 2} + #{$btn-border-width} * 2
  );
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  min-width: 0;

  .button-icon-counter {
    margin: -0.5em 0 -0.5em $spacer-xs;
  }

  &--truncate {
    max-width: 100%;

    .button-icon__label {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1 0 0;
    }
  }

  &--square {
    padding: 0;
    align-items: center;
    justify-content: center;
    width: var(--button-icon-square-size);
    height: var(--button-icon-square-size);
    position: relative;
    flex-shrink: 0;

    .button-icon-counter {
      margin-left: 0;
      position: absolute;
      bottom: auto;
      left: auto;
      right: 0;
      top: 0;
      transform: translate(50%, -50%);
    }
  }

  &--square.btn-sm {
    width: calc(#{$btn-line-height * $btn-font-size-sm} + #{$btn-padding-y-sm * 2} + #{$btn-border-width} * 2);
    height: calc(#{$btn-line-height * $btn-font-size-sm} + #{$btn-padding-y-sm * 2} + #{$btn-border-width} * 2);
  }

  &--square.btn-lg {
    width: calc(#{$btn-line-height * $btn-font-size-lg} + #{$btn-padding-y-lg * 2} + #{$btn-border-width} * 2);
    height: calc(#{$btn-line-height * $btn-font-size-lg} + #{$btn-padding-y-lg * 2} + #{$btn-border-width} * 2);
  }

  &__icon-left ~ &__label,
  &__label ~ &__icon-right {
    margin-left: $spacer-xs;
  }

  &__icon-left,
  &__icon-right {
    --phosphor-icon-size: #{$line-height-base * $btn-font-size};

    .btn-sm & {
      --phosphor-icon-size: #{$line-height-base * $btn-font-size-sm};
    }

    .btn-lg & {
      --phosphor-icon-size: #{$line-height-base * $btn-font-size-lg};
    }
  }
}
</style>
