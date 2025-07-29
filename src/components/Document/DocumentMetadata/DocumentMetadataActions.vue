<script setup>
import { HapticCopy } from '@icij/murmur-next'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import DocumentMetadataActionsEntry from './DocumentMetadataActionsEntry'

const pinned = defineModel('pinned', { type: Boolean })

const emit = defineEmits(['search'])

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  index: {
    type: String,
    required: true
  },
  value: {
    type: [Number, String],
    required: true
  }
})
const { t } = useI18n()

const pinIconWeight = computed(() => (pinned.value ? 'fill' : null))
const pinIconHoverWeight = computed(() => (pinned.value ? 'fill' : 'bold'))
const q = computed(() => `${props.name}:"${props.value}"`)
const indices = computed(() => props.index)
</script>

<template>
  <div class="document-metadata-actions">
    <slot>
      <document-metadata-actions-entry
        :label="t('documentMetadataActions.search')"
        :to="{ name: 'search', query: { q, indices } }"
        icon="magnifying-glass"
        @click="emit('search')"
      />
      <haptic-copy
        :label="t('documentMetadataActions.copy')"
        :text="value"
        hide-label
        class="border-0"
        variant="outline-secondary"
      />
      <document-metadata-actions-entry
        :label="t('documentMetadataActions.pin')"
        icon="push-pin"
        :icon-weight="pinIconWeight"
        :icon-hover-weight="pinIconHoverWeight"
        @click="pinned = !pinned"
      />
    </slot>
  </div>
</template>

<style lang="scss" scoped>
.document-metadata-actions {
  display: inline-flex;
  gap: 2px;
}
</style>
