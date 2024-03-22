<template>
  <v-wait for="load ner pipelines">
    <template #waiting>
      <fa icon="circle-notch" spin size="2x" class="d-flex mx-auto my-5 text-light" />
    </template>
    <form
      class="find-named-entities-form position-relative"
      :class="{ 'find-named-entities-form--dark': dark }"
      @submit.prevent="submitFindNamedEntities"
    >
      <div v-if="showProjectSelector" class="find-named-entities-form__group mb-4">
        <fa icon="database" class="position-absolute mt-1 ms-1" size="lg" />
        <div class="ms-4 pl-3">
          <p class="fw-bold">
            {{ $t('indexing.findNamedEntitiesProjectSelection') }}
          </p>
          <project-selector v-model="defaultProject" />
        </div>
      </div>
      <div class="find-named-entities-form__group mb-4">
        <fa icon="tags" class="position-absolute mt-1 ms-1" size="lg" />
        <div class="ms-4 pl-3">
          <p class="find-named-entities-form__header fw-bold mb-0">
            {{ $t('indexing.findNamedEntitiesHeader') }}
          </p>
          <div class="find-named-entities-form__body form-group mb-4">
            <p class="mb-2 small">
              {{ $t('indexing.findNamedEntitiesSubheader') }}
            </p>
            <fieldset class="list-group">
              <div
                v-for="(translationReference, pip) in pipelines"
                :key="pip"
                class="list-group-item bg-transparent border-light"
              >
                <b-form-radio v-model="pipeline" name="pipeline" :value="pip.toUpperCase()">
                  {{ $t(`${translationReference}`) }}
                  <div v-if="pip.toUpperCase() === 'CORENLP'" class="font-italic small">
                    {{ $t('indexing.default') }}
                  </div>
                </b-form-radio>
              </div>
            </fieldset>
          </div>
        </div>
      </div>
      <div class="find-named-entities-form__offline form-group">
        <b-form-checkbox v-model="offline" switch>
          <div class="fw-bold ms-1">
            {{ $t('indexing.syncModelsLabel') }}
          </div>
          <div class="ms-1 small">
            {{ $t('indexing.syncModels') }}
          </div>
        </b-form-checkbox>
      </div>
      <div class="find-named-entities-form__footer mt-4 row no-gutters">
        <slot name="footer" :disabled="disabled">
          <div class="col text-end">
            <b-button variant="primary" class="fw-bold" type="submit" :disabled="disabled">
              {{ $t('indexing.go') }}
            </b-button>
          </div>
        </slot>
      </div>
    </form>
  </v-wait>
</template>

<script>
import { lowerCase, startCase, values } from 'lodash'

import ProjectSelector from '@/components/ProjectSelector'
import utils from '@/mixins/utils'

/**
 * A form to start indexing named entities in indexed documents.
 */
export default {
  name: 'FindNamedEntitiesForm',
  components: {
    ProjectSelector
  },
  filters: {
    lowerCase,
    startCase
  },
  mixins: [utils],
  props: {
    /**
     * Dark mode background option
     */
    dark: {
      type: Boolean
    },
    /**
     * Project name to select in the input instead of default project
     */
    projectName: {
      type: String,
      default: null
    },
    /**
     * Force hiding the project selector input
     */
    hideProjectSelector: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      pipelines: []
    }
  },
  computed: {
    disabled() {
      return !this.pipeline && (!this.$wait.waiting('load ner pipelines') || !this.$wait.waiting('launch ner task'))
    },
    offline: {
      set(value) {
        this.$store.commit('indexing/formOffline', value)
      },
      get() {
        return this.$store.state.indexing.form.offline
      }
    },
    pipeline: {
      set(value) {
        this.$store.commit('indexing/formPipeline', value)
      },
      get() {
        return this.$store.state.indexing.form.pipeline?.toUpperCase()
      }
    },
    defaultProject: {
      set(value) {
        this.$store.commit('indexing/formDefaultProject', value)
      },
      get() {
        return this.projectName || this.$store.state.indexing.form.defaultProject || this.$config.get('defaultProject')
      }
    },
    showProjectSelector() {
      return !this.hideProjectSelector && (this.hasSeveralProjects || this.nonDefaultProjectSelected)
    },
    hasSeveralProjects: {
      cache: false,
      get() {
        return this.$core.projects.length > 1
      }
    },
    nonDefaultProjectSelected() {
      return this.defaultProject !== this.$config.get('defaultProject')
    }
  },
  async mounted() {
    if (this.$core.findProject(this.projectName)) {
      this.defaultProject = this.projectName
    }
    this.$wait.start('load ner pipelines')
    const pipelines = await this.$store.dispatch('indexing/getNerPipelines')
    this.$set(this, 'pipelines', this.handlePipelinesTranslation(values(pipelines).map(lowerCase)))
    this.$wait.end('load ner pipelines')
  },
  methods: {
    async submitFindNamedEntities() {
      try {
        this.$wait.start('launch ner task')
        await this.$store.dispatch('indexing/submitFindNamedEntities')
        this.$emit('submit', { error: false })
      } catch (error) {
        this.$emit('submit', { error })
      } finally {
        this.$wait.end('launch ner task')
        this.$store.commit('indexing/resetFindNamedEntitiesForm')
      }
    },
    handlePipelinesTranslation(pipelines) {
      const translationsMap = {}
      pipelines.forEach((pip) => {
        translationsMap[pip] = `indexing.pipelineOptions.${pip}`
      })
      return translationsMap
    }
  }
}
</script>

<style lang="scss" scoped>
.find-named-entities-form {
  &--dark {
    background: darken($primary, 20);
    color: white;
  }

  &__header h4 {
    font-size: 1.2em;
    font-weight: bolder;
  }

  &__subheader {
    font-style: italic;
  }
}
</style>
