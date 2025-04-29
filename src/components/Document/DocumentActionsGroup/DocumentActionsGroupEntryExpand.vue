<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { matchesProperty } from 'lodash'

import DocumentActionsGroupEntry from './DocumentActionsGroupEntry'

import { useDocumentModal } from '@/composables/useDocumentModal'

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
const router = useRouter()
const { t } = useI18n()
const { show: showDocumentModal } = useDocumentModal()

const isSearchRoute = computed(() => route?.matched.some(matchesProperty('name', 'search')))

const to = computed(() => {
  const params = document.routerParams
  const query = { modal: true }
  const name = isSearchRoute.value ? 'document' : 'document-standalone'
  return { name, params, query }
})

const href = computed(() => {
  const { href } = router.resolve(to.value)
  return href
})

function handleClick(event) {
  if (!isSearchRoute.value) {
    event.preventDefault()
    showDocumentModal(document.index, document.id, document.routing, route.query.q)
  }
}
</script>

<template>
  <document-actions-group-entry
    class="document-actions-group-entry-expand"
    :icon="PhArrowsOutSimple"
    :href="href"
    :label="t('documentActionsGroup.expand')"
    :tooltip-placement="tooltipPlacement"
    :vertical="vertical"
    hide-tooltip
    @click.exact="handleClick"
  />
</template>
