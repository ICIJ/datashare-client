<template>
  <form class="find-named-entities-form" id="find-named-entities-form" @submit.prevent="submitFindNamedEntities">
    <div class="find-named-entities-form__header mb-4">
      <h4>
        {{ $t('indexing.find_named_entities_header') }}
      </h4>
    </div>
    <div class="find-named-entities-form__subheader mb-4">
      <span>
          {{ $t('indexing.find_named_entities_subheader') }}
      </span>
    </div>
    <div class="find-named-entities-form__body form-group mb-4 pl-4">
      <div class="custom-control custom-radio">
        <input class="custom-control-input" type="radio" id="pipeline_corenlp" value="corenlp" v-model="pipeline">
        <label class="custom-control-label" for="pipeline_corenlp">
          {{ $t('indexing.corenlp') }}
          <div class="font-italic small">
            {{ $t('indexing.default') }}
          </div>
        </label>
      </div>
      <div class="custom-control custom-radio">
        <input class="custom-control-input" type="radio" id="pipeline_opennlp" value="opennlp" v-model="pipeline">
        <label class="custom-control-label" for="pipeline_opennlp">
          {{ $t('indexing.opennlp') }}
        </label>
      </div>
      <div class="custom-control custom-radio">
        <input class="custom-control-input" type="radio" id="pipeline_mitie" value="mitie" v-model="pipeline">
        <label class="custom-control-label" for="pipeline_mitie">
          {{ $t('indexing.mitie') }}
        </label>
      </div>
      <div class="custom-control custom-radio">
        <input class="custom-control-input" type="radio" id="pipeline_ixapipe" value="ixapipe" v-model="pipeline">
        <label class="custom-control-label" for="pipeline_ixapipe">
          {{ $t('indexing.ixapipe') }}
        </label>
      </div>
      <div class="custom-control custom-radio">
        <input class="custom-control-input" type="radio" id="pipeline_email" value="email" v-model="pipeline">
        <label class="custom-control-label" for="pipeline_email">
          {{ $t('indexing.email') }}
        </label>
      </div>
    </div>
    <div class="find-named-entities-form__offline form-group pl-4" v-if="!isServer">
      <b-form-checkbox id="syncModels" v-model="offline">
        {{ $t('indexing.sync_models') }}
      </b-form-checkbox>
    </div>
    <div class="find-named-entities-form__footer mt-4 row no-gutters">
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
import utils from '@/mixins/utils'
import noop from 'lodash/noop'

const { mapFields } = createHelpers({
  getterType: `indexing/getField`,
  mutationType: `indexing/updateField`
})

export default {
  name: 'FindNamedEntitiesForm',
  mixins: [utils],
  props: {
    finally: {
      type: Function,
      default: noop
    }
  },
  computed: {
    ...mapFields([
      'form.pipeline',
      'form.offline'
    ])
  },
  methods: {
    submitFindNamedEntities () {
      this.finally(this.$store.dispatch('indexing/submitFindNamedEntities').then(() => {
        this.$store.dispatch('indexing/resetFindNamedEntitiesForm')
      }))
    }
  }
}

</script>

<style lang="scss">
  .find-named-entities-form {
    background: darken($primary, 20);
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
