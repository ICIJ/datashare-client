<script setup>
import { slugger } from '@/utils/strings'
import { computed, useTemplateRef } from 'vue'
import { AppIcon } from '@icij/murmur-next'

import IPhFloppyDiskBack from '~icons/ph/floppy-disk-back'
import IPhClockCountdown from '~icons/ph/clock-countdown'

import DisplayStatusLabel from '@/components/Display/DisplayStatusLabel'
import { buttonSizeValidator, SIZE } from '@/enums/sizes'
import { toVariant, toVariantIcon } from '@/utils/utils'

const props = defineProps({
  tag: {
    type: [String, Object],
    default: 'span'
  },
  value: {
    type: String
  },
  variant: {
    type: String
  },
  icon: {
    type: [String, Object, Array]
  },
  title: {
    type: String
  },
  size: {
    type: String,
    default: SIZE.MD,
    validator: buttonSizeValidator
  },
  tooltipDelay: {
    type: Object,
    default: () => ({ show: 0, hide: 0 })
  },
  noTooltip: {
    type: Boolean,
    default: false
  }
})

const element = useTemplateRef('element')

const classList = computed(() => {
  return [`display-status--${props.variant ?? valueVariant.value}`, `display-status--${props.size}`]
})

const valueVariant = computed(() => {
  return toVariant(props.value)
})

const valueIcon = computed(() => {
  const slug = slugger(props.value).toLowerCase()
  const icons = {
    draft: IPhFloppyDiskBack,
    queued: IPhClockCountdown,
    pending: IPhClockCountdown,
    created: IPhClockCountdown,
  }
  return icons[slug] ?? toVariantIcon(props.value)
})
</script>

<template>
  <component
    :is="tag"
    ref="element"
    :attrs="$attrs"
    class="display-status"
    :class="classList"
  >
    <app-icon
      size="1em"
      :name="icon ?? valueIcon"
    />
    <span class="visually-hidden">
      <display-status-label
        :value="value"
        :title="title"
      />
    </span>
    <b-tooltip
      teleport-to="body"
      :manual="noTooltip"
      :delay="tooltipDelay"
      :target="element"
    >
      <display-status-label
        :value="value"
        :title="title"
      />
    </b-tooltip>
  </component>
</template>

<style lang="scss" scoped>
.display-status {
  --display-status-bg: var(--bs-body-bg);
  --display-status-color: var(--bs-secondary-text-emphasis);

  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: $spacer-xs;
  border-radius: var(--bs-border-radius);
  background: var(--display-status-bg);
  color: var(--display-status-color);

  &--sm {
    width: calc(#{$btn-line-height * $btn-font-size-sm} + #{$btn-padding-y-sm * 2} + #{$btn-border-width} * 2);
    height: calc(#{$btn-line-height * $btn-font-size-sm} + #{$btn-padding-y-sm * 2} + #{$btn-border-width} * 2);
  }

  &--lg {
    width: calc(#{$btn-line-height * $btn-font-size-lg} + #{$btn-padding-y-lg * 2} + #{$btn-border-width} * 2);
    height: calc(#{$btn-line-height * $btn-font-size-lg} + #{$btn-padding-y-lg * 2} + #{$btn-border-width} * 2);
  }

  @each $state in map-keys($theme-colors) {
    &.display-status--#{$state} {
      --display-status-bg: var(--bs-#{$state}-bg-subtle);
      --display-status-color: var(--bs-#{$state});
    }
  }
}
</style>
