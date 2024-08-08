<script setup>
import { PhosphorIcon } from '@icij/murmur-next'

import DocumentTranslationAlertSource from './DocumentTranslationAlertSource'
import DocumentTranslationAlertTarget from './DocumentTranslationAlertTarget'
import DocumentTranslationAlertToggler from './DocumentTranslationAlertToggler'

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
  },
  active: {
    type: Boolean
  }
})
</script>

<template>
  <div class="document-translation-alert alert alert-warning flex-truncate d-flex align-items-center py-2">
    <phosphor-icon name="translate" class="me-2 my-1 flex-shrink-0 d-none d-md-inline-flex" />
    <div class="d-flex align-items-center gap-1 gap-md-3 flex-wrap">
      Translated from:
      <div class="d-flex gap-1 text-nowrap flex-truncate me-md-4">
        <document-translation-alert-source
          :detected-language="detectedLanguage"
          :source-language="sourceLanguage"
          class="text-truncate"
        />
        <phosphor-icon name="caret-right" class="flex-shrink-0" variant="warning" />
        <document-translation-alert-target :target-language="targetLanguage" class="text-truncate" />
      </div>
      <document-translation-alert-toggler :active="active" @update:active="$emit('update:active', $event)" />
    </div>
  </div>
</template>
