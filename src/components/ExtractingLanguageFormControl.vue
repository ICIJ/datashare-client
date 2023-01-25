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
      textLanguages: []
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
    }
  },
  async mounted() {
    await this.loadLanguages()
  },
  methods: {
    async loadLanguages() {
      this.$wait.start(this.waitIdentifier)
      try {
        this.textLanguages = await this.$core.api.textLanguages()
      } catch (e) {
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
      v-if="!textLanguages.length"
      show
      variant="danger"
      class="extracting_language_form_control--no-language mt-3"
      >{{ $t('extractingLanguageFormControl.failedToRetrieveLanguages') }}</b-alert
    >
    <b-form-select
      v-else
      :value="value"
      :options="[nullOption, ...options]"
      class="extracting_language_form_control__ocr-options"
      @input="(newValue) => $emit('input', newValue)"
    />
  </b-overlay>
</template>
