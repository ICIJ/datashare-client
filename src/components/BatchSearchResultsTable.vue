<template>
  <div class="batch-search-results-table">
    <div class="card">
      <b-table
        :busy="isBusy"
        :empty-text="$t('global.emptyTextTable')"
        :fields="fields"
        :items="results"
        :sort-by="sortByOption"
        :per-page="perPage"
        hover
        no-local-sorting
        no-sort-reset
        responsive
        show-empty
        striped
        tbody-tr-class="batch-search-results-table__queries__query "
        @sorted="sortChanged"
      >
        <template #head(contentType)="{ field }">
          <column-filter-dropdown
            :id="field.key"
            v-model="selectedContentTypes"
            :items="contentTypes"
            :name="field.label"
            immediate
            multiple
          >
            <template #label="{ item }">
              {{ fileExtension(item) }}
            </template>
          </column-filter-dropdown>
        </template>
        <template #head(query)="{ field }">
          <column-filter-dropdown
            v-if="queryKeys.length"
            :id="field.key"
            :model-value="selectedQueries"
            :items="queryKeys"
            :name="field.label"
            :counter="nbSelectedQueries"
            multiple
          >
            <template #dropdown>
              <batch-search-results-filters
                v-model:selectedQueries="selectedQueries"
                :query-keys="queryKeys"
                :indices="indices"
                hide-border
              />
            </template>
          </column-filter-dropdown>
        </template>
        <template #cell(documentNumber)="{ item }">
          {{ item.documentNumber + 1 }}
        </template>
        <template #cell(project.name)="{ item: { project } }">
          <project-link :project="project" hide-thumbnail />
        </template>
        <template #cell(documentPath)="{ item, index }">
          <router-link
            class="batch-search-results-table__queries__query__link"
            target="_blank"
            :to="{
              name: 'document-standalone',
              params: { index: item.project.name, id: item.documentId, routing: item.rootId },
              query: { q: item.query }
            }"
            @click.prevent="openDocumentModal(index)"
          >
            <active-text-truncate
              v-b-tooltip.hover
              class="batch-search-results-table__query__link__path"
              :title="item.documentPath"
            >
              {{ item.documentPath }}
            </active-text-truncate>
          </router-link>
        </template>
        <template #cell(creationDate)="{ item }">
          <span :title="localeLongDate(item.creationDate)">
            {{ localeShortDate(item.creationDate) }}
          </span>
        </template>
        <template #cell(contentType)="{ item }">
          <content-type-badge :value="item.contentType" :document-name="item.documentPath" />
        </template>
        <template #cell(contentLength)="{ item }">
          <span class="text-nowrap">{{ getDocumentSize(item.contentLength) }}</span>
        </template>
        <template #cell(empty)>
          <div class="text-center">
            {{ $t('batchSearchResults.empty') }}
          </div>
        </template>
      </b-table>
    </div>
    <custom-pagination
      v-model="page"
      class="batch-search-results-table__pagination my-4"
      :per-page="perPage"
      :total-rows="totalItems"
    />
  </div>
</template>

<script>
import { compact, find, get, isEqual, uniq, isArray, pickBy, uniqueId } from 'lodash'
import { mapState, mapGetters } from 'vuex'
import { computed } from 'vue'

import BatchSearchResultsFilters from '@/components/BatchSearchResultsFilters'
import ColumnFilterDropdown from '@/components/ColumnFilterDropdown'
import ContentTypeBadge from '@/components/ContentTypeBadge'
import humanSize from '@/utils/humanSize'
import { fileExtension } from '@/utils/fileExtension'
import { humanLongDate, humanShortDate, isDateValid } from '@/utils/humanDate'
import utils from '@/mixins/utils'
import settings from '@/utils/settings'
import { SORT_ORDER } from '@/utils/utils'

/**
 * This page will list all the results of a batch search.
 */
