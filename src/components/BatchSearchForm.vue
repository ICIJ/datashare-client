<template>
  <div class="batch-search-form m-3">
    <b-form @submit.prevent="onSubmit">
      <h5 class="text-light py-1">
        {{ $t('batchSearch.form.heading') }}
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
            :label="`${$t('batchSearch.form.fileLabel')} *`"
            :description="$t('batchSearch.form.fileDescription')">
            <b-form-file
              v-model="csvFile"
              :placeholder="$t('batchSearch.form.filePlaceholder')"
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
            :description="$t('batchSearch.phraseMatchDescription')">
            <b-form-checkbox
              v-model="phraseMatch"
              switch>
              {{ $t('batchSearch.phraseMatch') }}
            </b-form-checkbox>
          </b-form-group>
          <b-form-group
            :label="$t('batchSearch.fuzziness')"
            :description="fuzzinessDescription">
            <b-form-input
              type="number"
              v-model="fuzziness"
              min="0"
              :max="maxFuzziness"></b-form-input>
          </b-form-group>
          <b-form-group
            :label="$t('batchSearch.fileTypes')">
            <b-form-input
              v-model="fileTypes"
              @input="searchFileTypes"
              autocomplete="off">
            </b-form-input>
            <selectable-dropdown
              ref="suggestionFileTypes"
              @input="searchFileType"
              :hide="!suggestionFileTypes.length"
              :items="suggestionFileTypes">
              <template v-slot:item-label="{ item }">
                <div>{{ item.label }}</div>
              </template>
            </selectable-dropdown>
          </b-form-group>
          <b-form-group
            :label="$t('batchSearch.path')">
            <b-form-input
              v-model="paths"
              @input="searchPaths"
              autocomplete="off">
            </b-form-input>
            <selectable-dropdown
              ref="suggestionPaths"
              @input="searchPath"
              :hide="!suggestionPaths.length"
              :items="suggestionPaths">
            </selectable-dropdown>
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
          <div class="d-flex align-items-center">
            <b-button type="submit" variant="primary">
              {{ $t('batchSearch.form.submit') }}
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
      project: 'local-datashare',
      indices: [],
      phraseMatch: true,
      fuzziness: 0,
      fileTypes: '',
      suggestionFileTypes: [],
      paths: '',
      suggestionPaths: [],
      allPaths: [],
      published: true
    }
  },
  computed: {
    maxFuzziness () {
      return this.phraseMatch ? 100 : 2
    },
    fuzzinessDescription () {
      return this.phraseMatch ? this.$t('batchSearch.fuzzinessDescriptionPhrase') : this.$t('batchSearch.fuzzinessDescriptionTerm')
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
    this.$set(this, 'indices', map(this.$config.get('userIndices', []), value => { return { value, text: value } }))
    const response = await this.$store.dispatch('search/queryFacet', { name: 'path', options: { size: 1000, exclude: '', include: '.*' } })
    map(get(response, ['aggregations', 'byDirname', 'buckets'], []), item => this.allPaths.push(item.key))
  },
  methods: {
    searchFileTypes: throttle(async function () {
      const searchedFileTypes = this.fileTypes.split(' ').pop()
      this.$set(this, 'suggestionFileTypes', filter(this.allTypes, item => (item.label.indexOf(searchedFileTypes) > -1) || item.mime.indexOf(searchedFileTypes) > -1))
    }, 200),
    searchFileType (fileType) {
      if (fileType) {
        const fileTypesArray = this.fileTypes.split(' ')
        // Remove last fileType
        fileTypesArray.pop()
        // Append the clicked fileType
        fileTypesArray.push(fileType.label)
        this.$set(this, 'fileTypes', fileTypesArray.join(' '))
        this.$set(this, 'suggestionFileTypes', [])
      }
    },
    searchPaths: throttle(async function () {
      const searchedPaths = this.paths.split(' ').pop()
      this.$set(this, 'suggestionPaths', filter(this.allPaths, item => item.indexOf(searchedPaths) > -1))
    }, 200),
    searchPath (path) {
      if (path) {
        const PathsArray = this.paths.split(' ')
        // Remove last path
        PathsArray.pop()
        // Append the clicked path
        PathsArray.push(path)
        this.$set(this, 'paths', PathsArray.join(' '))
        this.$set(this, 'suggestionPaths', [])
      }
    },
    resetForm () {
      this.$set(this, 'name', '')
      this.$set(this, 'csvFile', null)
      this.$set(this, 'description', '')
      this.$set(this, 'project', 'local-datashare')
      this.$set(this, 'phraseMatch', true)
      this.$set(this, 'fuzziness', 0)
      this.$set(this, 'fileTypes', '')
      this.$set(this, 'paths', '')
      this.$set(this, 'published', true)
    },
    async onSubmit () {
      await this.$store.dispatch('batchSearch/onSubmit', { name: this.name, csvFile: this.csvFile, description: this.description, project: this.project, phraseMatch: this.phraseMatch, fuzziness: this.fuzziness, fileTypes: this.fileTypes, paths: this.paths, published: this.published })
      this.resetForm()
      if (this.$config.is('manageDocuments')) {
        try {
          await this.$store.dispatch('indexing/runBatchSearch')
          this.$bvToast.toast(this.$t('batchSearch.form.success'), { noCloseButton: true, variant: 'success' })
        } catch (_) {
          this.$bvToast.toast(this.$t('batchSearch.form.failure'), { noCloseButton: true, variant: 'danger' })
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .form-group small {
    line-height: 1.2;
  }
</style>
