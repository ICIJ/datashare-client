<script setup>
import { PhosphorIcon } from '@icij/murmur-next'

import DocumentMetadataActions from './DocumentMetadataActions'

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
  <div class="document-metadata-entry">
    <phosphor-icon class="document-metadata-entry__icon" :name="icon" />
    <div v-b-tooltip class="document-metadata-entry__label" :title="description">
      {{ label }}
    </div>
    <div class="document-metadata-entry__value">
      <slot v-bind="{ icon, label, value, description }">
        {{ value }}
      </slot>
    </div>
    <document-metadata-actions class="document-metadata-entry__actions" />
  </div>
</template>

<style lang="scss" scoped>
.document-metadata-entry {
  display: flex;
  align-items: center;
  gap: $spacer-sm;
  padding: $spacer-xs $spacer;

  &:hover {
    box-shadow: 1px 1px 8px 5px var(--bs-lighter);
  }

  &__icon,
  &__label {
    color: var(--bs-tertiary-text-emphasis);
  }

  &__label {
    max-width: 140px;
    width: 100%;
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
