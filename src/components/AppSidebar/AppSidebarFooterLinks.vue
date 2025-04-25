<script setup>
import { computed } from 'vue'

import Hook from '@/components/Hook/Hook'

const { compact } = defineProps({
  compact: {
    type: Boolean
  },
  name: {
    type: String
  }
})

const classList = computed(() => {
  return {
    'app-sidebar-footer-links--compact': compact
  }
})
</script>

<template>
  <hook name="app-sidebar-footer-links:before" v-bind="{ compact, name }" />
  <div class="app-sidebar-footer-links" :class="classList">
    <slot v-bind="{ compact }" />
  </div>
  <hook name="app-sidebar-footer-links:after" v-bind="{ compact, name }" />
</template>

<style lang="scss" scoped>
.app-sidebar-footer-links {
  display: flex;
  flex-direction: row;

  & > * {
    flex: 1;
    flex-basis: 0;
    text-align: center;
    align-items: center;

    &:first-of-type,
    &:first-of-type:last-of-type {
      text-align: left;
      align-items: flex-start;
    }

    &:last-of-type {
      text-align: right;
      align-items: flex-end;
    }
  }

  &--compact {
    flex-direction: column;
    gap: $spacer-xl;

    & > * {
      text-align: center;
    }
  }
}
</style>
