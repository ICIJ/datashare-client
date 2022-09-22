<template>
  <v-wait for="load ner pipelines">
    <fa icon="circle-notch" slot="waiting" spin size="2x" class="d-flex mx-auto my-5 text-light" />
    <form class="find-named-entities-form position-relative" @submit.prevent="submitFindNamedEntities">
      <fa icon="tags" class="position-absolute mt-1 ml-1" size="lg" />
      <div class="ml-4 pl-3">
        <p class="find-named-entities-form__header font-weight-bold mb-0">
          {{ $t('indexing.findNamedEntitiesHeader') }}
        </p>
        <div class="find-named-entities-form__body form-group mb-4">
          <p class="mb-2 small">
            {{ $t('indexing.findNamedEntitiesSubheader') }}
          </p>
          <fieldset class="list-group">
            <div class="list-group-item bg-transparent border-light"
                            v-for="(translationReference, pip) in pipelines"
                            :key="pip">
              <b-form-radio name="pipeline"
                            v-model="pipeline"
                            :value="pip">
                {{ $t(`${translationReference}`) }}
                <div class="font-italic small" v-if="pip === 'corenlp'">
                  {{ $t('indexing.default') }}
                </div>
              </b-form-radio>
            </div>
          </fieldset>
        </div>
      </div>
      <div class="find-named-entities-form__offline form-group" v-if="$config.is('manageDocuments')">
        <b-form-checkbox v-model="offline" switch>
          <div class="font-weight-bold ml-1">
            {{ $t('indexing.syncModelsLabel') }}
          </div>
          <div class="ml-1 small">
            {{ $t('indexing.syncModels') }}
          </div>
        </b-form-checkbox>
      </div>
      <div class="find-named-entities-form__footer mt-4 row no-gutters">
        <div class="col text-right">
          <b-btn variant="primary" class="font-weight-bold" type="submit" :disabled="disabled">
            {{ $t('indexing.go') }}
          </b-btn>
        </div>
      </div>
    </form>
  </v-wait>
</template>

<script>
import { lowerCase, noop, startCase, map } from 'lodash'
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
      pipelines: [],
      disabled: false
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
      this.disabled = true
      try {
        await this.$store.dispatch('indexing/submitFindNamedEntities')
      } finally {
        this.$store.commit('indexing/resetFindNamedEntitiesForm')
        this.finally()
      }
    },
    handlePipelinesTranslation (pipelines) {
      const translationsMap = {}
      pipelines.forEach((pip) => {
        translationsMap[pip] = `indexing.pipelineOptions.${pip}`
      })
      return translationsMap
    }
  },
  async mounted () {
    this.$wait.start('load ner pipelines')
    let pipelines = await this.$store.dispatch('indexing/getNerPipelines')
    pipelines = map(pipelines, lowerCase)
    this.$set(this, 'pipelines', this.handlePipelinesTranslation(pipelines))
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
