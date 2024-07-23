<script setup>
import { computed } from 'vue'

import DocumentMetadataActionsEntry from './DocumentMetadataActionsEntry'

const props = defineProps({
  pinned: {
    type: Boolean
  }
})

const pinIconWeight = computed(() => (props.pinned ? 'fill' : null))
const pinIconHoverWeight = computed(() => (props.pinned ? 'fill' : 'bold'))
</script>

<template>
  <div class="document-metdata-actions">
    <slot>
      <document-metadata-actions-entry icon="magnifying-glass" @click="$emit('search')" />
      <document-metadata-actions-entry icon="clipboard" @click="$emit('copy')" />
      <document-metadata-actions-entry
        icon="push-pin"
        :icon-weight="pinIconWeight"
        :icon-hover-weight="pinIconHoverWeight"
        @click="$emit('update:pinned', !pinned)"
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
