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
    modelValue: {
      type: String
    }
  },
  emits: ['update:modelValue'],
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
    hasTextLanguages() {
      return !this.textLanguages.length
    }
  },
  async mounted() {
    return this.loadLanguages()
  },
  methods: {
    async loadLanguages() {
      this.$wait.start(this.waitIdentifier)
      try {
        this.textLanguages = await this.$core.api.textLanguages()
      } catch (e) {
        this.$toast.error(this.$t('extractingLanguageFormControl.failedToRetrieveLanguages'))
      }
      this.$wait.end(this.waitIdentifier)
    }
  }
}
</script>

<template>
  <b-overlay :show="!isReady" class="extracting-language-form-control" rounded spinner-small>
    <b-alert
      v-if="isReady && hasTextLanguages"
      model-value
      variant="danger"
      class="extracting-language-form-control--no-language m-0"
    >
      {{ $t('extractingLanguageFormControl.failedToRetrieveLanguages') }}
    </b-alert>
    <b-form-group v-else>
      <b-form-select
        :model-value="modelValue"
        :options="[nullOption, ...options]"
        class="extracting-language-form-control__ocr-options p-3"
        @update:modelValue="(newValue) => $emit('update:modelValue', newValue)"
    /></b-form-group>
  </b-overlay>
</template>
