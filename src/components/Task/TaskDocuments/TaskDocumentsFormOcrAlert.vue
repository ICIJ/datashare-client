<script setup>
import { computed, onBeforeMount } from 'vue'
import { some, get, find } from 'lodash'
import { useI18n } from 'vue-i18n'

import { useLanguagesStore } from '@/store/modules/languages'
import settings from '@/utils/settings'

const props = defineProps({
  language: {
    type: String
  },
  disabled: {
    type: Boolean,
    default: false
  },
  contentClass: {
    type: [String, Array, Object]
  }
})

const { t } = useI18n()
const languagesStore = useLanguagesStore()

const languageName = computed(() => {
  if (props.language) {
    const language = find(languagesStore.textLanguages, ({ iso6392 }) => iso6392 === props.language)
    const { name = null } = language || {}
    return t(`filter.lang.${name}`)
  }
  return 'default'
})

const isLanguageAvailable = computed(() => {
  return some(languagesStore.ocrLanguages, ({ name, iso6392 }) => {
    return sameLanguage(name) || sameLanguage(iso6392)
  })
})

const showTesseractMissing = computed(() => {
  return !props.disabled && languagesStore.fetched && !languagesStore.ocrAvailable
})

const showLanguageMissing = computed(() => {
  return !props.disabled && languagesStore.fetched && languagesStore.ocrAvailable && props.language && !isLanguageAvailable.value
})

function toTesseractCode(name) {
  return get(settings, ['iso6392', 'tesseract', name], name)
}

function sameLanguage(nameOrIso6392) {
  return toTesseractCode(nameOrIso6392) === toTesseractCode(props.language)
}

onBeforeMount(languagesStore.fetchOnce)
</script>

<template>
  <b-alert
    :model-value="showTesseractMissing"
    :class="contentClass"
    class="task-documents-form-ocr-alert task-documents-form-ocr-alert--tesseract-missing"
    lazy
    variant="warning"
  >
    {{ t('taskDocumentsFormOcrAlert.tesseractNotInstalled') }}
  </b-alert>
  <b-alert
    :model-value="showLanguageMissing"
    :class="contentClass"
    class="task-documents-form-ocr-alert task-documents-form-ocr-alert--language-missing"
    lazy
    variant="warning"
  >
    {{ t('taskDocumentsFormOcrAlert.isMissing', { language: languageName }) }}
    {{ t('taskDocumentsFormOcrAlert.useDefault') }}
    <a
      href="https://icij.gitbook.io/datashare/local-mode/add-more-languages"
      target="_blank"
      class="alert-link"
    >
      {{ t('taskDocumentsFormOcrAlert.installOcrLanguage', { availableLanguages: languagesStore.textLanguages.length }) }}
    </a>
  </b-alert>
</template>

<style scoped lang="scss">
.task-documents-form-ocr-alert {
  margin-bottom: 0;
}
</style>
