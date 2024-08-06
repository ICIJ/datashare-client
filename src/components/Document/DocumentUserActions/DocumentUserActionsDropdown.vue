<template>
  <b-dropdown
    variant="outline-action"
    class="document-user-actions-dropdown"
    :toggle-class="toggleClassList"
    :menu-class="menuClassList"
  >
    <document-user-actions-entry v-for="action in items" :key="action.name" v-bind="action" dropdown-item />
  </b-dropdown>
</template>
<script setup>
import DocumentUserActionsEntry from '@/components/Document/DocumentUserActions/DocumentUserActionsEntry'

defineOptions({ name: 'DocumentUserActionsDropdown' })
/**
 * DocumentUserActionsDropdown
 */
defineProps({
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

const toggleClassList = 'bg-action-subtle text-action-emphasis'
const menuClassList = 'bg-action-subtle text-action-emphasis border-action'
</script>
<style lang="scss">
.document-user-actions-dropdown {
  & > .btn:first-child {
    border: 0;
    box-shadow: none;
  }

  & > .btn.dropdown-toggle {
    &::after {
      all: unset;
      content: '⋮';
    }
  }
  .dropdown-menu {
    --bs-dropdown-min-width: null;
  }
}
</style>
