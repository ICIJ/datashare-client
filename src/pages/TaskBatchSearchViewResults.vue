<template>
  <div v-if="isLoaded" class="task-batch-search-view-results">
    <div class="my-4 container">
      <div class="mx-1 mb-2 d-flex">
        <router-link :to="generateTo">
          <fa icon="angle-left" class="me-1" fixed-width />
          {{ $t('batchSearch.title') }}
        </router-link>
      </div>
      <batch-search-results-details :batch-search="batchSearch" @update:published="changePublished" />
    </div>

    <div class="container">
      <div class="task-batch-search-view-results__applied-search-filters d-flex justify-content-end align-items-center">
        <applied-search-filters-item
          v-if="selectedQueries.length"
          class="task-batch-search-view-results__applied-search-filters__queries"
          :filter="selectedQueriesFilter"
          hide-filter-label
          :update-search-store="false"
          @delete="clearQueriesParams"
        />
        <applied-search-filters-item
          v-for="(cType, i) in selectedContentTypes"
          :key="`${cType}+${i}`"
          class="task-batch-search-view-results__applied-search-filters__content-types"
          :filter="contentTypeFilter[cType]"
          hide-filter-label
          :update-search-store="false"
          @delete="clearContentTypeParams"
        />
        <batch-search-clear-filters
          class="batch-search__clear-filter-btn m-1"
          route-name="task.batch-search.view.results"
          :local-search-params="params"
        />
      </div>
      <batch-search-results-table :indices="indices" :uuid="uuid" @show-document-modal="openDocumentModal" />
      <document-in-modal v-model="documentInModalPageIndex" :page="page" @update:page="updatePage" />
    </div>
  </div>
</template>

<script>
import { compact, find, get, uniq } from 'lodash'
import { mapGetters, mapState } from 'vuex'

import BatchSearchClearFilters from '@/components/BatchSearchClearFilters'
import BatchSearchResultsDetails from '@/components/BatchSearchResultsDetails'
import DocumentInModal from '@/components/DocumentInModal'
import BatchSearchResultsTable from '@/components/BatchSearchResultsTable'
import humanSize from '@/filters/humanSize'
import humanNumber from '@/filters/humanNumber'
import utils from '@/mixins/utils'
import settings from '@/utils/settings'
import AppliedSearchFiltersItem from '@/components/AppliedSearchFiltersItem'

const SEARCH_PARAMS_LOCAL = Object.freeze({
  queries: true,
  indices: false,
  contentTypes: true,
  order: true,
  sort: true
})

/**
 * This page will list all the results of a batch search.
 */
