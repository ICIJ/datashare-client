<script setup>
import { supportsPDFs as embeddable } from 'pdfobject'
import { useI18n } from 'vue-i18n'

const modelValue = defineModel({ type: Boolean, default: false })

const { t } = useI18n()
</script>

<template>
  <b-dropdown-item-button :disabled="!embeddable" :active="modelValue" @click="modelValue = !modelValue">
    <span class="d-flex align-items-center gap-2">
      <phosphor-icon :name="PhFilePdf" />
      {{ t('documentViewerPdfNavDropdownEmbed.switch') }}
    </span>
  </b-dropdown-item-button>
</template>
