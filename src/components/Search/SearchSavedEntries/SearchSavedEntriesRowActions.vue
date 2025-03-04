<script setup>
import { useI18n } from 'vue-i18n'

import ButtonIcon from '@/components/Button/ButtonIcon'
import { useSearchSavingModal, useRemoveSavedSearchModal } from '@/composables/search-saving'
import PageTableToggleDetailsButton from '@/components/PageTable/PageTableToggleDetailsButton'
const detailsShowing = defineModel('toggle', { type: Boolean })
const { event } = defineProps({
  event: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['edited', 'removed'])

const { t } = useI18n()
const { show: showEditModal } = useSearchSavingModal()
const { show: showRemoveSavedSearchModal } = useRemoveSavedSearchModal()

const confirmEditModal = async () => {
  await showEditModal(event)
  emit('edited')
}

const confirmRemovalModal = async () => {
  const title = t('searchSavedEntriesRowActions.removeTitle', { name: event.name })
  await showRemoveSavedSearchModal(event, { title })
  emit('removed')
}
</script>

<template>
  <div class="d-flex gap-2">
    <button-icon
      :icon-left="PhPencilSimple"
      icon-left-hover-weight="bold"
      hide-label
      square
      size="sm"
      variant="outline-secondary"
      label="Edit"
      class="border-0"
      @click="confirmEditModal"
    />
    <button-icon
      :icon-left="PhTrash"
      icon-left-hover-weight="bold"
      hide-label
      square
      size="sm"
      variant="outline-secondary"
      label="Delete"
      class="border-0"
      @click="confirmRemovalModal"
    />
    <page-table-toggle-details-button v-model="detailsShowing" />
  </div>
</template>
