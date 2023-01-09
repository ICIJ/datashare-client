<script>
import { find, uniqueId } from 'lodash'

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
     * Enable warning when the OCR language is not available
     */
    ocrWarning: {
      type: Boolean
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
  async mounted() {
    await this.loadLanguages()
  },
  methods: {
    async loadLanguages() {
      this.$wait.start(this.waitIdentifier)
      this.textLanguages = await this.$core.api.textLanguages()
      this.ocrLanguages = await this.$core.api.ocrLanguages()
      this.$wait.end(this.waitIdentifier)
    }
  },
  computed: {
    nullOption() {
      return { value: null, text: this.$t('extractingLanguageFormControl.nullOption') }
    },
    options() {
      return this.textLanguages.map((language) => {
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
    },
    isOcrLanguageAvailable() {
      return !!find(this.ocrLanguages, { iso6392: this.value })
    },
    showOcrWarning() {
      return this.ocrWarning && this.value && !this.isOcrLanguageAvailable
    }
  }
}
</script>

<template>
  <b-overlay rounded :show="!isReady" :variant="overlayVariant" spinner-small>
    <b-form-select :value="value" @input="(newValue) => $emit('input', newValue)" :options="[nullOption, ...options]" />
    <b-collapse :visible="showOcrWarning">
      <b-alert show variant="warning" class="mt-3" v-html="$t('extractingLanguageFormControl.ocrWarning')" />
    </b-collapse>
  </b-overlay>
</template>
