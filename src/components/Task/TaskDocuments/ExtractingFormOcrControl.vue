<script setup>
import { computed } from 'vue'
import { some, get, find } from 'lodash'
import { useI18n } from 'vue-i18n'

import settings from '@/utils/settings'

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
  <b-overlay :show="!isReady" class="extracting-language-form-ocr-control" rounded spinner-small>
    <b-alert
      :model-value="!hasTesseract"
      variant="warning"
      class="extracting-language-form-ocr-control__tesseract_not_installed mt-3"
    >
      {{ t('extractingFormOcrControl.tesseractNotInstalled') }}
    </b-alert>
    <b-alert
      :model-value="shouldDisplayLanguageMessage"
      variant="warning"
      class="extracting-language-form-ocr-control__install_ocr_language mt-3"
    >
      {{ t('extractingFormOcrControl.isMissing', { language: languageName }) }}
      {{ t('extractingFormOcrControl.useDefault') }}
      <a href="https://icij.gitbook.io/datashare/local-mode/add-more-languages" target="_blank">
        {{ t('extractingFormOcrControl.installOcrLanguage', { availableLanguages: textLanguages.length }) }}
      </a>
    </b-alert>
  </b-overlay>
</template>
