<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import DocumentActionsGroupEntry from './DocumentActionsGroupEntry'

import { useStarredStore } from '@/store/modules'

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

const { t } = useI18n()

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
    class="document-actions-group-entry-star"
    icon="star"
    :label="t('documentActionsGroup.star')"
    :tooltip-placement="tooltipPlacement"
    :vertical="vertical"
    :fill="isStarred"
    hide-tooltip
    @click="toggleStar()"
  />
</template>
