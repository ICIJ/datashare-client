<script setup>
import { computed } from 'vue'

import PathTreeBreadcrumbEntryLabel from './PathTreeBreadcrumbEntryLabel.vue'
import PathTreeBreadcrumbEntryLink from './PathTreeBreadcrumbEntryLink.vue'

const props = defineProps({
  noLink: {
    type: Boolean
  },
  compact: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select'])

const classList = computed(() => {
  return {
    'path-tree-breadcrumb-entry--compact': props.compact
  }
})

const component = computed(() => {
  return props.noLink ? PathTreeBreadcrumbEntryLabel : PathTreeBreadcrumbEntryLink
})
</script>

<template>
  <li
    class="path-tree-breadcrumb-entry list-inline-item"
    :class="classList"
  >
    <component
      :is="component"
      @select="emit('select')"
    >
      <slot />
    </component>
  </li>
</template>

<style lang="scss" scoped>
.path-tree-breadcrumb-entry {
  --spacer: #{$spacer-xs};

  padding: 0;
  margin: 0;
  display: inline-flex;
  align-items: center;
  line-height: 1;
  gap: var(--spacer);

  &--compact {
    --spacer: #{$spacer-xxs};
  }

  &:last-child {
    font-weight: bold;
  }
}
</style>
