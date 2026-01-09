<script setup>
import { useI18n } from 'vue-i18n'

import IPhClipboard from '~icons/ph/clipboard'
import IPhDownloadSimple from '~icons/ph/download-simple'

import EntitySectionActionsEntry from './EntitySectionActionsEntry'

defineProps({
  category: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['copy', 'download'])
const { t } = useI18n()
</script>

<template>
  <div class="entity-section-actions d-inline-flex gap-2">
    <slot>
      <entity-section-actions-entry
        :label="t('entitySectionActions.copy')"
        :icon="IPhClipboard"
        @click="emit('copy', category)"
      />
      <entity-section-actions-entry
        :label="t('entitySectionActions.download')"
        :icon="IPhDownloadSimple"
        @click="emit('download', category)"
      />
    </slot>
  </div>
</template>
