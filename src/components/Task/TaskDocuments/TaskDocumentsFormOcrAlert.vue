<script setup>
import { computed } from 'vue'
import { some, get, find } from 'lodash'
import { useI18n } from 'vue-i18n'

import settings from '@/utils/settings'
import AppOverlay from '@/components/AppOverlay/AppOverlay'

const props = defineProps({
  isoLang: String,
  textLanguages: {
    type: Array,
    default: () => []
  },
  ocrLanguages: {
    type: Array,
    default: () => []
  },
  hasTesseract: {
    type: Boolean,
    default: true
  },
  isReady: Boolean
})

const { t } = useI18n()

const languageName = computed(() => {
  if (props.isoLang) {
    const name = find(props.textLanguages, (language) => language.iso6392 === props.isoLang)?.name
    return t(`filter.lang.${name}`)
  }
  return 'default'
})

const isLanguageAvailable = computed(() => {
  return some(props.ocrLanguages, ({ name, iso6392 }) => {
    return sameLanguage(name) || sameLanguage(iso6392)
  })
})

const isOcrLanguage = computed(() => {
  return !props.isoLang || isLanguageAvailable.value
})

const shouldDisplayLanguageMessage = computed(() => {
  return props.hasTesseract && !isOcrLanguage.value
})

function toTesseractCode(name) {
  return get(settings, ['iso6392', 'tesseract', name], name)
}

function sameLanguage(nameOrIso6392) {
  return toTesseractCode(nameOrIso6392) === toTesseractCode(props.isoLang)
}
</script>

<template>
  <app-overlay :show="!isReady" class="task-documents-form-ocr-alert" spinner-small>
    <b-alert
      :model-value="!hasTesseract"
      variant="warning"
      class="task-documents-form-ocr-alert__tesseract_not_installed mt-3"
    >
      {{ t('taskDocumentsFormOcrAlert.tesseractNotInstalled') }}
    </b-alert>
    <b-alert
      :model-value="shouldDisplayLanguageMessage"
      variant="warning"
      class="task-documents-form-ocr-alert__install_ocr_language mt-3"
    >
      {{ t('taskDocumentsFormOcrAlert.isMissing', { language: languageName }) }}
      {{ t('taskDocumentsFormOcrAlert.useDefault') }}
      <a href="https://icij.gitbook.io/datashare/local-mode/add-more-languages" target="_blank">
        {{ t('taskDocumentsFormOcrAlert.installOcrLanguage', { availableLanguages: textLanguages.length }) }}
      </a>
    </b-alert>
  </app-overlay>
</template>
