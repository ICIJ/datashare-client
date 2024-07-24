<script setup>
import { computed } from 'vue'
import { PhosphorIcon } from '@icij/murmur-next'
import { useI18n } from 'vue-i18n'

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
    type: String
  },
  title: {
    type: String
  }
})

const classList = computed(() => {
  return [`display-status--${props.variant ?? valueVariant.value}`]
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
  --display-status-color: var(--bs-tertiary-text-emphasis);

  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: $spacer-xs;
  border-radius: var(--bs-border-radius);
  background: var(--display-status-bg);
  color: var(--display-status-color);

  @each $state in map-keys($theme-colors) {
    &.display-status--#{$state} {
      --display-status-bg: var(--bs-#{$state}-bg-subtle);
      --display-status-color: var(--bs-#{$state});
    }
  }
}
</style>
