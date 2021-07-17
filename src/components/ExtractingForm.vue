<template>
  <form class="extracting-form" id="extracting-form" @submit.prevent="submitExtract">
    <div class="extracting-form__group mb-4">
      <b-form-checkbox v-model="ocr" name="check-button" switch>
        <div class="font-weight-bold ml-2">
          {{ $t('indexing.extractWithOcrLabel') }}
        </div>
        <div class="extracting-form__group__help ml-2 small">
          <span>
            {{ $t('indexing.extractWithOcrHelp') }}
          </span>
        </div>
      </b-form-checkbox>
    </div>
    <div class="extracting-form__group">
      <b-form-checkbox v-model="filter" name="check-button" switch>
        <div class="font-weight-bold ml-2">
          {{ $t('indexing.extractOnlyNewLabel') }}
        </div>
        <div class="extracting-form__group__help ml-2 small">
          <span>
            {{ $t('indexing.extractOnlyNewHelp') }}
          </span>
        </div>
      </b-form-checkbox>
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

const { mapFields } = createHelpers({
  getterType: 'indexing/getField',
  mutationType: 'indexing/updateField'
})

/**
 * A form to start indexing documents in the data directory.
 */
export default {
  name: 'ExtractingForm',
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
    ...mapFields(['form.filter', 'form.ocr'])
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
