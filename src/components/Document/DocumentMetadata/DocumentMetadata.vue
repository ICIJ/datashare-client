<script setup>
import { PhosphorIcon, EllipsisTooltip as vEllipsisTooltip } from '@icij/murmur-next'

import DocumentMetadataActions from './DocumentMetadataActions'

const pinned = defineModel('pinned', { type: Boolean })

defineProps({
  icon: {
    type: String,
    default: 'info'
  },
  label: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  description: {
    type: String
  }
})
</script>

<template>
  <div class="document-metadata">
    <phosphor-icon class="document-metadata__icon" :name="icon" />
    <div v-b-tooltip class="document-metadata__label" :title="description">
      {{ label }}
    </div>
    <div class="document-metadata__value">
      <div v-ellipsis-tooltip="{ title: value }" class="text-truncate">
        <slot v-bind="{ icon, label, value, description }">
          {{ value }}
        </slot>
      </div>
    </div>
    <document-metadata-actions v-model:pinned="pinned" :value="value" class="document-metadata__actions" />
  </div>
</template>

<style lang="scss" scoped>
@include color-mode(dark) {
  .document-metadata:hover {
    box-shadow: 0 0 0 1px var(--bs-border-color);
  }
}

.document-metadata {
  display: flex;
  align-items: center;
  gap: $spacer-sm;
  padding: $spacer-xs $spacer;
  border-radius: var(--bs-border-radius);
  min-width: 0;

  &:hover {
    box-shadow: 1px 1px 8px 5px var(--bs-light);
  }

  &__icon,
  &__label {
    color: var(--bs-secondary-text-emphasis);
  }

  &__label {
    max-width: 140px;
    width: 100%;
    flex-shrink: 0;
  }

  &__value {
    flex-grow: 1;
  }

  &__label,
  &__value {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
