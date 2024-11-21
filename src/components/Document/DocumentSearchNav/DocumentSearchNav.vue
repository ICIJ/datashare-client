<script setup>
import DocumentSearchNavItem from './DocumentSearchNavItem'

defineProps({
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
</script>

<template>
  <div class="document-search-nav">
    <slot>
      <document-search-nav-item
        :icon="PhCaretLeft"
        :label="$t('documentSearchNavItem.previous')"
        :disabled="disabledPrevious"
        :tooltip-placement="tooltipPlacement"
        @click="$emit('previous')"
      />
      <document-search-nav-item
        :icon="PhCaretRight"
        :label="$t('documentSearchNavItem.next')"
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
}
</style>
