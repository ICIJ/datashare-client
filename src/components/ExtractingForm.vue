<template>
  <form class="extracting-form position-relative" @submit.prevent="submitExtract">
    <div class="extracting-form__group mb-4">
      <fa icon="folder-open" class="position-absolute mt-1 ml-1" size="lg" />
      <div class="ml-4 pl-3">
        <p class="font-weight-bold mb-0">Which folder do you want to index?</p>
        <p class="small mb-2">The entire Datashare folder will be indexed by default.</p>
        <inline-directory-picker v-model="path" hide-folder-icon dark />
      </div>
    </div>
    <div class="extracting-form__group mb-4">
      <fa icon="globe" class="position-absolute mt-1 ml-1" size="lg" />
      <div class="ml-4 pl-3">
        <p class="font-weight-bold">{{ $t('indexing.extractLanguage') }}</p>
        <extracting-language-form-control v-model="language" dark />
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
      <div v-show="showOcrMessage" class="ml-4 pl-3">
        <extracting-form-ocr-control
          :iso-lang="language"
          :text-languages="textLanguages"
          :ocr-languages="ocrLanguages"
          :has-tesseract="hasTesseract"
          :is-ready="isReady"
        />
      </div>
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
    <div class="extracting-form__footer mt-4 row no-gutters">
      <div class="col text-right">
        <b-overlay :show="isWaitingForSubmitExtract" opacity="0.6" rounded spinner-small class="d-inline-flex">
          <b-btn variant="primary" class="font-weight-bold" type="submit" :disabled="isWaitingForSubmitExtract">
            {{ $t('indexing.go') }}
          </b-btn>
        </b-overlay>
      </div>
    </div>
  </form>
</template>

<script>
import { noop, uniqueId, castArray } from 'lodash'
import { createHelpers } from 'vuex-map-fields'
import { waitFor } from 'vue-wait'

import ExtractingLanguageFormControl from '@/components/ExtractingLanguageFormControl'
import ExtractingFormOcrControl from '@/components/ExtractingFormOcrControl'
import InlineDirectoryPicker from '@/components/InlineDirectoryPicker'

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
    InlineDirectoryPicker,
    ExtractingFormOcrControl
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
  data() {
    return {
      textLanguages: [],
      ocrLanguages: [],
      hasTesseract: true
    }
  },
  computed: {
    ...mapFields(['form.filter', 'form.ocr', 'form.path', 'form.language']),
    isWaitingForSubmitExtract() {
      return this.$wait.is('submitExtract')
    },
    waitOcrIdentifier() {
      return uniqueId('extracting-form-ocr-control-')
    },
    isReady() {
      return !this.$wait.is(this.waitOcrIdentifier)
    },
    showOcrMessage() {
      return !this.hasTesseract || !!this.ocr
    }
  },
  async mounted() {
    await this.loadLanguages()
  },
  methods: {
    dispatchExtract: waitFor('submitExtract', function () {
      return this.$store.dispatch('indexing/submitExtract')
    }),
    async loadLanguages() {
      this.$wait.start(this.waitOcrIdentifier)
      try {
        const [textLanguages, ocrLanguages] = await Promise.all([
          this.$core.api.textLanguages(),
          this.$core.api.ocrLanguages()
        ])
        this.textLanguages = castArray(textLanguages)
        this.ocrLanguages = castArray(ocrLanguages)
      } catch (e) {
        this.hasTesseract = e.response.status !== 503

        if (this.hasTesseract) {
          this.$root.$bvToast.toast(this.$t('extractingLanguageFormControl.failedToRetrieveLanguages'), {
            noCloseButton: true,
            variant: 'danger'
          })
        }
      }
      this.$wait.end(this.waitOcrIdentifier)
    },
    async submitExtract() {
      try {
        await this.dispatchExtract()
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
