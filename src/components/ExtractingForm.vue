<template>
  <form class="extracting-form" id="extracting-form" @submit.prevent="submitExtract">
    <div class="extracting-form__header mb-4">
      <h4>
        {{ $t('indexing.extracting_header') }}
      </h4>
    </div>
    <div class="extracting-form__subheader mb-4" v-if="shouldRender('indexing.extracting_subheader')">
      <span>
        {{ $t('indexing.extracting_subheader') }}
      </span>
    </div>
    <div class="extracting-form__body form-group my-0 pl-4">
      <div class="custom-control custom-radio">
        <input class="custom-control-input" type="radio" id="yes" value="true" v-model="ocr">
        <label class="custom-control-label" for="yes">
          {{ $t('indexing.yes') }}
        </label>
      </div>
      <div class="custom-control custom-radio">
        <input class="custom-control-input" type="radio" id="no" value="false" v-model="ocr">
        <label class="custom-control-label" for="no">
          {{ $t('indexing.no') }}
        </label>
      </div>
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
import { mapState } from 'vuex'
import noop from 'lodash/noop'

const { mapFields } = createHelpers({
  getterType: `indexing/getField`,
  mutationType: `indexing/updateField`
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
    ...mapFields([
      'form.ocr'
    ]),
    ...mapState('search', {
      isIndexEmpty: state => {
        return state.response.hits.length === 0
      }
    })
  },
  methods: {
    submitExtract () {
      this.finally(this.$store.dispatch('indexing/submitExtract').then(() => {
        this.$store.commit('indexing/reset')
      }))
    },
    shouldRender (string) {
      return this.$te(string) && this.$t(string) !== ''
    }
  }
}
</script>

<style lang="scss">
  .extracting-form {
    background: theme-color('icij');
    color: white;

    &__header h4 {
      font-size: 1.2em;
      font-weight: bolder;
    }

    &__subheader {
      font-style: italic;
    }
  }
</style>
