<template>
  <div class="batch-search-form m-3">
    <b-form @submit.prevent="onSubmit">
      <h5 class="text-light py-1">
        {{ $t('batchSearch.heading') }}
      </h5>
      <div class="card w-100">
        <div class="card-body pb-1 small">
          <b-form-group
            :label="`${$t('batchSearch.name')} *`">
            <b-form-input
              v-model="name"
              type="text"
              required></b-form-input>
          </b-form-group>
          <b-form-group
            :label="`${$t('batchSearch.fileLabel')} *`"
            :description="$t('batchSearch.fileDescription')">
            <b-form-file
              v-model="csvFile"
              :placeholder="$t('batchSearch.filePlaceholder')"
              accept=".csv"
              required></b-form-file>
          </b-form-group>
          <b-form-group
            :label="$t('batchSearch.description')">
            <b-form-textarea
              v-model="description"
              rows="2"
              max-rows="6"></b-form-textarea>
          </b-form-group>
          <b-form-group
            :label="`${$t('batchSearch.project')} *`"
            v-if="$config.is('multipleProjects')">
            <b-form-select
              v-model="project"
              :options="indices"
              required></b-form-select>
          </b-form-group>
          <b-form-group
            :description="phraseMatchDescription">
            <b-form-checkbox
              v-model="phraseMatch"
              switch>
              {{ $t('batchSearch.phraseMatch') }}
            </b-form-checkbox>
          </b-form-group>
          <b-form-group
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
            :label="$t('batchSearch.fileTypes')">
            <b-form-input
              v-model="fileType"
              @input="searchFileTypes"
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
                <div>{{ item.label }}</div>
              </template>
            </selectable-dropdown>
            <ul class="list-unstyled">
              <li v-for="(fileType, index) in fileTypes" :key="fileType.mime" class="badge badge-light border badge-pill mr-1 mt-1">
                <span>{{ fileType.label }}</span>
                <span class="btn btn-sm p-0" @click.prevent="deleteFileType(index)">
                  <fa icon="times" class="fa-fw p-0" />
                </span>
              </li>
            </ul>
          </b-form-group>
          <b-form-group
            :label="$t('batchSearch.path')">
            <b-form-input
              v-model="path"
              @input="searchPaths"
              autocomplete="off"
              ref="path">
            </b-form-input>
            <selectable-dropdown
              ref="suggestionPaths"
              @input="searchPath"
              @deactivate="hideSuggestionsPaths"
              :hide="!suggestionPaths.length"
              :items="suggestionPaths">
            </selectable-dropdown>
            <ul class="list-unstyled">
              <li v-for="(path, index) in paths" :key="path" class="badge badge-light border badge-pill mr-1 mt-1">
                <span>{{ path }}</span>
                <span class="btn btn-sm p-0" @click.prevent="deletePath(index)">
                  <fa icon="times" class="fa-fw p-0" />
                </span>
              </li>
            </ul>
          </b-form-group>
          <b-form-group
            :description="$t('batchSearch.publishedDescription')"
            v-if="$config.is('multipleProjects')"
            class="published">
            <b-form-checkbox
              v-model="published"
              switch>
              {{ $t('batchSearch.published') }}
            </b-form-checkbox>
          </b-form-group>
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
import each from 'lodash/each'
import filter from 'lodash/filter'
import get from 'lodash/get'
import includes from 'lodash/includes'
import map from 'lodash/map'
import throttle from 'lodash/throttle'

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
      published: true
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
      return this.phraseMatch ? 'https://icij.gitbook.io/datashare/faq/what-is-proximity-search' : 'https://icij.gitbook.io/datashare/faq/what-is-fuzziness'
    },
    allTypes () {
      const allTypes = []
      each(types, (type, mime) => {
        type.mime = mime
        allTypes.push(type)
      })
      return allTypes
    }
  },
  watch: {
    phraseMatch () {
      this.$set(this, 'fuzziness', 0)
    }
  },
  async created () {
    this.$set(this, 'indices', map(this.$config.get('userProjects', []), value => { return { value, text: value } }))
    this.$set(this, 'project', get(this.indices, ['0', 'value'], ''))
    const response = await this.$store.dispatch('search/queryFacet', { name: 'path', options: { size: 1000, exclude: '', include: '.*' } })
    map(get(response, ['aggregations', 'byDirname', 'buckets'], []), item => this.allPaths.push(item.key))
  },
  methods: {
    searchFileTypes: throttle(async function () {
      this.$set(this, 'suggestionFileTypes', filter(this.allTypes, item => ((item.label.indexOf(this.fileType) > -1) || item.mime.indexOf(this.fileType) > -1) && !includes(map(this.fileTypes, 'mime'), item.mime)))
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
    searchPaths: throttle(async function () {
      this.$set(this, 'suggestionPaths', filter(this.allPaths, item => item.indexOf(this.path) > -1))
    }, 200),
    searchPath (path) {
      if (path) {
        this.paths.push(path)
        this.hideSuggestionsPaths()
        this.$set(this, 'path', '')
        if (this.$refs && this.$refs.fileType) this.$refs.fileType.focus()
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
    }
  }
}
</script>

<style lang="scss" scoped>
  .batch-search-form {
    .form-group small {
      line-height: 1.2;
    }

    .help {
      font-size: 10px;
      margin-top: -16px;
      margin-bottom: 16px;
    }
  }
</style>
