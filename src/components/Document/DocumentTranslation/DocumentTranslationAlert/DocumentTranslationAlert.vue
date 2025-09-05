<script setup>
import { computed } from 'vue'
import { PhosphorIcon } from '@icij/murmur-next'

import DocumentTranslationAlertSource from './DocumentTranslationAlertSource'
import DocumentTranslationAlertTarget from './DocumentTranslationAlertTarget'
import DocumentTranslationAlertToggler from './DocumentTranslationAlertToggler'

const active = defineModel('active', { type: Boolean, default: false })

defineProps({
  detectedLanguage: {
    type: String,
    required: true
  },
  sourceLanguage: {
    type: String,
    required: true
  },
  targetLanguage: {
    type: String,
    required: true
  },
  translator: {
    type: String
  }
})

const classList = computed(() => {
  const alertVariant = active.value ? 'alert-warning' : 'alert-tertiary'
  return [alertVariant]
})
</script>

<template>
  <div
    class="document-translation-alert alert flex-truncate d-flex align-items-center py-2"
    :class="classList"
  >
    <phosphor-icon
      :name="PhTranslate"
      class="me-2 my-1 flex-shrink-0 d-none d-md-inline-flex"
    />
    <div class="d-flex align-items-center gap-1 gap-md-3 flex-wrap">
      Translated from:
      <div class="d-flex gap-1 text-nowrap flex-truncate me-md-4">
        <document-translation-alert-source
          :detected-language="detectedLanguage"
          :source-language="sourceLanguage"
          class="text-truncate"
        />
        <phosphor-icon
          :name="PhCaretRight"
          class="flex-shrink-0"
          variant="warning"
        />
        <document-translation-alert-target
          :target-language="targetLanguage"
          class="text-truncate"
        />
      </div>
      <document-translation-alert-toggler v-model:active="active" />
    </div>
  </div>
</template>
