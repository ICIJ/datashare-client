<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

import DocumentActionsGroupEntry from './DocumentActionsGroupEntry'

const { document } = defineProps({
  /**
   * The current document
   */
  document: {
    type: Object
  },
  /**
   * Position of the button tooltip
   */
  tooltipPlacement: {
    type: String,
    default: 'bottom'
  },
  /**
   * Use vertical layout for the button
   */
  vertical: {
    type: Boolean
  }
})

const store = useStore()

const isStarred = computed(() => {
  return store?.getters['starred/isStarred'](document)
})
</script>

<template>
  <document-actions-group-entry
    icon="star"
    :label="$t('documentActionsGroup.star')"
    :tooltip-placement="tooltipPlacement"
    :vertical="vertical"
    :fill="isStarred"
  />
</template>
