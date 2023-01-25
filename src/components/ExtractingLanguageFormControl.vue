<script>
import { uniqueId } from 'lodash'

/**
 * A form-control to select the extracting language.
 */
export default {
  name: 'ExtractingLanguageFormControl',
  props: {
    /**
     * Input value
     * @model
     */
    value: {
      type: String
    },
    /**
     * Enable dark mode for this component
     */
    dark: {
      type: Boolean
    }
  },
  data() {
    return {
      textLanguages: [],
      ocrLanguages: []
    }
  },
  computed: {
    nullOption() {
      return { value: null, text: this.$t('extractingLanguageFormControl.nullOption') }
    },
    options() {
      return this.ocrLanguages.map((language) => {
        return { value: language.iso6392, text: this.$t(`filter.lang.${language.name}`) }
      })
    },
    waitIdentifier() {
      return uniqueId('extracting-language-form-control-')
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
        if (this.ocrLanguages.length === 0) {
          this.$emit('ocr-error')
        }
      } catch (e) {
        this.$emit('ocr-error')
        this.$root.$bvToast.toast(this.$t('extractingLanguageFormControl.failedToRetrieveLanguages'), {
          noCloseButton: true,
          variant: 'danger'
        })
      }
      this.$wait.end(this.waitIdentifier)
    }
  }
}
</script>

<template>
  <b-overlay :show="!isReady" :variant="overlayVariant" class="extracting_language_form_control" rounded spinner-small>
    <b-alert
      v-if="ocrLanguages.length === 0"
      show
      variant="danger"
      class="extracting_language_form_control--no-ocr mt-3"
      v-html="$t('extractingLanguageFormControl.noLanguagesAvailable')"
    />
    <b-form-select
      v-else
      :value="value"
      :options="[nullOption, ...options]"
      class="extracting_language_form_control__ocr-options"
      @input="(newValue) => $emit('input', newValue)"
    />
    <b-alert
      show
      variant="info"
      class="extracting_language_form_control__install_ocr mt-3"
      v-html="$t('extractingLanguageFormControl.installOcr', { availableLanguages: textLanguages.length })"
    />
  </b-overlay>
</template>
