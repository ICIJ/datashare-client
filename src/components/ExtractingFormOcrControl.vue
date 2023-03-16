<script>
import { find, uniqueId } from 'lodash'

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
    }
  },
  data() {
    return {
      textLanguages: [],
      ocrLanguages: [],
      hasTesseract: true
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
      return !!find(this.ocrLanguages, (language) => language.iso6392 === this.isoLang)
    },
    isOcrLanguage() {
      return !this.isoLang || this.isLanguageAvailable
    },
    shouldDisplayLanguageMessage() {
      return this.hasTesseract && !this.isOcrLanguage
    },
    waitIdentifier() {
      return uniqueId('extracting-form-ocr-control-')
    },
    isReady() {
      return !this.$wait.is(this.waitIdentifier)
    },
    overlayVariant() {
      return this.dark ? 'dark' : 'light'
    }
  },
  async mounted() {
    await this.loadLanguages()
  },
  methods: {
    async loadLanguages() {
      this.$wait.start(this.waitIdentifier)
      try {
        const [textLanguages, ocrLanguages] = await Promise.all([
          this.$core.api.textLanguages(),
          this.$core.api.ocrLanguages()
        ])
        this.textLanguages = textLanguages
        this.ocrLanguages = ocrLanguages
      } catch (e) {
        this.hasTesseract = e.response.status !== 503

        if (this.hasTesseract) {
          this.$root.$bvToast.toast(this.$t('extractingLanguageFormControl.failedToRetrieveLanguages'), {
            noCloseButton: true,
            variant: 'danger'
          })
        }
      }
      this.$wait.end(this.waitIdentifier)
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

      <a href="https://icij.gitbook.io/datashare/all/analyze-documents-in-more-languages" target="_blank">
        {{ $t('extractingFormOcrControl.installOcrLanguage', { availableLanguages: textLanguages.length }) }}
      </a>
    </b-alert>
  </b-overlay>
</template>
