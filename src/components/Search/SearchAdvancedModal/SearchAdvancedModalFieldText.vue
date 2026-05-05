<template>
  <search-advanced-modal-field
    :label="label"
    :icon="icon"
  >
    <b-form-input
      ref="input"
      v-model="model"
    />
    <template
      v-if="examples.length"
      #example
    >
      <search-advanced-modal-examples :examples="examples" />
    </template>
  </search-advanced-modal-field>
</template>

<script setup>
import { useTemplateRef } from 'vue'

import SearchAdvancedModalExamples from './SearchAdvancedModalExamples.vue'
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
  /**
   * One or more example strings shown under the input. The first is
   * prefixed with "e.g.", subsequent lines with "or".
   */
  examples: {
    type: Array,
    default: () => []
  }
})

const model = defineModel({ type: String, default: '' })

const input = useTemplateRef('input')

// Exposed so a parent (the modal) can autofocus the first row on open.
defineExpose({ focus: () => input.value?.focus?.() })
</script>
