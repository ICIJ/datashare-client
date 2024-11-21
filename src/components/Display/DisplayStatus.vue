<script setup>
import { computed } from 'vue'
import { PhosphorIcon } from '@icij/murmur-next'
import { useI18n } from 'vue-i18n'

import { SIZE, buttonSizeValidator } from '@/enums/sizes'
import { toVariant, toVariantPhosphorIcon } from '@/utils/utils'

const { t } = useI18n()

const props = defineProps({
  value: {
    type: String
  },
  variant: {
    type: String
  },
  icon: {
    type: [String, Object, Array],
  },
  title: {
    type: String
  },
  size: {
    type: String,
    default: SIZE.MD,
    validator: buttonSizeValidator
  }
})

const classList = computed(() => {
  return [`display-status--${props.variant ?? valueVariant.value}`, `display-status--${props.size}`]
})

const valueVariant = computed(() => {
  return toVariant(props.value)
})

const valueIcon = computed(() => {
  return toVariantPhosphorIcon(props.value)
})

const valueTitle = computed(() => {
  return t(`displayStatus.${props.value}`)
})
</script>

<template>
  <span v-b-tooltip.body.right class="display-status" :class="classList" :title="title ?? valueTitle">
    <phosphor-icon :name="icon ?? valueIcon" />
    <span class="visually-hidden">{{ value }}</span>
  </span>
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
