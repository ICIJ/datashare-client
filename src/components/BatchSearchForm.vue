<template>
  <div class="batch-search-form">
    <b-form @submit.prevent="onSubmit">
      <div :class="{ 'border-0': hideBorder }" class="card w-100">
        <h5 v-if="!hideTitle" class="card-header">
          {{ $t('batchSearch.heading') }}
        </h5>
        <div class="card-body pb-1">
          <b-form-group :label="`${$t('batchSearch.name')} *`" class="batch-search-form__name mb-3" label-size="sm">
            <b-form-input v-model="name" required type="text" trim></b-form-input>
          </b-form-group>
          <b-form-group
            :label="`${$t('batchSearch.fileLabel')} *`"
            class="batch-search-form__fileLabel mb-1"
            label-size="sm"
          >
            <template slot="description">
              <div v-html="$t('batchSearch.fileDescription')"></div>
            </template>
            <b-form-file
              v-model="csvFile"
              :placeholder="$t('batchSearch.filePlaceholder')"
              :state="!!csvFile"
              accept=".csv"
              class="text-truncate"
              no-drop
              required
            ></b-form-file>
          </b-form-group>
          <p class="help small mb-3">
            <a class="text-muted" :href="$t('settings.documentationLinks.batchSearch.spreadsheet')" target="_blank">
              {{ $t('batchSearch.learnMore') }}
            </a>
          </p>
          <b-form-group
            :label="$t('batchSearch.description')"
            label-size="sm"
            class="batch-search-form__description mb-3"
          >
            <b-form-textarea v-model="description" max-rows="6" rows="2" trim></b-form-textarea>
          </b-form-group>
          <b-form-group
            v-if="showProjectsInput"
            :label="`${$t('batchSearch.projects')} *`"
            class="batch-search-form__projects mb-3"
            label-size="sm"
          >
            <vue-multiselect
              v-model="selectedProjects"
              :allow-empty="false"
              :close-on-select="false"
              :options="projectOptions"
              track-by="name"
              label="label"
              multiple
            />
          </b-form-group>
          <b-form-group
            v-if="isServer"
            :description="$t('batchSearch.publishedDescription')"
            class="batch-search-form__published"
            label-size="sm"
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
            <b-form-group
              :description="phraseMatchDescription"
              class="batch-search-form__phraseMatch mb-3"
              label-size="sm"
            >
              <b-form-checkbox v-model="phraseMatch" switch>
                {{ $t('batchSearch.phraseMatch') }}
              </b-form-checkbox>
            </b-form-group>
            <b-form-group :label="fuzzinessLabel" class="batch-search-form__fuzziness mb-3" label-size="sm">
              <b-form-input
                v-model="fuzziness"
                :max="maxFuzziness"
                min="0"
                type="number"
                class="batch-search-form__fuzziness__input"
              ></b-form-input>
              <template #description>
                <span v-html="fuzzinessDescription"></span>&nbsp;
                <a :href="fuzzinessLearnMore" target="_blank">
                  {{ $t('batchSearch.learnMore') }}
                </a>
              </template>
            </b-form-group>
            <b-form-group
              :label="$t('batchSearch.fileTypes')"
              label-size="sm"
              class="batch-search-form__fileTypes mb-3"
            >
              <b-overlay :show="isLoading('load all file types')" opacity="0.6" rounded spinner-small>
                <b-form-input
                  ref="fileType"
                  v-model="fileType"
                  :disabled="isLoading('load all file types')"
                  autocomplete="off"
                  @input="searchFileTypes"
                  @keydown.enter.prevent="searchFileType"
                ></b-form-input>
              </b-overlay>
              <selectable-dropdown
                ref="suggestionFileTypes"
                class="batch-search-form__fileTypes__suggestions"
                :hide="!suggestionFileTypes.length"
                :items="suggestionFileTypes"
                @deactivate="hideSuggestionsFileTypes"
                @update:modelValue="selectFileType"
                @click="searchFileType"
              >
                <template #item-label="{ item }">
                  {{ item.label }}
                </template>
              </selectable-dropdown>
              <b-badge
                v-for="(oneFileType, index) in fileTypes"
                :key="oneFileType.mime"
                class="mt-2 me-2 ps-1 batch-search-form__cursor"
                pill
                variant="warning"
                @click.prevent="deleteFileType(index)"
              >
                <fa icon="circle-xmark"></fa>
                {{ oneFileType.label }}
              </b-badge>
            </b-form-group>
            <b-form-group :label="$t('batchSearch.path')" label-size="sm" class="batch-search-form__path mb-3">
              <div v-b-modal.modal-select-path class="me-3 py-1 px-2 border btn btn-link">
                {{ $t('batchSearch.selectFolder') }}
              </div>
              <b-modal
                id="modal-select-path"
                :cancel-title="$t('global.cancel')"
                :ok-title="$t('batchSearch.selectFolder')"
                body-class="p-0 border-bottom"
                cancel-variant="outline-primary"
                hide-header
                lazy
                scrollable
                size="lg"
                @ok="setPaths()"
              >
                <tree-view
                  v-model:path="path"
                  :projects="projects"
                  :selected-paths="selectedPaths"
                  count
                  selectable
                  size
                  @checked="selectedPaths = $event"
                ></tree-view>
              </b-modal>
              <div>
                <b-badge
                  v-for="(onePath, index) in paths"
                  :key="onePath"
                  class="mt-2 me-2 ps-1 batch-search-form__cursor"
                  pill
                  variant="warning"
                  @click.prevent="deletePath(index)"
                >
                  <fa icon="circle-xmark"></fa>
                  {{ onePath }}
                </b-badge>
              </div>
            </b-form-group>
            <b-form-group :label="$t('batchSearch.tags')" label-size="sm" class="batch-search-form__tags mb-3">
              <b-overlay :show="isLoading('load all tags')" opacity="0.6" rounded spinner-small>
                <b-form-input
                  ref="tag"
                  v-model="tag"
                  :disabled="isLoading('load all tags')"
                  autocomplete="off"
                  @update:modelValue="searchTags"
                  @keydown.enter.prevent="searchTags"
                ></b-form-input>
              </b-overlay>
              <selectable-dropdown
                ref="suggestionTags"
                class="batch-search-form__tags__suggestions"
                :hide="!suggestionTags.length"
                :items="suggestionTags"
                @deactivate="hideSuggestionsTags"
                @update:modelValue="selectTag"
                @click="searchTag"
              />
              <b-badge
                v-for="(oneTag, index) in tags"
                :key="oneTag.mime"
                class="mt-2 me-2 ps-1 batch-search-form__cursor"
                pill
                variant="warning"
                @click.prevent="deleteTag(index)"
              >
                <fa icon="circle-xmark"></fa>
                {{ oneTag }}
              </b-badge>
              <b-form-checkbox v-model="excludeTags" size="sm" switch>
                {{ $t('batchSearch.excludeTags') }}
              </b-form-checkbox>
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
  clamp,
  compact,
  concat,
  cloneDeep,
  filter,
  find,
  flatten,
  get,
  has,
  isEmpty,
  iteratee,
  map,
  range,
  startCase,
  uniq
} from 'lodash'
import bodybuilder from 'bodybuilder'
import Fuse from 'fuse.js'
import VueMultiselect from 'vue-multiselect'

