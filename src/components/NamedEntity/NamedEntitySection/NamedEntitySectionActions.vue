<script setup>
import NamedEntitySectionActionsEntry from './NamedEntitySectionActionsEntry'

defineProps({
  category: {
    type: String,
    required: true
  }
})
</script>

<template>
  <div class="named-entity-section-actions d-inline-flex gap-2">
    <slot>
      <named-entity-section-actions-entry
        :label="$t('namedEntitySectionActions.copy')"
        icon="clipboard"
        @click="$emit('copy', category)"
      />
      <named-entity-section-actions-entry
        :label="$t('namedEntitySectionActions.download')"
        icon="download-simple"
        @click="$emit('download', category)"
      />
    </slot>
  </div>
</template>
