<script setup>
import { computed, onBeforeMount } from 'vue'
import { some, get, find } from 'lodash'
import { useI18n } from 'vue-i18n'

import { useLanguagesStore } from '@/store/modules/languages'
import settings from '@/utils/settings'

const props = defineProps({
  language: {
    type: String
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

const shouldDisplayLanguageMessage = computed(() => {
  return languagesStore.ocrAvailable && props.language && !isLanguageAvailable.value
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
  <div
    v-if="languagesStore.fetched"
    class="task-documents-form-ocr-alert"
    spinner-small
  >
    <b-alert
      :model-value="!languagesStore.ocrAvailable"
      lazy
      variant="warning"
      class="mt-3"
    >
      {{ t('taskDocumentsFormOcrAlert.tesseractNotInstalled') }}
    </b-alert>
    <b-alert
      :model-value="shouldDisplayLanguageMessage"
      lazy
      variant="warning"
      class="task-documents-form-ocr-alert__install-ocr-language mt-3"
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
  </div>
</template>