export default {
  name: 'TaskBatchSearchViewResults',
  components: {
    AppliedSearchFiltersItem,
    BatchSearchClearFilters,
    BatchSearchResultsDetails,
    BatchSearchResultsTable,
    DocumentInModal
  },
  filters: {
    humanSize,
    humanNumber
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
      params: SEARCH_PARAMS_LOCAL,
      documentInModalPageIndex: null,
      isMyBatchSearch: false,
      order: settings.batchSearchResults.order,
      published: false,
      sort: settings.batchSearchResults.sort,
      request: { page: 1, sort: 'asc', order: 'query' }
    }
  },
  computed: {
    ...mapState('batchSearch', ['batchSearch', 'results', 'contentTypes']),
    ...mapGetters('batchSearch', ['totalItems']),

    isLoaded() {
      return !!Object.keys(this.batchSearch).length
    },
    generateTo() {
      const baseTo = { name: 'task.batch-search.list' }
      return {
        ...baseTo,
        ...(this.$route.query?.query && { query: { query: this.$route.query.query } })
      }
    },
    perPage() {
      return settings.batchSearchResults.size
    },
    sortBy() {
      return find(this.fields, (item) => item.name === this.sort).key
    },
    orderBy() {
      return this.order === 'desc'
    },
    queriesExcluded() {
      return this.$route?.query?.queriesExcluded === 'true' || this.$route?.query?.queriesExcluded === true
    },
    page: {
      get() {
        const page = this.$route.query?.page ?? 1
        return parseInt(page) ?? 1
      },
      set(newPage) {
        return this.$router.push(this.generateLinkToBatchSearchResults(newPage))
      }
    },
    pageOffset() {
      return (this.page - 1) * this.perPage
    },
    hasMultipleProjects() {
      return this.batchSearch.projects.length > 1
    },
    selectedQueriesFilter() {
      return {
        name: 'queries',
        value: this.$tc('batchSearchResults.queriesFilter', this.selectedQueries.length),
        negation: this.queriesExcluded,
        queryParams: 'queries'
      }
    },
    contentTypeFilter() {
      return this.selectedContentTypes.reduce((acc, elem) => {
        acc[elem] = {
          name: 'contentType',
          value: elem,
          negation: false,
          queryParam: 'contentTypes'
        }
        return acc
      }, {})
    },
    selectedContentTypes() {
      let contentTypes = this.$route.query?.contentTypes ?? []
      if (typeof contentTypes === 'string') {
        contentTypes = contentTypes?.split(',')
      }
      return uniq(contentTypes)
    },
    selectedQueries() {
      let queries = this.$route.query?.queries ?? []
      if (typeof queries === 'string') {
        queries = queries?.split(',')
      }
      return uniq(queries)
    }
  },
  async created() {
    await this.fetch()
    await this.setIsMyBatchSearch()
  },
  methods: {
    async fetch() {
      this.$wait.start('load batchSearch results')
      await this.$store.dispatch('batchSearch/getBatchSearch', this.uuid)
      this.$wait.end('load batchSearch results')
    },
    async setIsMyBatchSearch() {
      const username = await this.$core.auth.getUsername()
      this.isMyBatchSearch = username === get(this, 'batchSearch.user.id')
    },
    linkGen(page) {
      return this.generateLinkToBatchSearchResults(page, this.selectedQueries)
    },
    generateLinkToBatchSearchResults(
      page = this.page,
      queries = this.selectedQueries,
      sort = this.sort,
      order = this.order
    ) {
      return {
        name: 'task.batch-search.view.results',
        params: {
          indices: this.indices,
          uuid: this.uuid
        },
        query: {
          page,
          queries: compact(queries.map((query) => query.label)),
          sort,
          order,
          queries_sort: this.$route.query?.queries_sort || undefined
        }
      }
    },
    getDocumentSize(value) {
      const size = humanSize(value)
      return size === 'unknown' ? '-' : size
    },
    changePublished(published) {
      this.$store.dispatch('batchSearch/updateBatchSearch', { batchId: this.uuid, published })
    },
    openDocumentModal(docIndex) {
      this.documentInModalPageIndex = docIndex
      this.$bvModal.show('document-modal')
    },
    async updatePage(event) {
      await this.$store.dispatch(`batchSearch/clearBatchSearchResults`)

      await this.$router.push(this.generateLinkToBatchSearchResults(event.page))
      await this.$nextTick()

      this.documentInModalPageIndex = event.docIndex
    },
    clearQueriesParams() {
      const query = { ...this.$route.query }
      delete query.queriesExcluded
      delete query?.queries
      this.$router.push({ query })
    },
    clearContentTypeParams(filter) {
      const newContentTypes = this.selectedContentTypes.filter((e) => e !== filter.value)
      const newQuery = { query: { ...this.$route.query } }
      if (newContentTypes?.length) {
        newQuery.query[filter.queryParam] = newContentTypes.toString()
      } else {
        delete newQuery.query[filter.queryParam]
      }
      this.$router.push(newQuery)
    }
  }
}
</script>

<style lang="scss" scoped>
.batch-search-results {
  &__info {
    display: grid;
    overflow: hidden;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    grid-gap: 0px;
    margin: 0 -1px -1px;
    border-left: 1px solid $border-color;

    & > div {
      padding: $spacer $spacer $spacer;
      border: 1px solid $border-color;
      border-left: 0;
      border-top: 0;

      dt {
        text-overflow: ellipsis;
        font-weight: normal;
        color: $text-muted;
      }

      dd {
        font-size: 1rem;
        font-weight: bolder;
      }
    }
  }

  &__queries {
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
}
</style>
