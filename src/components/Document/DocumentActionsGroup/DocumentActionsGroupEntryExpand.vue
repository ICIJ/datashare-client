<script setup>
import { computed, inject } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { matchesProperty } from 'lodash'

import DocumentActionsGroupEntry from './DocumentActionsGroupEntry'

import { useDocument } from '@/composables/useDocument'

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

const route = useRoute()
const { t } = useI18n()
const { isRouteActive, documentParentRoute } = useDocument()
const modal = inject('modal', undefined)

const isSearchRoute = computed(() => route?.matched.some(matchesProperty('name', 'search')))

const documentRoute = computed(() => {
  const params = document.routerParams
  const query = { modal: true }
  const name = isSearchRoute.value ? 'document' : 'document-standalone'
  return { name, params, query }
})

const activeDocumentParentRoute = computed(() => {
  const { name } = documentParentRoute.value
  return { name }
})

const to = computed(() => {
  if (active.value) {
    return activeDocumentParentRoute.value
  }

  return documentRoute.value
})

const active = computed(() => modal && isRouteActive(document))
const icon = computed(() => (active.value ? 'x' : 'arrows-out-simple'))
const label = computed(() => (active.value ? t('documentActionsGroup.close') : t('documentActionsGroup.expand')))
</script>

<template>
  <document-actions-group-entry
    :icon="icon"
    :to="to"
    :label="label"
    :tooltip-placement="tooltipPlacement"
    :vertical="vertical"
    hide-tooltip
  />
</template>
