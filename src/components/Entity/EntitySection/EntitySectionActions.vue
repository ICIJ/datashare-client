<script setup>
import { useI18n } from 'vue-i18n'

import EntitySectionActionsEntry from './EntitySectionActionsEntry'

defineProps({
  category: {
    type: String,
    required: true
  }
})
const { t } = useI18n()
</script>

<template>
  <div class="entity-section-actions d-inline-flex gap-2">
    <slot>
      <entity-section-actions-entry
        :label="t('entitySectionActions.copy')"
        icon="clipboard"
        @click="$emit('copy', category)"
      />
      <entity-section-actions-entry
        :label="t('entitySectionActions.download')"
        icon="download-simple"
        @click="$emit('download', category)"
      />
    </slot>
  </div>
</template>
