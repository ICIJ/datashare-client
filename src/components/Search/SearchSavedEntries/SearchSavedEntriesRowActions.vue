<script setup>
import { useI18n } from 'vue-i18n'

import { useSearchSavingModal, useRemoveSavedSearchModal } from '@/composables/search-saving'
import PageTableToggleDetailsButton from '@/components/PageTable/PageTableToggleDetailsButton'
import ButtonRowAction from '@/components/Button/ButtonRowAction'
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
  emit('edit')
}

const confirmRemovalModal = async () => {
  const title = t('searchSavedEntriesRowActions.removeTitle', { name: event.name })
  await showRemoveSavedSearchModal(event, { title })
  emit('remove')
}
</script>

<template>
  <div class="d-flex gap-2">
    <button-row-action label="Edit" icon="pencil" @click="confirmEditModal" />
    <button-row-action label="Delete" icon="trash" @click="confirmRemovalModal" />
    <page-table-toggle-details-button v-model="detailsShowing" />
  </div>
</template>
