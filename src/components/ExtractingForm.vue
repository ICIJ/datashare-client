<template>
  <form class="extracting-form" id="extracting-form" @submit.prevent="submitExtract">

    <div class="extracting-form__group mb-4">
      <b-form-checkbox v-model="ocr" name="check-button" switch>
        <div class="font-weight-bold ml-2">
          {{ $t('indexing.extract_with_ocr_label') }}
        </div>
        <div class="extracting-form__group__help ml-2 small">
          <span>
            {{ $t('indexing.extract_with_ocr_help') }}
          </span>
        </div>
      </b-form-checkbox>
    </div>

    <div class="extracting-form__group">
      <b-form-checkbox v-model="filter" name="check-button" switch>
        <div class="font-weight-bold ml-2">
          {{ $t('indexing.extract_only_new_label') }}
        </div>
        <div class="extracting-form__group__help ml-2 small">
          <span>
            {{ $t('indexing.extract_only_new_help') }}
          </span>
        </div>
      </b-form-checkbox>
    </div>

    <div class="extracting-form__footer mt-4 row no-gutters">
      <div class="col text-right">
        <button class="btn btn-primary font-weight-bold" type="submit">
          {{ $t('indexing.go') }}
        </button>
      </div>
    </div>
  </form>
</template>

<script>
import { createHelpers } from 'vuex-map-fields'
import noop from 'lodash/noop'

const { mapFields } = createHelpers({
  getterType: 'indexing/getField',
  mutationType: 'indexing/updateField'
})

export default {
  name: 'ExtractingForm',
  props: {
    finally: {
      type: Function,
      default: noop
    }
  },
  computed: {
    ...mapFields(['form.ocr', 'form.filter'])
  },
  methods: {
    async submitExtract () {
      await this.$store.dispatch('indexing/submitExtract')
      this.$store.dispatch('indexing/resetExtractForm')
      this.finally()
    }
  }
}
</script>

<style lang="scss">
  .extracting-form {
    background: darken($primary, 20);
    color: white;
  }
</style>
