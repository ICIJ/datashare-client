<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import IPhStar from '~icons/ph/star'
import IPhStarFill from '~icons/ph/star-fill'

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
  }
})

const { t } = useI18n()

const starredStore = useStarredStore()

const isStarred = computed(() => {
  return !!document && starredStore.isStarred(document)
})

const icon = computed(() => {
  return isStarred.value ? IPhStarFill : IPhStar
})

const toggleStar = () => {
  return starredStore.toggleStarDocument(document)
}
</script>

<template>
  <document-actions-group-entry
    class="document-actions-group-entry-star"
    :icon="icon"
    :label="t('documentActionsGroup.star')"
    :tooltip-placement="tooltipPlacement"
    :fill="isStarred"
    hide-tooltip
    @click="toggleStar()"
  />
</template>
