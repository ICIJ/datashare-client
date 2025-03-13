<script>
import { uniqueId } from 'lodash'

import AppOverlay from '@/components/AppOverlay/AppOverlay'

/**
 * A form-control to select the extracting language.
 */
export default {
  name: 'FormControlExtractingLanguage',
  components: {
    AppOverlay
  },
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
      return { value: null, text: this.$t('formControlExtractingLanguage.nullOption') }
    },
    options() {
      return this.textLanguages.map((language) => {
        return { value: language.iso6392, text: this.$t(`filter.lang.${language.name}`) }
      })
    },
    waitIdentifier() {
      return uniqueId('form-control-extracting-language-')
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
        this.$toast.error(this.$t('formControlExtractingLanguage.failedToRetrieveLanguages'))
      }
      this.$wait.end(this.waitIdentifier)
    }
  }
}
</script>

<template>
  <app-overlay :show="!isReady" class="form-control-extracting-language" rounded spinner-small>
    <b-alert
      v-if="isReady && hasTextLanguages"
      model-value
      variant="danger"
      class="form-control-extracting-language--no-language m-0"
    >
      {{ $t('formControlExtractingLanguage.failedToRetrieveLanguages') }}
    </b-alert>
    <b-form-group v-else>
      <b-form-select
        :model-value="modelValue"
        :options="[nullOption, ...options]"
        class="form-control-extracting-language__ocr-options"
        @update:modelValue="(newValue) => $emit('update:modelValue', newValue)"
      />
    </b-form-group>
  </app-overlay>
</template>
