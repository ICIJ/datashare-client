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
        this.$toast.error(this.$t('extractingLanguageFormControl.failedToRetrieveLanguages'))
      }
      this.$wait.end(this.waitIdentifier)
    }
  }
}
</script>

<template>
  <b-overlay :show="!isReady" class="extracting-language-form-control" rounded spinner-small>
    <div v-if="!textLanguages.length" class="extracting-language-form-control--no-language mt-3 alert alert-danger">
      {{ $t('extractingLanguageFormControl.failedToRetrieveLanguages') }}
    </div>
    <b-form-select
      v-else
      :model-value="modelValue"
      :options="[nullOption, ...options]"
      class="extracting-language-form-control__ocr-options"
      @update:modelValue="(newValue) => $emit('update:modelValue', newValue)"
    />
  </b-overlay>
</template>