import TreeView from '@/components/TreeView'
import utils from '@/mixins/utils'
import types from '@/utils/types.json'
import { FilterText, FilterPath } from '@/store/filters'

const TEMPLATE_VALUE = Object.freeze({
  QUERY: '<query>'
})

const initDataProject = {
  allFileTypes: [],
  allTags: [],
  fileType: '',
  fileTypes: [],
  tag: '',
  tags: [],
  paths: []
}

const initData = {
  ...initDataProject,
  csvFile: null,
  description: '',
  selectedFuzziness: 0,
  name: '',
  phraseMatch: true,
  published: true,
  selectedFileType: '',
  selectedTag: '',
  selectedPaths: [],
  excludeTags: false,
  showAdvancedFilters: false,
  suggestionFileTypes: [],
  suggestionTags: []
}

/**
 * A form to create a new batch search.
 */
export default {
  name: 'BatchSearchForm',
  components: {
    TreeView,
    VueMultiselect
  },
  filters: {
    startCase
  },
  mixins: [utils],
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
  emits: ['submit'],
  data() {
    return {
      ...cloneDeep(initData),
      selectedProjects: [],
      path: this.$config.get('mountedDataDir') || this.$config.get('dataDir')
    }
  },
  computed: {
    showProjectsInput() {
      return this.isServer || this.$core.projects.length > 1
    },
    maxFuzziness() {
      return this.phraseMatch ? 100 : 2
    },
    fuzziness: {
      get() {
        return this.selectedFuzziness
      },
      set(value) {
        this.selectedFuzziness = clamp(value, 0, this.maxFuzziness)
      }
    },
    projectOptions() {
      return this.$core.projects
    },
    defaultSelectedProjects() {
      return filter(this.projectOptions, ({ name }) => {
        // In case the store is not initialized yet,
        // all project are selected by default
        return get(this, '$store.state.search.indices', [name]).includes(name)
      })
    },
    projects: {
      get() {
        return this.selectedProjects.map(iteratee('name'))
      },
      set(projects) {
        this.selectedProjects = projects.map((name) => {
          return find(this.projectOptions, { name })
        })
      }
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
    fuseFileTypes() {
      const keys = ['extensions', 'label', 'mime']
      const options = {
        distance: 100,
        keys,
        shouldSort: true
      }
      return new Fuse(this.allFileTypes, options)
    },
    fuseTags() {
      const options = {
        distance: 100,
        shouldSort: true
      }
      return new Fuse(this.allTags, options)
    },
    mimeTypes() {
      return this.fileTypes.map((filetype) => filetype.mime)
    },
    filters() {
      const forceExclude = this.excludeTags
      return [
        new FilterText({ name: 'tags', key: 'tags', forceExclude }).setValues(this.tags),
        new FilterText({ name: 'contentType', key: 'contentType', forceExclude }).setValues(this.mimeTypes),
        new FilterPath({ name: 'path', key: 'byDirname', forceExclude: false }).setValues(this.paths)
      ]
    },
    queryWithFilters() {
      return this.createQueryTemplate(this.filters)
    }
  },
  watch: {
    phraseMatch() {
      this.selectedFuzziness = 0
    },
    projects: {
      deep: true,
      handler() {
        this.resetProjectData()
        this.hideSuggestionsFileTypes()
        this.hideSuggestionsTags()
        return Promise.all([this.retrieveFileTypes(), this.retrieveTags()])
      }
    },
    showAdvancedFilters() {
      return Promise.all([this.retrieveFileTypes(), this.retrieveTags()])
    }
  },
  created() {
    this.selectedProjects = this.defaultSelectedProjects
  },
  methods: {
    createQueryTemplate(filters) {
      const { query } = this.$core.api.elasticsearch.rootSearch(filters, TEMPLATE_VALUE.QUERY).build()
      return JSON.stringify(query)
    },
    isLoading(loaderName) {
      return this.$wait.is(loaderName)
    },
    selectFileType(fileType = null) {
      this.selectedFileType = fileType || this.selectedFileType
    },
    searchFileTypes() {
      // Search for file types based on the current fileType using Fuse.js
      const searchResults = this.fuseFileTypes.search(this.fileType).map(({ item }) => item)
      // Create a Set for efficient lookups to check if a mime type is already in this.fileTypes
      const existingMimeTypes = new Set(this.fileTypes.map((file) => file.mime))
      // Filter the search results to get only those items whose mime type is not already in existingMimeTypes
      this.suggestionFileTypes = searchResults.filter(({ mime }) => !existingMimeTypes.has(mime))
    },
    searchFileType() {
      if (this.selectedFileType) {
        this.fileTypes.push(this.selectedFileType)
        this.hideSuggestionsFileTypes()
        this.fileType = cloneDeep(initData).fileType
        this.$refs?.fileType?.focus()
      }
    },
    hideSuggestionsFileTypes() {
      this.suggestionFileTypes = cloneDeep(initData).suggestionFileTypes
    },
    deleteFileType(index) {
      this.fileTypes.splice(index, 1)
    },
    async aggregateFileTypes() {
      const aggTypes = await this.aggregate('contentType', 'contentType')
      aggTypes.forEach((mime) => {
        const extensions = has(types, mime) ? types[mime].extensions : []
        const label = has(types, mime) ? types[mime].label : mime
        this.allFileTypes.push({ extensions, label, mime })
      })
    },
    async loadAndRetrieve(callback, noSelection, waiter, failMessageKey) {
      if (this.showAdvancedFilters && noSelection) {
        this.$wait.start(waiter)
        try {
          await callback()
        } catch (e) {
          const body = this.$t(`batchSearch.${failMessageKey}`, this.projects?.length)
          this.$toast.error(body)
        }
        this.$wait.end(waiter)
      }
    },
    retrieveFileTypes() {
      return this.loadAndRetrieve(
        this.aggregateFileTypes,
        isEmpty(this.allFileTypes),
        'load all file types',
        'unableToRetrieveFileTypes'
      )
    },
    selectTag(tag = null) {
      this.selectedTag = tag || this.selectedTag
    },
    searchTags() {
      // Search for tags based on the current tag using Fuse.js and extract the items
      const searchResults = this.fuseTags.search(this.tag).map(({ item }) => item)
      // Convert this.tags array into a Set for faster lookups
      const existingTagsSet = new Set(this.tags)
      // Filter search results to include only those tags not already present in the existingTagsSet
      this.suggestionTags = searchResults.filter((tag) => !existingTagsSet.has(tag))
    },
    searchTag() {
      if (this.selectedTag) {
        this.tags.push(this.selectedTag)
        this.hideSuggestionsTags()
        this.tag = cloneDeep(initData).tag
        this.$refs?.tag?.focus()
      }
    },
    hideSuggestionsTags() {
      this.suggestionTags = cloneDeep(initData).suggestionTags
    },
    async aggregateTags() {
      const tags = await this.aggregate('tags', 'tags')
      this.allTags.push(...tags)
    },
    async retrieveTags() {
      return this.loadAndRetrieve(this.aggregateTags, isEmpty(this.allTags), 'load all tags', 'unableToRetrieveTags')
    },
    deleteTag(index) {
      this.tags.splice(index, 1)
    },
    setPaths() {
      this.paths = this.selectedPaths
    },
    deletePath(index) {
      this.paths.splice(index, 1)
    },
    resetProjectData() {
      Object.keys(initDataProject).forEach((key) => {
        this[key] = initDataProject[key]
      })
    },
    resetForm() {
      Object.keys(initData).forEach((key) => {
        this[key] = cloneDeep(initData[key])
      })
      this.selectedProjects = this.defaultSelectedProjects
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
          published: this.published,
          queryTemplate: this.queryWithFilters
        })
        this.resetForm()
        try {
          this.$toast.success(this.$t('batchSearch.success'))
        } catch (_) {
          this.manageError(_.response.status, true)
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
        searchResult = await this.$core.api.elasticsearch.search({
          index: this.projects.join(','),
          body
        })
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
        this.$toast.error(this.$t('batchSearch.submitQueryLimitError'))
      } else if (manageDocuments) {
        this.$toast.error(this.$t('batchSearch.error'))
      } else {
        this.$toast.error(this.$t('batchSearch.submitError'))
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

  &__cursor {
    cursor: pointer;
  }
}
</style>
