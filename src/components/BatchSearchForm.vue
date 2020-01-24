<template>
  <div class="batch-search-form m-3">
    <b-form @submit.prevent="onSubmit">
      <h5 class="text-light py-1">
        {{ $t('batchSearch.heading') }}
      </h5>
      <div class="card w-100">
        <div class="card-body pb-1">
          <b-form-group
            label-size="sm"
            :label="`${$t('batchSearch.name')} *`">
            <b-form-input
              v-model="name"
              type="text"
              required></b-form-input>
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
              required></b-form-file>
          </b-form-group>
          <p class="help small">
            <a href="https://icij.gitbook.io/datashare/all/batch-search-documents#write-your-queries-in-a-spreadsheet" target="_blank" class="text-muted">
              {{ $t('batchSearch.learnMore') }}
            </a>
          </p>
          <b-form-group
            label-size="sm"
            :label="$t('batchSearch.description')">
            <b-form-textarea
              v-model="description"
              rows="2"
              max-rows="6"></b-form-textarea>
          </b-form-group>
          <b-form-group
            label-size="sm"
            :label="`${$t('batchSearch.project')} *`"
            v-if="$config.is('multipleProjects')">
            <b-form-select
              v-model="project"
              :options="indices"
              required></b-form-select>
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
            <span>{{ $t('batchSearch.advancedFilters') }}</span>
          </div>
          <b-collapse id="advanced-filters" v-model="showCollapse" class="pt-2">
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
              :label="fuzzinessLabel"
              :description="fuzzinessDescription">
              <b-form-input
                type="number"
                v-model="fuzziness"
                min="0"
                :max="maxFuzziness"></b-form-input>
            </b-form-group>
            <div class="help">
              <a :href="fuzzinessLearnMore" target="_blank" class="text-muted">
                {{ $t('batchSearch.learnMore') }}
              </a>
            </div>
            <b-form-group
              label-size="sm"
              :label="$t('batchSearch.fileTypes')">
              <b-form-input
                v-model="fileType"
                @input="searchFileTypes"
                @blur="hideSuggestionsFileTypes"
                autocomplete="off"
                ref="fileType">
              </b-form-input>
              <selectable-dropdown
                ref="suggestionFileTypes"
                @input="searchFileType"
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
              <b-badge v-for="(fileType, index) in fileTypes" :key="fileType.mime" class="mr-2 pl-1 batch-search-form__advanced-filters" variant="warning" pill @click.prevent="deleteFileType(index)">
                <fa icon="times-circle" />
                {{ fileType.label }}
              </b-badge>
            </b-form-group>
            <b-form-group
              label-size="sm"
              :label="$t('batchSearch.path')">
              <b-form-input
                v-model="path"
                @input="searchPaths"
                @blur="hideSuggestionsPaths"
                autocomplete="off"
                ref="path">
              </b-form-input>
              <selectable-dropdown
                ref="suggestionPaths"
                @input="searchPath"
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
              <b-badge v-for="(path, index) in paths" :key="path" class="mr-2 pl-1 batch-search-form__advanced-filters" variant="warning" pill @click.prevent="deletePath(index)">
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
import each from 'lodash/each'
import filter from 'lodash/filter'
import flatten from 'lodash/flatten'
import get from 'lodash/get'
import includes from 'lodash/includes'
import map from 'lodash/map'
import range from 'lodash/range'
import throttle from 'lodash/throttle'
import uniq from 'lodash/uniq'
import bodybuilder from 'bodybuilder'

import esClient from '@/api/esClient'
import types from '@/utils/types.json'

export default {
  name: 'BatchSearchForm',
  data () {
    return {
      name: '',
      csvFile: null,
      description: '',
      project: '',
      indices: [],
      phraseMatch: true,
      fuzziness: 0,
      fileType: '',
      fileTypes: [],
      suggestionFileTypes: [],
      path: '',
      paths: [],
      suggestionPaths: [],
      allPaths: [],
      allFileTypes: [],
      published: true,
      showCollapse: false
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
      return this.showCollapse ? 'angle-down' : 'angle-right'
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
      this.retrieveFileTypes()
      this.retrievePaths()
    }
  },
  created () {
    this.$set(this, 'indices', map(this.$config.get('userProjects', []), value => { return { value, text: value } }))
    this.$set(this, 'project', get(this.indices, ['0', 'value'], ''))
  },
  methods: {
    searchFileTypes: throttle(function () {
      this.hideSuggestionsPaths()
      this.$set(this, 'suggestionFileTypes', filter(this.allFileTypes, item => ((item.label.indexOf(this.fileType) > -1) || item.mime.indexOf(this.fileType) > -1) && !includes(map(this.fileTypes, 'mime'), item.mime)))
    }, 200),
    searchFileType (fileType) {
      if (fileType) {
        this.fileTypes.push(fileType)
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
    searchPaths: throttle(function () {
      this.hideSuggestionsFileTypes()
      this.$set(this, 'suggestionPaths', filter(this.allPaths, item => item.indexOf(this.path) > -1))
    }, 200),
    searchPath (path) {
      if (path) {
        this.paths.push(path)
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
    resetForm () {
      this.$set(this, 'name', '')
      this.$set(this, 'csvFile', null)
      this.$set(this, 'description', '')
      this.$set(this, 'project', get(this.indices, ['0', 'value'], ''))
      this.$set(this, 'phraseMatch', true)
      this.$set(this, 'fuzziness', 0)
      this.$set(this, 'fileType', '')
      this.$set(this, 'fileTypes', [])
      this.$set(this, 'path', '')
      this.$set(this, 'paths', [])
      this.$set(this, 'published', true)
    },
    async onSubmit () {
      await this.$store.dispatch('batchSearch/onSubmit', { name: this.name, csvFile: this.csvFile, description: this.description, project: this.project, phraseMatch: this.phraseMatch, fuzziness: this.fuzziness, fileTypes: this.fileTypes, paths: this.paths, published: this.published })
      this.resetForm()
      if (this.$config.is('manageDocuments')) {
        try {
          await this.$store.dispatch('indexing/runBatchSearch')
          this.$bvToast.toast(this.$t('batchSearch.success'), { noCloseButton: true, variant: 'success' })
        } catch (_) {
          this.$bvToast.toast(this.$t('batchSearch.failure'), { noCloseButton: true, variant: 'danger' })
        }
      }
    },
    async aggregate (field, name) {
      const body = bodybuilder().size(0).aggregation('terms', field, {}, name).build()
      const response = await esClient.search({ index: this.project, body })
      return map(get(response, ['aggregations', name, 'buckets'], []), 'key')
    },
    buildTreeFromPaths (paths) {
      const tree = map(paths, path => {
        const subpath = path.replace(this.$config.get('dataDir', ''), '')
        const split = compact(subpath.substr(0, subpath.lastIndexOf('/')).split('/'))
        const arr = []
        for (const i in range(0, split.length)) {
          arr.push(split.slice(0, parseInt(i) + 1).join('/'))
        }
        return arr
      })
      return uniq(flatten(tree))
    },
    async retrievePaths () {
      const aggPaths = await this.aggregate('path', 'byDirname')
      this.$set(this, 'allPaths', this.buildTreeFromPaths(aggPaths))
    },
    async retrieveFileTypes () {
      const aggTypes = await this.aggregate('contentType', 'contentType')
      each(aggTypes, aggType => this.allFileTypes.push({ label: types[aggType].label, mime: aggType }))
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
