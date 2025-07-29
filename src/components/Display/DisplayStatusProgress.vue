<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import DisplayStatus from './DisplayStatus'
import DisplayProgress from './DisplayProgress'

const props = defineProps({
  fixedWidth: {
    type: Boolean
  },
  status: {
    type: String
  },
  statusIcon: {
    type: [String, Object, Array]
  },
  statusTitle: {
    type: String
  },
  statusVariant: {
    type: String
  },
  progress: {
    type: Number
  },
  progressVariant: {
    type: String,
    default: 'action'
  }
})

const title = computed(() => {
  const { t } = useI18n()
  return props.statusTitle ?? t(`displayStatus.${props.status}`)
})

const classList = computed(() => {
  return {
    [`display-status-progress--${props.variant}`]: true,
    'display-status-progress--fixed-width': props.fixedWidth
  }
})
</script>

<template>
  <span
    class="display-status-progress"
    :class="classList"
  >
    <display-status
      v-if="status"
      :value="status"
      :icon="statusIcon"
      :title="statusTitle"
      :variant="statusVariant"
    />
    <span class="display-status-progress__title">{{ title }}</span>
    <display-progress
      :value="progress"
      :variant="progressVariant"
    />
  </span>
</template>

<style lang="scss" scoped>
.display-status-progress {
  display: flex;
  align-items: center;
  gap: $spacer-xs;
  font-size: $font-size-sm;
  white-space: nowrap;
  color: var(--bs-secondary-text-emphasis);

  &--fixed-width &__title {
    width: 100%;
    max-width: 6em;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