export default {
  name: 'BatchSearchResultsTable',
  components: {
    ContentTypeBadge,
    ColumnFilterDropdown,
    BatchSearchResultsFilters
  },
  mixins: [utils],
  provide() {
    return {
      sortBy: computed(() => this.sortByOption[0])
    }
  },
  props: {
    /**
     * The unique id of the batch search
     */
    uuid: {
      type: String,
      required: true
    },
    /**
     * The indices of the current batch search
     */
    indices: {
      type: String,
      required: true
    }
  },
  emits: ['show-document-modal'],
  data() {
    return {
      documentInModalPageIndex: null
    }
  },
  computed: {
    ...mapState('batchSearch', ['batchSearch', 'results', 'contentTypes']),
    ...mapGetters('batchSearch', ['queryKeys', 'nbSelectedQueries', 'totalItems']),
    loaderId() {
      return uniqueId('batch-search-results-table-loader-')
    },
    isBusy() {
      return this.$wait.is(this.loaderId)
    },
    selectedContentTypes: {
      get() {
        let contentTypes = this.$route.query?.contentTypes ?? []
        if (typeof contentTypes === 'string') {
          contentTypes = contentTypes?.split(',')
        }
        return uniq(contentTypes)
      },
      set(values) {
        const contentTypes = values?.length > 0 ? values?.join(',') : null
        return this.updateRoute({ page: 1, contentTypes })
      }
    },
    selectedQueries: {
      get() {
        let queries = this.$route.query?.queries ?? []
        if (typeof queries === 'string') {
          queries = queries?.split(',')
        }
        return uniq(queries)
      },
      set(values) {
        const queries = values?.length > 0 ? values?.join(',') : null
        return this.updateRoute({ page: 1, queries })
      }
    },
    projectField() {
      return this.hasMultipleProjects
        ? {
            key: 'project.name',
            label: this.$t('batchSearchResults.project'),
            sortable: true,
            name: 'prj_id',
            thStyle: { width: '10rem' }
          }
        : null
    },
    fields() {
      return compact([
        {
          key: 'documentNumber',
          label: this.$t('batchSearchResults.rank'),
          sortable: true,
          name: 'doc_nb',
          thStyle: { width: '5rem' }
        },
        {
          key: 'query',
          label: this.$t('batchSearchResults.query'),
          sortable: true,
          name: 'query',
          thStyle: { width: '10rem' }
        },
        this.projectField,
        {
          key: 'documentPath',
          label: this.$t('batchSearchResults.documentPath'),
          sortable: true,
          name: 'doc_path'
        },
        {
          key: 'creationDate',
          label: this.$t('batchSearchResults.creationDate'),
          sortable: true,
          name: 'creation_date',
          thStyle: { width: '10rem' }
        },
        {
          key: 'contentType',
          label: this.$t('batchSearchResults.contentType'),
          sortable: true,
          name: 'content_type',
          thStyle: { width: '10rem' }
        },
        {
          key: 'contentLength',
          label: this.$t('batchSearchResults.size'),
          sortable: true,
          name: 'content_length',
          thStyle: { width: '8rem' }
        }
      ])
    },
    hasMultipleProjects() {
      return this.batchSearch.projects?.length > 1
    },
    isFirstDocument() {
      return this.documentInModalPageIndex === 0
    },
    isLastDocument() {
      const totalResultsIndices = this.results?.length - 1
      return this.documentInModalPageIndex === totalResultsIndices
    },
    order() {
      return SORT_ORDER[this.$route?.query?.order?.toUpperCase()] ?? settings.batchSearchResults.order
    },
    page: {
      get() {
        const page = this.$route?.query?.page
        return page ? parseInt(page) : 1
      },
      set(pageNumber) {
        return this.updateRoute({ page: pageNumber })
      }
    },
    perPage() {
      return settings.batchSearchResults.size
    },
    pageOffset() {
      return (this.page - 1) * this.perPage
    },
    queriesSortQueryParam() {
      return this.$route?.query?.queriesSort
    },
    queriesExcludedQueryParam() {
      return this.$route?.query?.queriesExcluded === 'true' || this.$route?.query?.queriesExcluded === true
    },
    selectedSort: {
      get() {
        return { sort: this.sort, order: this.order }
      },
      set({ sort, order }) {
        const params = { page: this.page, sort, order }
        return this.updateRoute(params)
      }
    },
    sort() {
      const sortNameFromQuery = this.$route?.query?.sort?.toLowerCase()
      const sortKeyExists = this.fieldKeyByName(sortNameFromQuery)
      return sortKeyExists ? sortNameFromQuery : settings.batchSearchResults.sort
    },
    sortByOption() {
      return [{ key: this.fieldKeyByName(this.selectedSort?.sort), order: this.selectedSort?.order }]
    }
  },
  watch: {
    page() {
      return this.fetch()
    },
    selectedSort: {
      deep: true,
      handler() {
        return this.fetch()
      }
    },
    queriesExcludedQueryParam() {
      return this.fetch()
    },
    selectedContentTypes: {
      deep: true,
      handler(values, oldValues) {
        return isEqual(values, oldValues) ? null : this.fetch()
      }
    },
    selectedQueries: {
      deep: true,
      handler(values, oldValues) {
        return isEqual(values, oldValues) ? null : this.fetch()
      }
    }
  },
  async created() {
    await Promise.all([this.fetch(), this.setIsMyBatchSearch(), this.getQueries()])
  },
  methods: {
    fileExtension,
    async fetch() {
      this.$wait.start(this.loaderId)
      try {
        const payload = {
          batchId: this.uuid,
          from: this.pageOffset,
          size: this.perPage,
          queries: this.selectedQueries,
          queriesExcluded: this.queriesExcludedQueryParam,
          sort: this.selectedSort.sort,
          order: this.selectedSort.order,
          contentTypes: this.selectedContentTypes
        }
        await this.$store.dispatch('batchSearch/getBatchSearchResults', payload)
      } finally {
        this.$wait.end(this.loaderId)
      }
    },
    async setIsMyBatchSearch() {
      const username = await this.$core.auth.getUsername()
      this.isMyBatchSearch = username === get(this, 'batchSearch.user.id')
    },
    getQueries() {
      return this.$store.dispatch('batchSearch/getBatchSearchQueries', this.uuid)
    },
    fieldNameByKey(fieldKey) {
      return find(this.fields, (item) => item.key === fieldKey)?.name
    },
    fieldKeyByName(fieldName) {
      return find(this.fields, (item) => item.name === fieldName)?.key
    },
    filter() {
      return this.updateRoute({ page: 1 })
    },
    sortChanged({ key, order }) {
      this.selectedSort = {
        sort: this.fieldNameByKey(key),
        order: order ? SORT_ORDER.DESC : SORT_ORDER.ASC
      }
    },
    updateRoute(query) {
      const to = this.generateRoute(query)
      return isEqual(to.query, this.$route.query) ? null : this.$router.push(to)
    },
    generateRoute({
      page = this.page,
      contentTypes = this.selectedContentTypes,
      sort = this.selectedSort.sort,
      order = this.selectedSort.order,
      queries = this.selectedQueries,
      queriesSort = this.queriesSortQueryParam,
      queriesExcluded = this.queriesExcludedQueryParam
    }) {
      if (isArray(queries)) {
        queries = queries.join(',')
      }
      if (isArray(contentTypes)) {
        contentTypes = contentTypes.join(',')
      }
      contentTypes = contentTypes ?? null

      return {
        name: 'task.batch-search.view.results',
        query: this.removeEmptySearchParams({
          page: page.toString(),
          queries,
          contentTypes,
          sort,
          order,
          queriesSort,
          queriesExcluded
        }),
        params: {
          indices: this.indices,
          uuid: this.uuid
        }
      }
    },
    removeEmptySearchParams(query) {
      return pickBy(query, (value) => {
        return value && (!isArray(value) || value.length)
      })
    },
    getDocumentSize(value) {
      const size = humanSize(value)
      return size === 'unknown' ? '-' : size
    },
    changePublished(published) {
      this.$store.dispatch('batchSearch/updateBatchSearch', { batchId: this.batchSearch.uuid, published })
    },
    openDocumentModal(docIndex) {
      this.$emit('show-document-modal', docIndex)
    },
    localeLongDate(date) {
      return humanLongDate(date, this.$i18n.locale)
    },
    localeShortDate(date) {
      return isDateValid(date) ? humanShortDate(date, this.$i18n.locale) : ''
    }
  }
}
</script>

<style lang="scss" scoped>
.batch-search-results-table {
  &:deep(.table-responsive) {
    margin: 0;
  }

  &:deep(table) {
    margin: 0;

    thead tr {
      border-top: 0;

      th {
        white-space: nowrap;

        &[aria-sort]:hover {
          background-color: $light;
        }
      }
    }
  }

  &__query__link {
    &:visited {
      color: mix(#609, white, 50%);
    }

    &__path {
      display: block;
      max-width: 30vw;
    }
  }
}
</style>
