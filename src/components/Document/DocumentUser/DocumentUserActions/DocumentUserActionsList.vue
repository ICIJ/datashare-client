<template>
  <b-button-group class="document-user-actions-list justify-content-between bg-action-subtle">
    <document-user-actions-entry v-for="action in items" :key="action.name" v-bind="action" class="mx-2" />
  </b-button-group>
</template>
<script setup>
import DocumentUserActionsEntry from '@/components/Document/DocumentUser/DocumentUserActions/DocumentUserActionsEntry'

defineOptions({ name: 'DocumentUserActionsList' })

defineProps({
  items: {
    type: Array,
    default: () => []
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
</script>
