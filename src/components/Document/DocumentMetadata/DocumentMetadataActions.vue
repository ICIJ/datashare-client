<script setup>
import { HapticCopy } from '@icij/murmur-next'
import { computed } from 'vue'

import DocumentMetadataActionsEntry from './DocumentMetadataActionsEntry'

const pinned = defineModel('pinned', { type: Boolean })

defineProps({
  value: {
    type: String,
    required: true
  }
})

const pinIconWeight = computed(() => (pinned.value ? 'fill' : null))
const pinIconHoverWeight = computed(() => (pinned.value ? 'fill' : 'bold'))
</script>

<template>
  <div class="document-metdata-actions">
    <slot>
      <document-metadata-actions-entry
        :label="$t('documentMetadataActions.search')"
        icon="magnifying-glass"
        @click="$emit('search')"
      />
      <haptic-copy
        :label="$t('documentMetadataActions.copy')"
        :text="value"
        hide-label
        class="border-0"
        variant="outline-secondary"
      />
      <document-metadata-actions-entry
        :label="$t('documentMetadataActions.pin')"
        icon="push-pin"
        :icon-weight="pinIconWeight"
        :icon-hover-weight="pinIconHoverWeight"
        @click="pinned = !pinned"
      />
    </slot>
  </div>
</template>

<style lang="scss" scoped>
.document-metdata-actions {
  display: inline-flex;
  gap: 2px;
}
</style>
