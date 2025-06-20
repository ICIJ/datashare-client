<script setup>
import { computed } from 'vue'

import PathTreeBreadcrumbEntryLabel from './PathTreeBreadcrumbEntryLabel.vue'
import PathTreeBreadcrumbEntryLink from './PathTreeBreadcrumbEntryLink.vue'

const props = defineProps({
  root: {
    type: Boolean
  },
  abbr: {
    type: Boolean
  },
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
    'path-tree-breadcrumb-entry--compact': props.compact,
    'path-tree-breadcrumb-entry--root': props.root,
    'path-tree-breadcrumb-entry--abbr': props.abbr
  }
})

const component = computed(() => {
  return props.noLink ? PathTreeBreadcrumbEntryLabel : PathTreeBreadcrumbEntryLink
})
</script>

<template>
  <li class="path-tree-breadcrumb-entry list-inline-item" :class="classList">
    <component :is="component" @select="emit('select')">
      <slot />
    </component>
  </li>
</template>

<style lang="scss" scoped>
.path-tree-breadcrumb-entry {
  --margin-x: #{$spacer-xs};

  margin-right: var(--margin-x);
  padding: 0;
  display: inline-flex;
  line-height: 1;
  display: inline-block;

  &--compact {
    --margin-x: #{$spacer-xxs};
  }

  &:last-child {
    font-weight: bold;
  }

  &:not(:last-child):after {
    content: '›';
    font-weight: bold;
    opacity: $hr-opacity;
    margin-left: var(--margin-x);
  }
}
</style>
