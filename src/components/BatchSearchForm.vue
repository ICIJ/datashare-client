<template>
  <div class="batch-search-form">
    <b-form @submit.prevent="onSubmit">
      <div :class="{ 'border-0': hideBorder }" class="card w-100">
        <h5 v-if="!hideTitle" class="card-header">
          {{ $t('batchSearch.heading') }}
        </h5>
        <div class="card-body pb-1">
          <b-form-group :label="`${$t('batchSearch.name')} *`" class="batch-search-form__name" label-size="sm">
            <b-form-input v-model="name" required type="text" trim></b-form-input>
          </b-form-group>
          <b-form-group
            :label="`${$t('batchSearch.fileLabel')} *`"
            class="batch-search-form__fileLabel mb-0"
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
          <p class="help small">
            <a
              class="text-muted"
              href="https://icij.gitbook.io/datashare/usage/batch-search-documents#write-your-queries-in-a-spreadsheet"
              target="_blank"
            >
              {{ $t('batchSearch.learnMore') }}
            </a>
          </p>
          <b-form-group :label="$t('batchSearch.description')" label-size="sm" class="batch-search-form__description">
            <b-form-textarea v-model="description" max-rows="6" rows="2" trim></b-form-textarea>
          </b-form-group>
          <b-form-group
            v-if="showProjectsInput"
            :label="`${$t('batchSearch.projects')} *`"
            class="batch-search-form__projects"
            label-size="sm"
          >
            <multiselect
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
            <b-form-group :description="phraseMatchDescription" class="batch-search-form__phraseMatch" label-size="sm">
              <b-form-checkbox v-model="phraseMatch" switch>
                {{ $t('batchSearch.phraseMatch') }}
              </b-form-checkbox>
            </b-form-group>
            <b-form-group
              :description="fuzzinessDescription"
              :label="fuzzinessLabel"
              class="batch-search-form__fuzziness mb-0"
              label-size="sm"
            >
              <b-form-input v-model="fuzziness" :max="maxFuzziness" min="0" type="number"></b-form-input>
            </b-form-group>
            <p class="help small">
              <a :href="fuzzinessLearnMore" class="text-muted" target="_blank">
                {{ $t('batchSearch.learnMore') }}
              </a>
            </p>
            <b-form-group :label="$t('batchSearch.fileTypes')" label-size="sm" class="batch-search-form__fileTypes">
              <b-overlay :show="$wait.is('load all file types')" opacity="0.6" rounded spinner-small>
                <b-form-input
                  ref="fileType"
                  v-model="fileType"
                  :disabled="$wait.is('load all file types')"
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
                @input="selectFileType"
                @click.native="searchFileType"
              >
                <template #item-label="{ item }">
                  <div :id="item.mime">
                    {{ item.label }}
                  </div>
                  <b-tooltip :target="item.mime" :title="item.label" placement="right"></b-tooltip>
                </template>
              </selectable-dropdown>
              <b-badge
                v-for="(oneFileType, index) in fileTypes"
                :key="oneFileType.mime"
                class="mt-2 mr-2 pl-1 batch-search-form__cursor"
                pill
                variant="warning"
                @click.prevent="deleteFileType(index)"
              >
                <fa icon="times-circle"></fa>
                {{ oneFileType.label }}
              </b-badge>
            </b-form-group>
            <b-form-group :label="$t('batchSearch.path')" label-size="sm" class="batch-search-form__path">
              <div v-b-modal.modal-select-path class="mr-3 py-1 px-2 border btn btn-link">
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
                  v-model="path"
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
                  class="mt-2 mr-2 pl-1 batch-search-form__cursor"
                  pill
                  variant="warning"
                  @click.prevent="deletePath(index)"
                >
                  <fa icon="times-circle"></fa>
                  {{ onePath }}
                </b-badge>
              </div>
            </b-form-group>
            <b-form-group :label="$t('batchSearch.tags')" label-size="sm" class="batch-search-form__tags">
              <b-overlay :show="$wait.is('load all tags')" opacity="0.6" rounded spinner-small>
                <b-form-input
                  ref="tag"
                  v-model="tag"
                  :disabled="$wait.is('load all tags')"
                  autocomplete="off"
                  @input="searchTags"
                  @keydown.enter.prevent="searchTags"
                ></b-form-input>
              </b-overlay>
              <selectable-dropdown
                ref="suggestionTags"
                class="batch-search-form__tags__suggestions"
                :hide="!suggestionTags.length"
                :items="suggestionTags"
                @deactivate="hideSuggestionsTags"
                @input="selectTag"
                @click.native="searchTag"
              />
              <b-badge
                v-for="(oneTag, index) in tags"
                :key="oneTag.mime"
                class="mt-2 mr-2 pl-1 batch-search-form__cursor"
                pill
                variant="warning"
                @click.prevent="deleteTag(index)"
              >
                <fa icon="times-circle"></fa>
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
  each,
  filter,
  find,
  flatten,
  get,
  has,
  includes,
  isEmpty,
  iteratee,
  map,
  range,
  startCase,
  throttle,
  uniq
} from 'lodash'
import bodybuilder from 'bodybuilder'
import Fuse from 'fuse.js'
import Multiselect from 'vue-multiselect'

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
    Multiselect
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
  data() {
    return {
      ...initData,
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
    filters() {
      return [
        new FilterText({ name: 'tags', key: 'tags', forceExclude: this.excludeTags }).setValues(this.tags),
        new FilterText({ name: 'contentType', key: 'contentType', forceExclude: this.excludeTags }).setValues(
          this.fileTypes
        ),
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
    async projects() {
      this.resetProjectData()
      this.hideSuggestionsFileTypes()
      this.hideSuggestionsTags()
      await Promise.all([this.retrieveFileTypes(), this.retrieveTags()])
    },
    async showAdvancedFilters() {
      await Promise.all([this.retrieveFileTypes(), this.retrieveTags()])
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
    selectFileType(fileType = null) {
      this.selectedFileType = fileType || this.selectedFileType
    },
    searchFileTypes: throttle(function () {
      const fileTypes = this.fuseFileTypes.search(this.fileType).map(({ item }) => item)
      this.suggestionFileTypes = filter(fileTypes, (item) => {
        return !includes(map(this.fileTypes, 'mime'), item.mime)
      })
    }, 200),
    searchFileType() {
      if (this.selectedFileType) {
        this.fileTypes.push(this.selectedFileType)
        this.hideSuggestionsFileTypes()
        this.fileType = initData.fileType
        this.$refs?.fileType?.focus()
      }
    },
    hideSuggestionsFileTypes() {
      this.suggestionFileTypes = initData.suggestionFileTypes
    },
    deleteFileType(index) {
      this.fileTypes.splice(index, 1)
    },
    async aggregateFileTypes() {
      const aggTypes = await this.aggregate('contentType', 'contentType')
      each(aggTypes, (aggType) => {
        const extensions = has(types, aggType) ? types[aggType].extensions : []
        const label = has(types, aggType) ? types[aggType].label : aggType
        this.allFileTypes.push({
          extensions,
          label,
          mime: aggType
        })
      })
    },
    async loadAndRetrieve(callback, noSelection, waiter, failMessageKey) {
      if (this.showAdvancedFilters && noSelection) {
        this.$wait.start(waiter)
        try {
          await callback()
        } catch (e) {
          this.$root.$bvToast.toast(this.$tc(`batchSearch.${failMessageKey}`, this.projects?.length), {
            noCloseButton: true,
            variant: 'danger'
          })
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
    searchTags: throttle(function () {
      const tags = this.fuseTags.search(this.tag).map(({ item }) => item)
      this.suggestionTags = filter(tags, (item) => {
        return !includes(this.tags, item)
      })
    }, 200),
    searchTag() {
      if (this.selectedTag) {
        this.tags.push(this.selectedTag)
        this.hideSuggestionsTags()
        this.tag = initData.tag
        this.$refs?.tag?.focus()
      }
    },
    hideSuggestionsTags() {
      this.suggestionTags = initData.suggestionTags
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
        this[key] = initData[key]
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
          this.$root.$bvToast.toast(this.$t('batchSearch.success'), {
            noCloseButton: true,
            variant: 'success'
          })
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
        this.$root.$bvToast.toast(this.$t('batchSearch.submitQueryLimitError'), {
          noCloseButton: true,
          variant: 'danger'
        })
      } else if (manageDocuments) {
        this.$root.$bvToast.toast(this.$t('batchSearch.error'), {
          noCloseButton: true,
          variant: 'danger'
        })
      } else {
        this.$root.$bvToast.toast(this.$t('batchSearch.submitError'), {
          noCloseButton: true,
          variant: 'danger'
        })
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
