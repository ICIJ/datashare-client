<template>
  <form class="extracting-form position-relative" :class="{ 'extracting-form--dark': dark }"
    @submit.prevent="submitExtract">
    <div v-if="showProjectSelector" class="extracting-form__group mb-4">
      <fa icon="database" class="position-absolute mt-1 ms-1" size="lg" />
      <div class="ms-4 pl-3">
        <p class="fw-bold">{{ $t('indexing.projectIndexationSelection') }}</p>
        <project-selector v-model="defaultProject" />
      </div>
    </div>
    <div class="extracting-form__group mb-4">
      <fa icon="folder-open" class="position-absolute mt-1 ms-1" size="lg" />
      <div class="ms-4 pl-3">
        <p class="fw-bold mb-0">{{ $t('indexing.folderSelection') }}</p>
        <p class="small mb-2">{{ $t('indexing.folderSelectionDescription') }}</p>
        <inline-directory-picker v-model="path" :source-path="sourcePath" :dark="dark" hide-folder-icon />
      </div>
    </div>
    <div class="extracting-form__group mb-4">
      <fa icon="globe" class="position-absolute mt-1 ms-1" size="lg" />
      <div class="ms-4 pl-3">
        <p class="fw-bold">{{ $t('indexing.extractLanguage') }}</p>
        <extracting-language-form-control v-model="language" :dark="dark" />
      </div>
    </div>

    <div class="extracting-form__group mb-4">
      <b-form-checkbox v-model="ocr" name="check-button" :disabled="!hasTesseract" switch>
        <div class="fw-bold ms-1">
          {{ $t('indexing.extractWithOcrLabel') }}
        </div>
        <div class="extracting-form__group__help ms-1 small">
          <span>
            {{ $t('indexing.extractWithOcrHelp') }}
          </span>
        </div>
      </b-form-checkbox>
      <div v-show="showOcrMessage" class="ms-4 pl-3">
        <extracting-form-ocr-control :iso-lang="language" :text-languages="textLanguages" :ocr-languages="ocrLanguages"
          :has-tesseract="hasTesseract" :is-ready="isReady" />
      </div>
    </div>
    <div class="extracting-form__group mb-4">
      <b-form-checkbox v-model="filter" name="check-button" switch>
        <div class="fw-bold ms-1">
          {{ $t('indexing.extractOnlyNewLabel') }}
        </div>
        <div class="extracting-form__group__help ms-1 small">
          <span>
            {{ $t('indexing.extractOnlyNewHelp') }}
          </span>
        </div>
      </b-form-checkbox>
    </div>
    <div class="extracting-form__footer mt-4 row no-gutters">
      <slot name="footer" :disabled="isWaitingForSubmitExtract">
        <div class="col text-right">
          <b-overlay :show="isWaitingForSubmitExtract" opacity="0.6" rounded spinner-small class="d-inline-flex">
            <b-button variant="primary" class="ms-2" type="submit" :disabled="isWaitingForSubmitExtract">
              {{ $t('indexing.go') }}
            </b-button>
          </b-overlay>
        </div>
      </slot>
    </div>
  </form>
</template>

<script>
import { uniqueId, castArray } from 'lodash'
import { waitFor } from 'vue-wait'

import ExtractingLanguageFormControl from '@/components/ExtractingLanguageFormControl'
import ExtractingFormOcrControl from '@/components/ExtractingFormOcrControl'
import InlineDirectoryPicker from '@/components/InlineDirectoryPicker'
import ProjectSelector from '@/components/ProjectSelector'

/**
 * A form to start indexing documents in the data directory.
 */
export default {
  name: 'ExtractingForm',
  components: {
    ExtractingLanguageFormControl,
    InlineDirectoryPicker,
    ExtractingFormOcrControl,
    ProjectSelector
  },
  props: {
    /**
     * Dark mode option
     */
    dark: {
      type: Boolean
    },
    /**
     * Force hiding the project selector input
     */
    hideProjectSelector: {
      type: Boolean,
      default: false
    },
    /**
     * Project name to select in the input instead of default project
     */
    projectName: {
      type: String,
      default: null
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
    ocr: {
      set(value) {
        this.$store.commit('indexing/formOcr', value)
      },
      get() {
        return this.$store.state.indexing.form.ocr
      }
    },
    filter: {
      set(value) {
        this.$store.commit('indexing/formFilter', value)
      },
      get() {
        return this.$store.state.indexing.form.filter
      }
    },
    path: {
      set(value) {
        this.$store.commit('indexing/formPath', value)
      },
      get() {
        return this.$store.state.indexing.form.path
      }
    },
    language: {
      set(value) {
        this.$store.commit('indexing/formLanguage', value)
      },
      get() {
        return this.$store.state.indexing.form.language
      }
    },
    defaultProject: {
      set(value) {
        this.$store.commit('indexing/formDefaultProject', value)
      },
      get() {
        return this.$store.state.indexing.form.defaultProject || this.$config.get('defaultProject')
      }
    },
    sourcePath() {
      const project = this.$core.findProject(this.defaultProject)
      return project?.sourcePath?.split('file://').pop() ?? this.$config.get('dataDir')
    },
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
    await this.loadLanguages()
    // This trick ensure the default project is not null
    // when submiting the form
    this.$store.commit('indexing/formDefaultProject', this.defaultProject)
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
        this.$emit('submit', { error: false })
      } catch (error) {
        this.$emit('submit', { error })
      } finally {
        this.$store.commit('indexing/resetExtractForm')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.extracting-form--dark {
  background: darken($primary, 20);
  color: white;
}
</style>
