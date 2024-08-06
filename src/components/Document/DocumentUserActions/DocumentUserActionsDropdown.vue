<template>
  <b-dropdown split variant="outline-action" class="document-user-actions-dropdown">
    <template #button-content><document-user-actions-entry v-bind="first" /></template>
    <document-user-actions-entry v-for="action in others" :key="action.name" v-bind="action" dropdown-item />
  </b-dropdown>
</template>
<script setup>
import { computed } from 'vue'

import DocumentUserActionsEntry from '@/components/Document/DocumentUserActions/DocumentUserActionsEntry'

defineOptions({ name: 'DocumentUserActionsDropdown' })
/**
 * DocumentUserActionsDropdown requires at least 2 items
 */
const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  compact: {
    type: Boolean,
    default: false
  },
  hideLabels: {
    type: Boolean,
    default: false
  },
  hideTooltips: {
    type: Boolean,
    default: false
  }
})
const first = computed(() => {
  return props.items[0]
})
const others = computed(() => {
  return props.items.slice(1)
})
</script>
<style lang="scss">
.document-user-actions-dropdown {
  & > .btn:first-child {
    border: 0;
    padding: 0;
    text-align: center;
    background: inherit;
    &:hover {
      color: unset;
      background: unset;
    }
  }

  & > .btn.dropdown-toggle {
    &::after {
      all: unset;
      content: '⋮';
    }
  }
  & > .btn.dropdown-toggle,
  & > .btn.show {
    border: 0;
    color: inherit;
    background: inherit;
    &:hover {
      background: var(--bs-btn-hover-bg);
      color: var(--bs-btn-hover-color);
    }
  }

  & .dropdown-menu {
    color: inherit;
    background: inherit;
    border-color: var(--bs-action-color);
    --bs-dropdown-min-width: null;
  }
}
</style>
