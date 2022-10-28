<template>
  <form class="extracting-form position-relative" @submit.prevent="submitExtract">
    <div class="extracting-form__group mb-4">
      <fa icon="folder-open" class="position-absolute mt-1 ml-1" size="lg" />
      <div class="ml-4 pl-3">
        <p class="font-weight-bold mb-0">Which folder do you want to index?</p>
        <p class="small mb-2">The entire Datashare folder will be indexed by default.</p>
        <inline-directory-picker hide-folder-icon dark v-model="path" />
      </div>
    </div>
    <div class="extracting-form__group mb-4">
      <b-form-checkbox v-model="ocr" name="check-button" switch>
        <div class="font-weight-bold ml-1">
          {{ $t('indexing.extractWithOcrLabel') }}
        </div>
        <div class="extracting-form__group__help ml-1 small">
          <span>
            {{ $t('indexing.extractWithOcrHelp') }}
          </span>
        </div>
      </b-form-checkbox>
    </div>
    <div class="extracting-form__group mb-4">
      <b-form-checkbox v-model="filter" name="check-button" switch>
        <div class="font-weight-bold ml-1">
          {{ $t('indexing.extractOnlyNewLabel') }}
        </div>
        <div class="extracting-form__group__help ml-1 small">
          <span>
            {{ $t('indexing.extractOnlyNewHelp') }}
          </span>
        </div>
      </b-form-checkbox>
    </div>
    <div class="extracting-form__group mb-4">
      <fa icon="globe" class="position-absolute mt-1 ml-1" size="lg" />
      <div class="ml-4 pl-3">
        <p class="font-weight-bold">{{ $t('indexing.extractLanguage') }}</p>
        <extracting-language-form-control v-model="language" dark />
      </div>
    </div>
    <div class="extracting-form__footer mt-4 row no-gutters">
      <div class="col text-right">
        <b-btn variant="primary" class="font-weight-bold" type="submit" :disabled="disabled">
          {{ $t('indexing.go') }}
        </b-btn>
      </div>
    </div>
  </form>
</template>

<script>
import { noop } from 'lodash'
import { createHelpers } from 'vuex-map-fields'

import ExtractingLanguageFormControl from './ExtractingLanguageFormControl.vue'
import InlineDirectoryPicker from './InlineDirectoryPicker.vue'

const { mapFields } = createHelpers({
  getterType: 'indexing/getField',
  mutationType: 'indexing/updateField'
})

/**
 * A form to start indexing documents in the data directory.
 */
export default {
  name: 'ExtractingForm',
  components: {
    ExtractingLanguageFormControl,
    InlineDirectoryPicker
  },
  props: {
    /**
     * Callback function to call when the form have been submitted (this should be replaced by an event in future versions).
     */
    finally: {
      type: Function,
      default: noop
    }
  },
  data () {
    return {
      disabled: false
    }
  },
  computed: {
    ...mapFields(['form.filter', 'form.ocr', 'form.path', 'form.language'])
  },
  methods: {
    async submitExtract () {
      this.disabled = true
      try {
        await this.$store.dispatch('indexing/submitExtract')
      } finally {
        this.$store.commit('indexing/resetExtractForm')
        this.finally()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .extracting-form {
    background: darken($primary, 20);
    color: white;
  }
</style>
