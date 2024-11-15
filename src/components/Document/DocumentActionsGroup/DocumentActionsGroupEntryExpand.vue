<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import DocumentActionsGroupEntry from './DocumentActionsGroupEntry'

import { useDocument } from '@/composables/document'

const { document, modal } = defineProps({
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
  },
  /**
   * The current document is in a modal view
   */
  modal: {
    type: Boolean
  }
})

const { t } = useI18n()
const { isRouteActive, documentParentRoute } = useDocument()

const documentRoute = computed(() => {
  const params = document.routerParams
  const name = modal ? 'document' : 'document-standalone'
  return { name, params }
})

const activeDocumentParentRoute = computed(() => {
  const { name } = documentParentRoute.value
  return { name }
})

const to = computed(() => {
  return active.value ? activeDocumentParentRoute.value : documentRoute.value
})

const active = computed(() => modal && isRouteActive(document))
const target = computed(() => (!active.value ? '_blank' : '_self'))
const icon = computed(() => (active.value ? 'arrows-in-simple' : 'arrows-out-simple'))
const label = computed(() => (active.value ? t('documentActionsGroup.reduce') : t('documentActionsGroup.expand')))
</script>

<template>
  <document-actions-group-entry
    :target="target"
    :icon="icon"
    :to="to"
    :label="label"
    :tooltip-placement="tooltipPlacement"
    :vertical="vertical"
  />
</template>
