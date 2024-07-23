<script setup>
import DocumentSearchNavItem from './DocumentSearchNavItem'

defineProps({
  disabledPrevious: {
    type: Boolean
  },
  disabledNext: {
    type: Boolean
  }
})
</script>

<template>
  <div class="document-search-nav">
    <slot>
      <document-search-nav-item
        icon="caret-left"
        :label="$t('documentSearchNavItem.previous')"
        :disabled="disabledPrevious"
        @click="$emit('previous')"
      />
      <document-search-nav-item
        icon="caret-right"
        :label="$t('documentSearchNavItem.next')"
        :disabled="disabledNext"
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
  color: var(--bs-light-color-subtle);
  background: var(--bs-light-bg-subtle);
}
</style>
