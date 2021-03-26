<template>
  <v-wait for="load ner pipelines">
    <fa icon="circle-notch" slot="waiting" spin size="2x" class="d-flex mx-auto mt-5"></fa>
    <form class="find-named-entities-form" id="find-named-entities-form" @submit.prevent="submitFindNamedEntities">
      <div class="find-named-entities-form__header mb-4">
        <h4>
          {{ $t('indexing.findNamedEntitiesHeader') }}
        </h4>
      </div>
      <div class="find-named-entities-form__subheader mb-4">
        <span>
          {{ $t('indexing.findNamedEntitiesSubheader') }}
        </span>
      </div>
      <div class="find-named-entities-form__body form-group mb-4 pl-4">
        <div class="custom-control custom-radio" v-for="pip in pipelines" :key="pip">
          <input class="custom-control-input" type="radio" :id="pip" :value="pip" v-model="pipeline">
          <label class="custom-control-label" :for="pip">
            {{ pip | lowerCase | startCase }}
            <div class="font-italic small" v-if="pip === 'CORENLP'">
              {{ $t('indexing.default') }}
            </div>
          </label>
        </div>
      </div>
      <div class="find-named-entities-form__offline form-group pl-4" v-if="$config.is('manageDocuments')">
        <b-form-checkbox id="syncModels" v-model="offline">
          {{ $t('indexing.syncModels') }}
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
  </v-wait>
</template>

<script>
import { lowerCase, noop, startCase } from 'lodash'
import { createHelpers } from 'vuex-map-fields'

import utils from '@/mixins/utils'

const { mapFields } = createHelpers({
  getterType: 'indexing/getField',
  mutationType: 'indexing/updateField'
})

/**
 * A form to start indexing named entities in indexed documents.
 */
export default {
  name: 'FindNamedEntitiesForm',
  mixins: [utils],
  props: {
    /**
     * Callback function to call when the form have been submitted (this should be replaced by an event in future versions).
     */
    finally: {
      type: Function,
      default: noop
    }
  },
  filters: {
    lowerCase,
    startCase
  },
  data () {
    return {
      pipelines: []
    }
  },
  computed: {
    ...mapFields([
      'form.offline',
      'form.pipeline'
    ])
  },
  methods: {
    async submitFindNamedEntities () {
      await this.$store.dispatch('indexing/submitFindNamedEntities')
      this.$store.commit('indexing/resetFindNamedEntitiesForm')
      this.finally()
    }
  },
  async mounted () {
    this.$wait.start('load ner pipelines')
    const pipelines = await this.$store.dispatch('indexing/getNerPipelines')
    this.$set(this, 'pipelines', pipelines)
    this.$wait.end('load ner pipelines')
  }
}

</script>

<style lang="scss" scoped>
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
