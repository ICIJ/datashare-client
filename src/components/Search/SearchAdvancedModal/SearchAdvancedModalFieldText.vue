<template>
  <search-advanced-modal-field
    :label="label"
    :icon="icon"
  >
    <b-form-input
      ref="input"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
    />
    <template
      v-if="examples.length"
      #example
    >
      <p class="search-advanced-modal__example">
        <template
          v-for="(line, index) in examples"
          :key="index"
        >
          <span
            v-if="index > 0"
            class="search-advanced-modal__example__break"
          />
          <span class="search-advanced-modal__example__prefix">
            {{ index === 0 ? t('searchAdvancedModal.eg') : t('searchAdvancedModal.or') }}
          </span>
          <span class="search-advanced-modal__example__value">
            {{ line }}
          </span>
        </template>
      </p>
    </template>
  </search-advanced-modal-field>
</template>

<script setup>
import { useTemplateRef } from 'vue'
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
  modelValue: {
    type: String,
    default: ''
  },
  /**
   * One or more example strings shown under the input. The first is
   * prefixed with "e.g.", subsequent lines with "or".
   */
  examples: {
    type: Array,
    default: () => []
  }
})

defineEmits(['update:modelValue'])

const { t } = useI18n()
const input = useTemplateRef('input')

// Exposed so a parent (the modal) can autofocus the first row on open.
defineExpose({ focus: () => input.value?.focus?.() })
</script>
