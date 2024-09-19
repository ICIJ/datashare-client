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
  }
})

const emit = defineEmits(['select'])

const classList = computed(() => {
  return {
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
  margin-right: $spacer-xxs;
  padding: 0;
  display: inline-flex;

  &:not(:last-child):after {
    content: '/';
    color: $text-muted;
    margin-left: $spacer-xxs;
  }
}
</style>
