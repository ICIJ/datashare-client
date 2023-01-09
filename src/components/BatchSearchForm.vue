<template>
  <div class="batch-search-form">
    <b-form @submit.prevent="onSubmit">
      <h5 class="py-2 h6 text-uppercase text-muted" v-if="!hideTitle">
        {{ $t('batchSearch.heading') }}
      </h5>
      <div class="card w-100" :class="{ 'border-0': hideBorder }">
        <div class="card-body pb-1">
          <b-form-group label-size="sm" :label="`${$t('batchSearch.name')} *`">
            <b-form-input v-model="name" type="text" required></b-form-input>
          </b-form-group>
          <b-form-group label-size="sm" class="mb-0" :label="`${$t('batchSearch.fileLabel')} *`">
            <template slot="description">
              <div v-html="$t('batchSearch.fileDescription')"></div>
            </template>
            <b-form-file
              v-model="csvFile"
              :placeholder="$t('batchSearch.filePlaceholder')"
              accept=".csv"
              class="text-truncate"
              :state="Boolean(csvFile)"
              no-drop
              required
            ></b-form-file>
          </b-form-group>
          <p class="help small">
            <a
              class="text-muted"
              href="https://icij.gitbook.io/datashare/all/batch-search-documents#write-your-queries-in-a-spreadsheet"
              target="_blank"
            >
              {{ $t('batchSearch.learnMore') }}
            </a>
          </p>
          <b-form-group label-size="sm" :label="$t('batchSearch.description')">
            <b-form-textarea v-model="description" rows="2" max-rows="6"></b-form-textarea>
          </b-form-group>
          <b-form-group label-size="sm" :label="`${$t('batchSearch.projects')} *`" v-if="isServer">
            <div class="batch-search-form__projects container p-0">
              <b-form-checkbox-group v-model="projects" stacked>
                <b-form-checkbox
                  v-for="project in availableProjects"
                  :key="project"
                  :value="project"
                  :disabled="isProjectDisabled(project)"
                >
                  {{ project | startCase }}
                </b-form-checkbox>
              </b-form-checkbox-group>
            </div>
          </b-form-group>
          <b-form-group
            label-size="sm"
            :description="$t('batchSearch.publishedDescription')"
            v-if="isServer"
            class="published"
          >
            <b-form-checkbox v-model="published" switch>
              {{ $t('batchSearch.published') }}
            </b-form-checkbox>
          </b-form-group>
          <div v-b-toggle.advanced-filters class="batch-search-form__advanced-filters my-2">
            <fa :icon="advancedFiltersIcon" class="fa-fw"></fa>
            <span>
              {{ $t('batchSearch.advancedFilters') }}
            </span>
          </div>
          <b-collapse id="advanced-filters" v-model="showAdvancedFilters" class="pt-2">
            <b-form-group label-size="sm" :description="phraseMatchDescription">
              <b-form-checkbox v-model="phraseMatch" switch>
                {{ $t('batchSearch.phraseMatch') }}
              </b-form-checkbox>
            </b-form-group>
            <b-form-group label-size="sm" class="mb-0" :label="fuzzinessLabel" :description="fuzzinessDescription">
              <b-form-input type="number" v-model="fuzziness" min="0" :max="maxFuzziness"></b-form-input>
            </b-form-group>
            <p class="help small">
              <a :href="fuzzinessLearnMore" target="_blank" class="text-muted">
                {{ $t('batchSearch.learnMore') }}
              </a>
            </p>
            <b-form-group label-size="sm" :label="$t('batchSearch.fileTypes')">
              <b-overlay :show="$wait.is('load all file types')" rounded opacity="0.6" spinner-small>
                <b-form-input
                  ref="fileType"
                  v-model="fileType"
                  autocomplete="off"
                  :disabled="$wait.is('load all file types')"
                  @input="searchFileTypes"
                  @keydown.enter.prevent="searchFileType"
                ></b-form-input>
              </b-overlay>
              <selectable-dropdown
                ref="suggestionFileTypes"
                @input="selectFileType"
                @click.native="searchFileType"
                @deactivate="hideSuggestionsFileTypes"
                :hide="!suggestionFileTypes.length"
                :items="suggestionFileTypes"
              >
                <template #item-label="{ item }">
                  <div :id="item.mime">
                    {{ item.label }}
                  </div>
                  <b-tooltip placement="right" :target="item.mime" :title="item.label"></b-tooltip>
                </template>
              </selectable-dropdown>
              <b-badge
                class="mt-2 mr-2 pl-1 batch-search-form__advanced-filters"
                @click.prevent="deleteFileType(index)"
                :key="oneFileType.mime"
                pill
                v-for="(oneFileType, index) in fileTypes"
                variant="warning"
              >
                <fa icon="times-circle"></fa>
                {{ oneFileType.label }}
              </b-badge>
            </b-form-group>
            <b-form-group label-size="sm" :label="$t('batchSearch.path')">
              <div v-b-modal.modal-select-path class="mr-3 py-1 px-2 border btn btn-link">
                {{ $t('batchSearch.selectFolder') }}
              </div>
              <b-modal
                body-class="p-0 border-bottom"
                cancel-variant="outline-primary"
                :cancel-title="$t('global.cancel')"
                hide-header
                id="modal-select-path"
                lazy
                @ok="setPaths()"
                :ok-title="$t('batchSearch.selectFolder')"
                scrollable
                size="lg"
              >
                <tree-view
                  count
                  size
                  @checked="selectedPaths = $event"
                  :projects="projects"
                  selectable
                  :selected-paths="selectedPaths"
                  v-model="path"
                ></tree-view>
              </b-modal>
              <div>
                <b-badge
                  class="mt-2 mr-2 pl-1 batch-search-form__advanced-filters"
                  @click.prevent="deletePath(index)"
                  :key="onePath"
                  pill
                  v-for="(onePath, index) in paths"
                  variant="warning"
                >
                  <fa icon="times-circle"></fa>
                  {{ onePath }}
                </b-badge>
              </div>
            </b-form-group>
          </b-collapse>
        </div>
        <div class="card-footer">
          <div class="d-flex justify-content-end align-items-center">
            <b-button type="submit" variant="primary">
              {{ $t('batchSearch.submit') }}
            </b-button>
          </div>
        </div>
      </div>
    </b-form>
  </div>
