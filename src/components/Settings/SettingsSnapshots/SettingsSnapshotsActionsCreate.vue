<script setup>
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur-next'

import IPhPlus from '~icons/ph/plus'

defineOptions({ name: 'SettingsSnapshotsActionsCreate' })

defineProps({
  isLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['create'])

const { t } = useI18n()
</script>

<template>
  <button-icon
    variant="outline-primary"
    :icon-left="IPhPlus"
    :disabled="isLoading"
    class="settings-snapshots-actions-create"
    @click="emit('create')"
  >
    {{ t('settings.snapshots.create') }}
  </button-icon>
</template>
