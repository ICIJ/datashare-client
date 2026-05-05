<template>
  <search-advanced-modal-field
    :label="label"
    :icon="icon"
  >
    <div class="d-flex align-items-center gap-2">
      <b-form-input
        :model-value="start"
        @update:model-value="$emit('update:start', $event)"
      />
      <span class="text-secondary">
        {{ t('searchAdvancedModal.and') }}
      </span>
      <b-form-input
        :model-value="end"
        @update:model-value="$emit('update:end', $event)"
      />
    </div>
    <template #example>
      <p class="search-advanced-modal__example">
        <span class="search-advanced-modal__example__prefix">
          {{ t('searchAdvancedModal.eg') }}
        </span>
        <span class="search-advanced-modal__example__value">
          {{ example }}
        </span>
      </p>
    </template>
  </search-advanced-modal-field>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

import SearchAdvancedModalField from './SearchAdvancedModalField.vue'

defineProps({
  label: {
    type: String,
    required: true
  },
  icon: {
    type: [Object, Function],
    required: true
  },
  start: {
    type: String,
    default: ''
  },
  end: {
    type: String,
    default: ''
  },
  example: {
    type: String,
    required: true
  }
})

defineEmits(['update:start', 'update:end'])

const { t } = useI18n()
</script>
