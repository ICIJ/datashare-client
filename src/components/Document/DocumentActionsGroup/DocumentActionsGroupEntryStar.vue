<script setup>
import { computed } from 'vue'

import DocumentActionsGroupEntry from './DocumentActionsGroupEntry'

import { useStarredStore } from '@/store/modules/starred'

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

const starredStore = useStarredStore()

const isStarred = computed(() => {
  return starredStore.isStarred(document)
})

const toggleStar = () => {
  return starredStore.toggleStarDocument(document)
}
</script>

<template>
  <document-actions-group-entry
    icon="star"
    :label="$t('documentActionsGroup.star')"
    :tooltip-placement="tooltipPlacement"
    :vertical="vertical"
    :fill="isStarred"
    @click="toggleStar()"
  />
</template>
