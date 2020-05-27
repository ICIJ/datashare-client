<template>
  <div class="batch-search-form">
    <b-form @submit.prevent="onSubmit">
      <h5 class="py-2 h6 text-uppercase text-muted" v-if="!hideTitle">
        {{ $t('batchSearch.heading') }}
      </h5>
      <div class="card w-100" :class="{ 'border-0': hideBorder }">
        <div class="card-body pb-1">
          <b-form-group
            label-size="sm"
            :label="`${$t('batchSearch.name')} *`">
            <b-form-input
              v-model="name"
              type="text"
              required />
          </b-form-group>
          <b-form-group
            label-size="sm"
            class="mb-0"
            :label="`${$t('batchSearch.fileLabel')} *`"
            :description="$t('batchSearch.fileDescription')">
            <b-form-file
              v-model="csvFile"
              :placeholder="$t('batchSearch.filePlaceholder')"
              accept=".csv"
              class="text-truncate"
              required />
          </b-form-group>
          <p class="help small">
            <a
              class="text-muted"
              href="https://icij.gitbook.io/datashare/all/batch-search-documents#write-your-queries-in-a-spreadsheet"
              target="_blank">
              {{ $t('batchSearch.learnMore') }}
            </a>
          </p>
          <b-form-group
            label-size="sm"
            :label="$t('batchSearch.description')">
            <b-form-textarea
              v-model="description"
              rows="2"
              max-rows="6" />
          </b-form-group>
          <b-form-group
            label-size="sm"
            :label="`${$t('batchSearch.project')} *`"
            v-if="$config.is('multipleProjects')">
            <b-form-select
              v-model="project"
              :options="projects"
              required />
          </b-form-group>
          <b-form-group
            label-size="sm"
            :description="$t('batchSearch.publishedDescription')"
            v-if="$config.is('multipleProjects')"
            class="published">
            <b-form-checkbox
              v-model="published"
              switch>
              {{ $t('batchSearch.published') }}
            </b-form-checkbox>
          </b-form-group>
          <div v-b-toggle.advanced-filters class="batch-search-form__advanced-filters my-2">
            <fa :icon="advancedFiltersIcon" class="fa-fw" />
            <span>
              {{ $t('batchSearch.advancedFilters') }}
            </span>
          </div>
          <b-collapse id="advanced-filters" v-model="showAdvancedFilters" class="pt-2">
            <b-form-group
              label-size="sm"
              :description="phraseMatchDescription">
              <b-form-checkbox
                v-model="phraseMatch"
                switch>
                {{ $t('batchSearch.phraseMatch') }}
              </b-form-checkbox>
            </b-form-group>
            <b-form-group
              label-size="sm"
              class="mb-0"
              :label="fuzzinessLabel"
              :description="fuzzinessDescription">
              <b-form-input
                type="number"
                v-model="fuzziness"
                min="0"
                :max="maxFuzziness" />
            </b-form-group>
            <p class="help small">
              <a :href="fuzzinessLearnMore" target="_blank" class="text-muted">
                {{ $t('batchSearch.learnMore') }}
              </a>
            </p>
            <b-form-group
              label-size="sm"
              :label="$t('batchSearch.fileTypes')">
              <v-wait for="load all file types">
                <fa icon="circle-notch" slot="waiting" spin size="2x" class="d-flex mx-auto my-3" />
                <b-form-input
                  v-model="fileType"
                  @input="searchFileTypes"
                  autocomplete="off"
                  ref="fileType"
                  @keydown.enter.prevent="searchFileType" />
              </v-wait>
              <selectable-dropdown
                ref="suggestionFileTypes"
                @input="selectFileType"
                @click.native="searchFileType"
                @deactivate="hideSuggestionsFileTypes"
                :hide="!suggestionFileTypes.length"
                :items="suggestionFileTypes">
                <template v-slot:item-label="{ item }">
                  <div :id="item.mime">
                    {{ item.label }}
                  </div>
                  <b-tooltip placement="right" :target="item.mime" :title="item.label" />
                </template>
              </selectable-dropdown>
              <b-badge
                class="mt-2 mr-2 pl-1 batch-search-form__advanced-filters"
                @click.prevent="deleteFileType(index)"
                :key="fileType.mime"
                pill
                v-for="(fileType, index) in fileTypes"
                variant="warning">
                <fa icon="times-circle" />
                {{ fileType.label }}
              </b-badge>
            </b-form-group>
            <b-form-group
              label-size="sm"
              :label="$t('batchSearch.path')">
              <v-wait for="load all paths">
                <fa icon="circle-notch" slot="waiting" spin size="2x" class="d-flex mx-auto my-3" />
                <b-form-input
                  autocomplete="off"
                  @input="searchPaths"
                  ref="path"
                  v-model="path"
                  @keydown.enter.prevent="searchPath">
                </b-form-input>
              </v-wait>
              <selectable-dropdown
                ref="suggestionPaths"
                @input="selectPath"
                @click.native="searchPath"
                @deactivate="hideSuggestionsPaths"
                :hide="!suggestionPaths.length"
                :items="suggestionPaths">
                <template v-slot:item-label="{ item }">
                  <div :id="item">
                    {{ item }}
                  </div>
                  <b-tooltip placement="right" :target="item" :title="item" />
                </template>
              </selectable-dropdown>
              <b-badge
                class="mt-2 mr-2 pl-1 batch-search-form__advanced-filters"
                @click.prevent="deletePath(index)"
                :key="path"
                pill
                v-for="(path, index) in paths"
                variant="warning">
                <fa icon="times-circle" />
                {{ path }}
              </b-badge>
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
import compact from 'lodash/compact'
import concat from 'lodash/concat'
import each from 'lodash/each'
import filter from 'lodash/filter'
import flatten from 'lodash/flatten'
import get from 'lodash/get'
import has from 'lodash/has'
import includes from 'lodash/includes'
import isEmpty from 'lodash/isEmpty'
import map from 'lodash/map'
import range from 'lodash/range'
import throttle from 'lodash/throttle'
import uniq from 'lodash/uniq'
import bodybuilder from 'bodybuilder'
import Fuse from 'fuse.js'

