<script>
import { some, get, find } from 'lodash'

import settings from '@/utils/settings'

/**
 * A form-control to select the extracting language.
 */
export default {
  name: 'ExtractingFormOcrControl',
  props: {
    /**
     * Input value
     * @model
     */
    isoLang: {
      type: String
    },
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
    isReady: {
      type: Boolean
    },
    dark: {
      type: Boolean
    }
  },
  computed: {
    languageName() {
      if (this.isoLang) {
        const name = find(this.textLanguages, (language) => language.iso6392 === this.isoLang)?.name
        return this.$t(`filter.lang.${name}`)
      }
      return 'default'
    },
    isLanguageAvailable() {
      return some(this.ocrLanguages, ({ name, iso6392 }) => {
        return this.sameLanguage(name) || this.sameLanguage(iso6392)
      })
    },
    isOcrLanguage() {
      return !this.isoLang || this.isLanguageAvailable
    },
    shouldDisplayLanguageMessage() {
      return this.hasTesseract && !this.isOcrLanguage
    },
    overlayVariant() {
      return this.dark ? 'dark' : 'light'
    }
  },
  methods: {
    toTesseractCode(name) {
      return get(settings, ['iso6392', 'tesseract', name], name)
    },
    sameLanguage(nameOrIso6392) {
      return this.toTesseractCode(nameOrIso6392) === this.toTesseractCode(this.isoLang)
    }
  }
}
</script>

<template>
  <b-overlay :show="!isReady" :variant="overlayVariant" class="extracting_language_form_control" rounded spinner-small>
    <b-alert
      :show="!hasTesseract"
      variant="warning"
      class="extracting_language_form_control__tesseract_not_installed mt-3"
      >{{ $t('extractingFormOcrControl.tesseractNotInstalled') }}
    </b-alert>
    <b-alert
      :show="shouldDisplayLanguageMessage"
      variant="warning"
      class="extracting_language_form_control__install_ocr_language mt-3"
      >{{ $t('extractingFormOcrControl.isMissing', { language: languageName }) }}
      {{ $t('extractingFormOcrControl.useDefault') }}

      <a href="https://icij.gitbook.io/datashare/local-mode/add-more-languages" target="_blank">
        {{ $t('extractingFormOcrControl.installOcrLanguage', { availableLanguages: textLanguages.length }) }}
      </a>
    </b-alert>
  </b-overlay>
</template>
