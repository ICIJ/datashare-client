<script setup>
import { useI18n } from 'vue-i18n'

import DocumentSearchNavItem from './DocumentSearchNavItem'

import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'

const { disabledNext, disabledPrevious } = defineProps({
  disabledPrevious: {
    type: Boolean
  },
  disabledNext: {
    type: Boolean
  },
  tooltipPlacement: {
    type: String,
    default: 'top'
  }
})
const { t } = useI18n()

const emit = defineEmits(['previous', 'next'])

const { wheneverRouteActionShortcut } = useKeyboardShortcuts()

wheneverRouteActionShortcut('goToPreviousDocument', () => {
  if (!disabledPrevious) {
    emit('previous')
  }
})

wheneverRouteActionShortcut('goToNextDocument', () => {
  if (!disabledNext) {
    emit('next')
  }
})
</script>

<template>
  <div class="document-search-nav">
    <slot>
      <document-search-nav-item
        :icon="PhCaretLeft"
        :label="t('documentSearchNavItem.previous')"
        :disabled="disabledPrevious"
        :tooltip-placement="tooltipPlacement"
        @click="$emit('previous')"
      />
      <document-search-nav-item
        :icon="PhCaretRight"
        :label="t('documentSearchNavItem.next')"
        :disabled="disabledNext"
        :tooltip-placement="tooltipPlacement"
        @click="$emit('next')"
      />
    </slot>
  </div>
</template>

<style lang="scss" scoped>
.document-search-nav {
  display: inline-flex;
  padding: $spacer-xxs;
  border-radius: var(--bs-border-radius);
  color: var(--bs-tertiary-color-subtle);
  background: var(--bs-tertiary-bg-subtle);
  min-width: auto;
  gap: $spacer-xxs;
}
</style>
