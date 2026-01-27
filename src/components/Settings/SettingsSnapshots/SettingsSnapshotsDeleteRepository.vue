<script setup>
import { useI18n } from 'vue-i18n'

import ButtonRowActionDelete from '@/components/Button/ButtonRowAction/ButtonRowActionDelete'
import { useConfirmModal } from '@/composables/useConfirmModal'

defineOptions({ name: 'SettingsSnapshotsDeleteRepository' })

defineProps({
  isLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['delete'])

const { t } = useI18n()
const { confirm } = useConfirmModal()

async function confirmDelete() {
  const description = t('settings.snapshots.deleteRepository.message')
  if (await confirm({ description })) {
    emit('delete')
  }
}
</script>

<template>
  <button-row-action-delete
    size="md"
    :square="false"
    :hide-label="false"
    :disabled="isLoading"
    :label="t('settings.snapshots.deleteRepository.label')"
    class="settings-snapshots-delete-repository"
    @click="confirmDelete"
  />
</template>
