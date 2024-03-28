<template>
  <div class="batch-search-results-table">
    <div class="card">
      <b-overlay :show="isBusy" rounded>
        <b-table
          :sort-by="sortBy"
          :sort-desc="sortDesc"
          :empty-text="$t('global.emptyTextTable')"
          :fields="fields"
          :items="results"
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
              :popover-white="false"
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
      </b-overlay>
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
import { compact, find, get, isEqual, uniq, isArray, uniqueId } from 'lodash'
import { mapState, mapGetters } from 'vuex'

import BatchSearchResultsFilters from '@/components/BatchSearchResultsFilters'
import ColumnFilterDropdown from '@/components/ColumnFilterDropdown'
import ContentTypeBadge from '@/components/ContentTypeBadge'
import humanSize from '@/filters/humanSize'
import { fileExtension } from '@/filters/fileExtension'
import { humanLongDate, humanShortDate, isDateValid } from '@/filters/humanDate'
import utils from '@/mixins/utils'
import settings from '@/utils/settings'

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
      set(values, oldValues) {
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
          sortable: false,
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
    sortBy() {
      return find(this.fields, ({ name }) => name === this.sortQueryParam)?.name
    },
    sortDesc() {
      return this.orderQueryParam.toLowerCase() === 'desc'
    },
    queriesExcluded() {
      return this.$route?.query?.queriesExcluded === 'true' || this.$route?.query?.queriesExcluded === true
    },
    orderQueryParam() {
      return this.$route.query?.order ?? settings.batchSearchResults.order
    },
    sortQueryParam() {
      return this.$route.query?.sort ?? settings.batchSearchResults.sort
    },
    isFirstDocument() {
      return this.documentInModalPageIndex === 0
    },
    isLastDocument() {
      const totalResultsIndices = this.results?.length - 1
      return this.documentInModalPageIndex === totalResultsIndices
    },
    hasMultipleProjects() {
      return this.batchSearch.projects?.length > 1
    }
  },
  watch: {
    page() {
      return this.fetch()
    },
    sortQueryParam() {
      return this.fetch()
    },
    orderQueryParam() {
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
    },
    queriesExcluded() {
      return this.fetch()
    }
  },
  async created() {
    await Promise.all([this.fetch(), this.setIsMyBatchSearch(), this.getQueries()])
  },
  methods: {
    fileExtension,
    async fetch() {
      this.$wait.start(this.loaderId)
      const {
        orderQueryParam: order,
        sortQueryParam: sort,
        selectedQueries: queries,
        perPage: size,
        pageOffset: from,
        selectedContentTypes: contentTypes,
        queriesExcluded
      } = this
      const params = { batchId: this.uuid, from, size, queries, sort, order, contentTypes, queriesExcluded }
      try {
        await this.$store.dispatch('batchSearch/getBatchSearchResults', params)
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
    async sortChanged(sortBy, sortDesc) {
      const sort = find(this.fields, (item) => item.key === sortBy)?.name
      const order = sortDesc ? 'asc' : 'desc'
      return this.updateRoute({ page: this.page, sort, order })
    },
    filter() {
      return this.updateRoute({ page: 1 })
    },
    updateRoute(query) {
      const to = this.generateRoute(query)
      return isEqual(to.query, this.$route.query) ? null : this.$router.push(to)
    },
    generateRoute({
      page = this.page,
      contentTypes = this.selectedContentTypes,
      sort = this.sortQueryParam,
      order = this.orderQueryParam,
      queries = this.selectedQueries
    }) {
      if (isArray(queries)) {
        queries = queries.join(',')
      }
      if (isArray(contentTypes)) {
        contentTypes = contentTypes.join(',')
      }
      contentTypes = contentTypes ?? null

      const queryParams = {
        page: page.toString(),
        queries,
        contentTypes,
        sort,
        order,
        queries_sort: this.$route.query.queries_sort || undefined
      }
      this.removeEmptySearchParams(queryParams)

      return {
        name: 'task.batch-search.view.results',
        params: {
          indices: this.indices,
          uuid: this.uuid
        },
        query: queryParams
      }
    },
    removeEmptySearchParams(query) {
      if (!query?.contentTypes || !query?.contentTypes?.length) delete query?.contentTypes
      if (!query?.queries || !query?.queries?.length) delete query?.queries
      if (!query?.queries_sort) delete query?.queries_sort
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
        border-top: 0;
        white-space: nowrap;

        &[aria-sort]:hover {
          background-color: $lighter;
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