</template>

<script>
import {
  compact,
  concat,
  each,
  filter,
  flatten,
  get,
  has,
  includes,
  isEmpty,
  map,
  range,
  startCase,
  uniq
} from 'lodash'
// In order to be mocked in the test class
import throttle from 'lodash/throttle'
import bodybuilder from 'bodybuilder'
import Fuse from 'fuse.js'

import elasticsearch from '@/api/elasticsearch'
import TreeView from '@/components/TreeView'
import utils from '@/mixins/utils'
import types from '@/utils/types.json'

/**
 * A form to create a new batch search.
 */
export default {
  name: 'BatchSearchForm',
  mixins: [utils],
  components: {
    TreeView
  },
  props: {
    /**
     * Disables rendering of the form title
     */
    hideTitle: {
      type: Boolean
    },
    /**
     * Disables rendering of the form border
     */
    hideBorder: {
      type: Boolean
    }
  },
  data() {
    return {
      allFileTypes: [],
      csvFile: null,
      description: '',
      fileType: '',
      fileTypes: [],
      fuzziness: 0,
      name: '',
      path: this.$config.get('mountedDataDir') || this.$config.get('dataDir'),
      paths: [],
      phraseMatch: true,
      projects: [],
      published: true,
      selectedFileType: '',
      selectedPaths: [],
      showAdvancedFilters: false,
      suggestionFileTypes: []
    }
  },
  computed: {
    maxFuzziness() {
      return this.phraseMatch ? 100 : 2
    },
    availableProjects() {
      return this.$core.projects
    },
    phraseMatchDescription() {
      return (
        this.$t('batchSearch.phraseMatchDescription') +
        (this.phraseMatch ? '' : ' ' + this.$t('batchSearch.phraseMatchDescriptionOperators'))
      )
    },
    fuzzinessLabel() {
      return this.phraseMatch ? this.$t('batchSearch.proximitySearches') : this.$t('batchSearch.fuzziness')
    },
    fuzzinessDescription() {
      return this.phraseMatch
        ? this.$t('batchSearch.proximitySearchesDescription')
        : this.$t('batchSearch.fuzzinessDescription')
    },
    fuzzinessLearnMore() {
      return this.phraseMatch
        ? 'https://icij.gitbook.io/datashare/faq-definitions/what-are-proximity-searches'
        : 'https://icij.gitbook.io/datashare/faq-definitions/what-is-fuzziness'
    },
    advancedFiltersIcon() {
      return this.showAdvancedFilters ? 'angle-down' : 'angle-right'
    },
    fuse() {
      const keys = ['extensions', 'label', 'mime']
      const options = { distance: 100, keys, shouldSort: true }
      return new Fuse(this.allFileTypes, options)
    }
  },
  watch: {
    phraseMatch() {
      this.$set(this, 'fuzziness', 0)
    },
    projects() {
      this.$set(this, 'fileType', '')
      this.$set(this, 'fileTypes', [])
      this.$set(this, 'paths', [])
      this.$set(this, 'allFileTypes', [])
      this.hideSuggestionsFileTypes()
      this.retrieveFileTypes()
    },
    showAdvancedFilters() {
      this.retrieveFileTypes()
    }
  },
  created() {
    this.$set(this, 'projects', [this.availableProjects[0]] || [])
  },
  filters: {
    startCase
  },
  methods: {
    verifyQueryLimit(csv) {
      let csvQueries
      const reader = new FileReader()
      reader.readAsBinaryString(csv)
      reader.onload = (event) => {
        csvQueries = this.parseCsvQueries(event.target.result)
        return csvQueries.length >= 3
      }
    },
    parseCsvQueries(queries) {
      const csvData = []
      const lbreak = queries.split('\n')
      lbreak.forEach((res) => {
        csvData.push(res.split(','))
      })
      return csvData
    },
    selectFileType(fileType = null) {
      this.$set(this, 'selectedFileType', fileType || this.selectedFileType)
    },
    searchFileTypes: throttle(function () {
      const fileTypes = this.fuse.search(this.fileType).map(({ item }) => item)
      const fileTypesWithoutSelection = filter(fileTypes, (item) => {
        return !includes(map(this.fileTypes, 'mime'), item.mime)
      })
      this.$set(this, 'suggestionFileTypes', fileTypesWithoutSelection)
    }, 200),
    searchFileType() {
      if (this.selectedFileType) {
        this.fileTypes.push(this.selectedFileType)
        this.hideSuggestionsFileTypes()
        this.$set(this, 'fileType', '')
        if (this.$refs && this.$refs.fileType) this.$refs.fileType.focus()
      }
    },
    hideSuggestionsFileTypes() {
      this.$set(this, 'suggestionFileTypes', [])
    },
    deleteFileType(index) {
      this.fileTypes.splice(index, 1)
    },
    async retrieveFileTypes() {
      if (this.showAdvancedFilters && isEmpty(this.allFileTypes)) {
        this.$wait.start('load all file types')
        const aggTypes = await this.aggregate('contentType', 'contentType')
        each(aggTypes, (aggType) => {
          const extensions = has(types, aggType) ? types[aggType].extensions : []
          const label = has(types, aggType) ? types[aggType].label : aggType
          this.allFileTypes.push({ extensions, label, mime: aggType })
        })
        this.$wait.end('load all file types')
      }
    },
    setPaths() {
      this.$set(this, 'paths', this.selectedPaths)
      this.$set(this, 'path', this.$config.get('mountedDataDir') || this.$config.get('dataDir'))
    },
    deletePath(index) {
      this.paths.splice(index, 1)
    },
    resetForm() {
      this.$set(this, 'csvFile', null)
      this.$set(this, 'description', '')
      this.$set(this, 'fileType', '')
      this.$set(this, 'fileTypes', [])
      this.$set(this, 'fuzziness', 0)
      this.$set(this, 'name', '')
      this.$set(this, 'paths', [])
      this.$set(this, 'phraseMatch', true)
      this.$set(this, 'projects', [this.availableProjects[0]] || [])
      this.$set(this, 'published', true)
      this.$set(this, 'showAdvancedFilters', false)
    },
    async onSubmit() {
      try {
        await this.$store.dispatch('batchSearch/onSubmit', {
          name: this.name,
          csvFile: this.csvFile,
          description: this.description,
          projects: this.projects,
          phraseMatch: this.phraseMatch,
          fuzziness: this.fuzziness,
          fileTypes: this.fileTypes,
          paths: this.paths,
          published: this.published
        })
        this.resetForm()
        if (this.$config.is('manageDocuments')) {
          try {
            await this.$store.dispatch('indexing/runBatchSearch')
            this.$root.$bvToast.toast(this.$t('batchSearch.success'), { noCloseButton: true, variant: 'success' })
          } catch (_) {
            this.manageError(_.response.status, true)
          }
        } else {
          this.$root.$bvToast.toast(this.$t('batchSearch.submitSuccess'), { noCloseButton: true, variant: 'success' })
        }
      } catch (_) {
        this.manageError(_.response.status, false)
      } finally {
        /**
         * The form has been submitted
         */
        this.$emit('submit')
      }
    },
    async aggregate(field, name) {
      let body, options, responses, searchResult
      let after = null
      let result = []
      while (responses === undefined || responses.length === 10) {
        options = after ? { after } : {}
        body = bodybuilder()
          .size(0)
          .agg('composite', { sources: [{ field: { terms: { field } } }] }, options, name)
          .build()
        searchResult = await elasticsearch.search({ index: this.projects.join(','), body })
        after = get(searchResult, ['aggregations', name, 'after_key'], null)
        responses = get(searchResult, ['aggregations', name, 'buckets'], [])
        result = concat(result, map(responses, 'key.field'))
      }
      return result
    },
    buildTreeFromPaths(paths) {
      const tree = map(paths, (path) => {
        const subpath = path.replace(this.$config.get('dataDir', ''), '')
        const split = compact(subpath.split('/'))
        const arr = []
        for (const i in range(0, split.length)) {
          arr.push(split.slice(0, parseInt(i) + 1).join('/'))
        }
        return arr
      })
      return uniq(flatten(tree))
    },
    manageError(errorCode, manageDocuments) {
      if (errorCode === 413) {
        this.$root.$bvToast.toast(this.$t('batchSearch.submitQueryLimitError'), {
          noCloseButton: true,
          variant: 'danger'
        })
      } else if (manageDocuments) {
        this.$root.$bvToast.toast(this.$t('batchSearch.error'), { noCloseButton: true, variant: 'danger' })
      } else {
        this.$root.$bvToast.toast(this.$t('batchSearch.submitError'), { noCloseButton: true, variant: 'danger' })
      }
    },
    isProjectDisabled(project) {
      return this.projects.length === 1 && this.projects[0] === project
    }
  }
}
</script>

<style lang="scss" scoped>
.batch-search-form {
  .form-group small {
    line-height: 1.2;
  }

  &__advanced-filters {
    cursor: pointer;
  }

  .container {
    max-height: 5vw;
    overflow-y: scroll;
  }
}
</style>
