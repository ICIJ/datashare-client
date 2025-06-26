<script setup>
import { computed } from 'vue'
import { PhosphorIcon } from '@icij/murmur-next'

const props = defineProps({
  flush: {
    type: Boolean
  },
  noCaret: {
    type: Boolean,
    default: false
  }
})

const classList = computed(() => {
  return {
    'navigation-breadcrumb-entry--flush': props.flush
  }
})
</script>

<template>
  <div class="navigation-breadcrumb-entry" :class="classList">
    <slot />
    <phosphor-icon
      v-if="!noCaret"
      role="separator"
      aria-hidden="true"
      class="navigation-breadcrumb-entry__caret mx-2"
      size="1em"
      :name="PhCaretRight"
    />
  </div>
</template>

<style lang="scss" scoped>
.navigation-breadcrumb-entry {
  display: inline-flex;
  align-items: center;
  color: var(--bs-primary-color);

  &:not(&--flush) {
    padding: 0 $spacer;
  }
}
</style>