import elasticsearch from '@/api/elasticsearch'
import types from '@/utils/types.json'

/**
 * A form to create a batch search.
 */
export default {
  name: 'BatchSearchForm',
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
  data () {
    return {
      allFileTypes: [],
      allPaths: [],
      csvFile: null,
      description: '',
      fileType: '',
      fileTypes: [],
      fuzziness: 0,
      name: '',
      path: '',
      paths: [],
      phraseMatch: true,
      project: '',
      projects: [],
      published: true,
      selectedFileType: '',
      selectedPath: '',
      showAdvancedFilters: false,
      suggestionFileTypes: [],
      suggestionPaths: []
    }
  },
  computed: {
    maxFuzziness () {
      return this.phraseMatch ? 100 : 2
    },
    phraseMatchDescription () {
      return this.$t('batchSearch.phraseMatchDescription') + (this.phraseMatch ? '' : ' ' + this.$t('batchSearch.phraseMatchDescriptionOperators'))
    },
    fuzzinessLabel () {
      return this.phraseMatch ? this.$t('batchSearch.proximitySearches') : this.$t('batchSearch.fuzziness')
    },
    fuzzinessDescription () {
      return this.phraseMatch ? this.$t('batchSearch.proximitySearchesDescription') : this.$t('batchSearch.fuzzinessDescription')
    },
    fuzzinessLearnMore () {
      return this.phraseMatch ? 'https://icij.gitbook.io/datashare/faq-definitions/what-are-proximity-searches' : 'https://icij.gitbook.io/datashare/faq-definitions/what-is-fuzziness'
    },
    advancedFiltersIcon () {
      return this.showAdvancedFilters ? 'angle-down' : 'angle-right'
    },
    fuse () {
      const keys = ['extensions', 'label', 'mime']
      const options = { distance: 100, keys, shouldSort: true }
      return new Fuse(this.allFileTypes, options)
    }
  },
  watch: {
    phraseMatch () {
      this.$set(this, 'fuzziness', 0)
    },
    project () {
      this.$set(this, 'fileType', '')
      this.$set(this, 'path', '')
      this.$set(this, 'fileTypes', [])
      this.$set(this, 'paths', [])
      this.$set(this, 'allFileTypes', [])
      this.$set(this, 'allPaths', [])
      this.hideSuggestionsFileTypes()
      this.hideSuggestionsPaths()
      this.retrieveFileTypesAndPath()
    },
    showAdvancedFilters () {
      this.retrieveFileTypesAndPath()
    }
  },
  created () {
    const projects = [...this.$config.get('datashare_projects', [])].sort()
    this.$set(this, 'projects', map(projects, value => { return { value, text: value } }))
    this.$set(this, 'project', get(this.projects, ['0', 'value'], 'no-index'))
  },
  methods: {
    selectFileType (fileType) {
      this.selectedFileType = fileType || this.selectedFileType
    },
    searchFileTypes: throttle(function () {
      this.hideSuggestionsPaths()
      this.$set(this, 'suggestionFileTypes', filter(this.fuse.search(this.fileType), item => !includes(map(this.fileTypes, 'mime'), item.mime)))
    }, 200),
    searchFileType () {
      if (this.selectedFileType) {
        this.fileTypes.push(this.selectedFileType)
        this.hideSuggestionsFileTypes()
        this.$set(this, 'fileType', '')
        if (this.$refs && this.$refs.fileType) this.$refs.fileType.focus()
      }
    },
    hideSuggestionsFileTypes () {
      this.$set(this, 'suggestionFileTypes', [])
    },
    deleteFileType (index) {
      this.fileTypes.splice(index, 1)
    },
    async retrieveFileTypes () {
      this.$wait.start('load all file types')
      const aggTypes = await this.aggregate('contentType', 'contentType')
      each(aggTypes, aggType => {
        const extensions = has(types, aggType) ? types[aggType].extensions : []
        const label = has(types, aggType) ? types[aggType].label : aggType
        this.allFileTypes.push({ extensions, label, mime: aggType })
      })
      this.$wait.end('load all file types')
    },
    selectPath (path) {
      this.selectedPath = path || this.selectedPath
    },
    searchPaths: throttle(function () {
      this.hideSuggestionsFileTypes()
      this.$set(this, 'suggestionPaths', filter(this.allPaths, item => (item.indexOf(this.path) > -1) && !includes(this.paths, item)))
    }, 200),
    searchPath () {
      if (this.selectedPath) {
        this.paths.push(this.selectedPath)
        this.hideSuggestionsPaths()
        this.$set(this, 'path', '')
        if (this.$refs && this.$refs.path) this.$refs.path.focus()
      }
    },
    hideSuggestionsPaths () {
      this.$set(this, 'suggestionPaths', [])
    },
    deletePath (index) {
      this.paths.splice(index, 1)
    },
    async retrievePaths () {
      this.$wait.start('load all paths')
      const aggPaths = await this.aggregate('dirname', 'byDirname')
      this.$set(this, 'allPaths', this.buildTreeFromPaths(aggPaths))
      this.$wait.end('load all paths')
    },
    retrieveFileTypesAndPath () {
      if (this.showAdvancedFilters && isEmpty(this.allFileTypes) && isEmpty(this.allPaths)) {
        this.retrieveFileTypes()
        this.retrievePaths()
      }
    },
    resetForm () {
      this.$set(this, 'csvFile', null)
      this.$set(this, 'description', '')
      this.$set(this, 'fileType', '')
      this.$set(this, 'fileTypes', [])
      this.$set(this, 'fuzziness', 0)
      this.$set(this, 'name', '')
      this.$set(this, 'path', '')
      this.$set(this, 'paths', [])
      this.$set(this, 'phraseMatch', true)
      this.$set(this, 'project', get(this.projects, ['0', 'value'], 'no-index'))
      this.$set(this, 'published', true)
      this.$set(this, 'showAdvancedFilters', false)
    },
    async onSubmit () {
      try {
        await this.$store.dispatch('batchSearch/onSubmit', { name: this.name, csvFile: this.csvFile, description: this.description, project: this.project, phraseMatch: this.phraseMatch, fuzziness: this.fuzziness, fileTypes: this.fileTypes, paths: this.paths, published: this.published })
        this.resetForm()
        if (this.$config.is('manageDocuments')) {
          try {
            await this.$store.dispatch('indexing/runBatchSearch')
            this.$root.$bvToast.toast(this.$t('batchSearch.success'), { noCloseButton: true, variant: 'success' })
          } catch (_) {
            this.$root.$bvToast.toast(this.$t('batchSearch.failure'), { noCloseButton: true, variant: 'danger' })
          }
        } else {
          this.$root.$bvToast.toast(this.$t('batchSearch.submitSuccess'), { noCloseButton: true, variant: 'success' })
        }
      } catch (_) {
        this.$root.$bvToast.toast(this.$t('batchSearch.submitFailure'), { noCloseButton: true, variant: 'danger' })
      } finally {
        /**
         * The form has been submitted
         */
        this.$emit('submit')
      }
    },
    async aggregate (field, name) {
      let body, options, responses, searchResult
      let after = null
      let result = []
      while (responses === undefined || responses.length === 10) {
        options = after ? { after } : {}
        body = bodybuilder().size(0).agg('composite', { sources: [{ field: { terms: { field } } }] }, options, name).build()
        searchResult = await elasticsearch.search({ index: this.project, body })
        after = get(searchResult, ['aggregations', name, 'after_key'], null)
        responses = get(searchResult, ['aggregations', name, 'buckets'], [])
        result = concat(result, map(responses, 'key.field'))
      }
      return result
    },
    buildTreeFromPaths (paths) {
      const tree = map(paths, path => {
        const subpath = path.replace(this.$config.get('dataDir', ''), '')
        const split = compact(subpath.split('/'))
        const arr = []
        for (const i in range(0, split.length)) {
          arr.push(split.slice(0, parseInt(i) + 1).join('/'))
        }
        return arr
      })
      return uniq(flatten(tree))
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
  }
</style>
