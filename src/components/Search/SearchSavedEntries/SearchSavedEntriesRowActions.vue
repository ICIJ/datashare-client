<script setup>
import { useI18n } from 'vue-i18n'

import { useRemoveSavedSearchModal } from '@/composables/useRemoveSavedSearchModal'
import { useSearchSavingModal } from '@/composables/useSearchSavingModal'
import PageTableToggleDetailsButton from '@/components/PageTable/PageTableToggleDetailsButton'
import ButtonRowAction from '@/components/Button/ButtonRowAction/ButtonRowAction'

const { event } = defineProps({
  event: {
    type: Object,
    required: true
  }
})

const detailsShowing = defineModel('toggle', { type: Boolean })
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
    <button-row-action
      hide-tooltip
      :label="t('searchSavedEntriesRowActions.edit')"
      icon="pencil"
      @click="confirmEditModal"
    />
    <button-row-action
      hide-tooltip
      :label="t('searchSavedEntriesRowActions.delete')"
      icon="trash"
      @click="confirmRemovalModal"
    />
    <page-table-toggle-details-button v-model="detailsShowing" hide-tooltip />
  </div>
</template>
