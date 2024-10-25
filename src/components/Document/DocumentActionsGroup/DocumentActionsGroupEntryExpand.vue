<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

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

const router = useRouter()

const href = computed(() => {
  const { href } = router.resolve({ name: 'document-standalone', params: document.routerParams })
  return window.location.origin + href
})
</script>

<template>
  <document-actions-group-entry
    icon="arrows-out-simple"
    target="_blank"
    :href="href"
    :label="$t('documentActionsGroup.expand')"
    :tooltip-placement="tooltipPlacement"
    :vertical="vertical"
  />
</template>
