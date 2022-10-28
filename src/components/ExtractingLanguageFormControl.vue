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
  data () {
    return {
      languages: []
    }
  },
  async mounted () {
    await this.loadLanguages()
  },
  methods: {
    async loadLanguages () {
      this.$wait.start(this.waitIdentifier)
      this.languages = await this.$core.api.textLanguages()
      this.$wait.end(this.waitIdentifier)
    }
  },
  computed: {
    nullOption () {
      return { value: null, text: this.$t('extractingLanguageFormControlng.nullOption') }
    },
    options () {
      return this.languages.map(language => {
        return { value: language.iso6392, text: this.$t(`filter.lang.${language.name}`) }
      })
    },
    waitIdentifier () {
      return uniqueId('extracting-language-form-control-')
    },
    isReady () {
      return !this.$wait.is(this.waitIdentifier)
    },
    overlayVariant () {
      return this.dark ? 'dark' : 'light'
    }
  }
}
</script>

<template>
  <b-overlay rounded :show="!isReady" :variant="overlayVariant" spinner-small>
    <b-form-select :value="value" @input="newValue => $emit('input', newValue)" :options="[nullOption, ...options]" />
  </b-overlay>
</template>
