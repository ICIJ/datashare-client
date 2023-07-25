<template>
  <div v-if="isLoaded" class="batch-search-results">
    <div class="my-4 container">
      <div class="mx-1 mb-2">
        <router-link :to="generateTo">
          <fa icon="angle-left" class="mr-1" fixed-width />
          {{ $t('batchSearch.title') }}
        </router-link>
      </div>
      <batch-search-results-details :batch-search="batchSearch" />
    </div>

    <div class="container">
      <b-row class="d-flex justify-content-end align-items-center">
        <applied-search-filters-item
          v-if="selectedQueries.length"
          :filter="selectedQueriesFilter"
          hide-filter-label
          :is-search-filter="false"
          @delete="clearQueriesParams"
        ></applied-search-filters-item>
        <applied-search-filters-item
          v-for="(cType, i) in selectedContentTypes"
          :key="`${cType}+${i}`"
          :filter="contentTypeFilter[cType]"
          hide-filter-label
          :is-search-filter="false"
          @delete="clearContentTypeParams"
        ></applied-search-filters-item>
        <batch-search-clear-filters
          class="batch-search__clear-filter-btn m-1"
          route-name="batch-search.results"
          :local-search-params="params"
        />
      </b-row>

      <batch-search-results-table @show-document-modal="openDocumentModal"> </batch-search-results-table>
      <document-in-modal v-model="documentInModalPageIndex" :total-items="1" @update-route="updateRoute" />
    </div>
  </div>
</template>

<script>
import { compact, find, get } from 'lodash'
import moment from 'moment'
import { mapGetters, mapState } from 'vuex'

import BatchSearchClearFilters from '@/components/BatchSearchClearFilters'
import BatchSearchResultsDetails from '@/components/BatchSearchResultsDetails'
import DocumentInModal from '@/components/DocumentInModal'
import BatchSearchResultsTable from '@/components/BatchSearchResultsTable'
import humanSize from '@/filters/humanSize'
import humanNumber from '@/filters/humanNumber'
import { humanLongDate, humanShortDate } from '@/filters/humanDate'
import utils from '@/mixins/utils'
import settings from '@/utils/settings'
import AppliedSearchFiltersItem from '@/components/AppliedSearchFiltersItem.vue'
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
  name: 'BatchSearchResults',
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
      type: String
    },
    /**
     * The indices of the current batch search
     */
    indices: {
      type: [String, Array]
    }
  },
  data() {
    return {
      params: SEARCH_PARAMS_LOCAL,
      documentInModalPageIndex: null,
      isMyBatchSearch: false,
      order: settings.batchSearchResults.order,
      page: 1,
      published: false,
      queries: [],
      sort: settings.batchSearchResults.sort,
      request: { page: 1, sort: 'asc', order: 'query' }
    }
  },
  computed: {
    ...mapState('batchSearch', ['batchSearch', 'results', 'contentTypes']),
    ...mapGetters('batchSearch', ['queryKeys', 'nbSelectedQueries', 'nbResults', 'nbCurrentQueries', 'totalItems']),

    isLoaded() {
      return !!Object.keys(this.batchSearch).length
    },
    projectField() {
      return this.hasMultipleProjects
        ? {
            key: 'project.name',
            label: this.$t('batchSearchResults.project'),
            sortable: true,
            name: 'prj_id'
          }
        : null
    },
    generateTo() {
      const baseTo = { name: 'batch-search' }
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
    numberOfPages() {
      return Math.ceil(this.totalItems / this.perPage)
    },
    queriesExcluded() {
      return !!this.$route?.query?.queriesExcluded
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
        value: `${this.selectedQueries.length} queries`,
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
      return this.$route.query?.contentTypes?.split(',') ?? []
    },
    selectedQueries() {
      return this.$route.query?.queries?.split(',') ?? []
    }
  },
  async created() {
    await this.fetch()
    return this.setIsMyBatchSearch()
  },
  methods: {
    async fetch() {
      this.$wait.start('load batchSearch results')
      this.$Progress.start()
      await this.$store.dispatch('batchSearch/getBatchSearch', this.uuid)
      this.$Progress.finish()
      this.$wait.end('load batchSearch results')
    },
    async setIsMyBatchSearch() {
      const username = await this.$core.auth.getUsername()
      this.isMyBatchSearch = username === get(this, 'batchSearch.user.id')
    },
    async sortChanged(ctx) {
      const sort = find(this.fields, (item) => item.key === ctx.sortBy).name
      const order = ctx.sortDesc ? 'desc' : 'asc'
      return this.$router.push(this.generateLinkToBatchSearchResults(this.page, this.selectedQueries, sort, order))
    },
    filter() {
      return this.$router.push(this.generateLinkToBatchSearchResults(1, this.selectedQueries))
    },
    linkGen(page) {
      return this.generateLinkToBatchSearchResults(page, this.selectedQueries)
    },
    generateLinkToBatchSearchResults(page = this.page, queries = this.queries, sort = this.sort, order = this.order) {
      return {
        name: 'batch-search.results',
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
    openDocumentModal(pageIndex) {
      this.documentInModalPageIndex = pageIndex
      this.$bvModal.show('document-modal')
    },
    localeLongDate(date) {
      return humanLongDate(date, this.$i18n.locale)
    },
    localeShortDate(date) {
      return moment(date).isValid() ? humanShortDate(date, this.$i18n.locale) : ''
    },
    updateRoute() {
      return this.$router.push(this.generateLinkToBatchSearchResults(this.currentPage, this.selectedQueries))
    },
    clearQueriesParams(filter) {
      const query = { ...this.$route.query }
      delete query.queriesExcluded
      delete query.query[filter.name]
      this.$router.push({ query })
    },
    clearContentTypeParams(filter) {
      const queryElement = this.selectedContentTypes.split(',')
      const removeIndex = queryElement.indexOf(filter.value)
      queryElement.splice(removeIndex, 1)

      this.$router.push({ query: { ...this.$route.query, [filter.queryParam]: queryElement.toString() } })
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
