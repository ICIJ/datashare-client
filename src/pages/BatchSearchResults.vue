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
      <batch-search-results-table @openDocumentModal="openDocumentModal">
        <template #pagination>
          <custom-pagination
            v-model="currentPage"
            class="batch-search-results__pagination my-4"
            :per-page="perPage"
            :total-rows="totalItems"
          />
        </template>
      </batch-search-results-table>
      <document-in-modal v-model="documentInModalPageIndex" :total-items="totalItems" @update-route="updateRoute" />
    </div>
  </div>
</template>

<script>
import { castArray, find, get, isEqual, sumBy } from 'lodash'
import moment from 'moment'
import { mapState } from 'vuex'

import BatchSearchResultsDetails from '@/components/BatchSearchResultsDetails'
import DocumentInModal from '@/components/DocumentInModal'
import BatchSearchResultsTable from '@/components/BatchSearchResultsTable'
import humanSize from '@/filters/humanSize'
import humanNumber from '@/filters/humanNumber'
import { humanLongDate, humanShortDate } from '@/filters/humanDate'
import utils from '@/mixins/utils'
import settings from '@/utils/settings'

/**
 * This page will list all the results of a batch search.
 */
export default {
  name: 'BatchSearchResults',
  components: {
    BatchSearchResultsDetails,
    BatchSearchResultsTable,
    DocumentInModal
  },
  filters: {
    humanSize,
    humanNumber
  },
  mixins: [utils],
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.$set(vm, 'published', vm.batchSearch.published)
      vm.$set(vm, 'page', parseInt(get(to, 'query.page', vm.page)))
      vm.$set(vm, 'queries', castArray(get(to, 'query.queries', vm.queries)))
      vm.$set(vm, 'sort', get(to, 'query.sort', vm.sort))
      vm.$set(vm, 'order', get(to, 'query.order', vm.order))
      const queries = castArray(get(to, 'query.queries', vm.queries))
      const selectedQueries = queries.map((query) => {
        return { label: query }
      })
      vm.$store.commit('batchSearch/selectedQueries', selectedQueries)
    })
  },
  beforeRouteUpdate(to, from, next) {
    this.$set(this, 'page', parseInt(get(to, 'query.page', this.page)))
    this.$set(this, 'queries', castArray(get(to, 'query.queries', this.queries)))
    this.$set(this, 'sort', get(to, 'query.sort', this.sort))
    this.$set(this, 'order', get(to, 'query.order', this.order))
    const queries = castArray(get(to, 'query.queries', this.queries))
    const selectedQueries = queries.map((query) => {
      return { label: query }
    })
    this.$store.commit('batchSearch/selectedQueries', selectedQueries)
    next()
  },
  beforeRouteLeave(to, from, next) {
    this.$store.commit('batchSearch/batchSearch', {})
    this.$store.commit('batchSearch/selectedQueries', [])
    next()
  },
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
      documentInModalPageIndex: null,
      isMyBatchSearch: false,
      order: settings.batchSearchResults.order,
      page: 1,
      published: false,
      queries: [],
      sort: settings.batchSearchResults.sort
    }
  },
  computed: {
    ...mapState('batchSearch', ['batchSearch', 'results']),
    isLoaded() {
      return !!Object.keys(this.batchSearch).length
    },
    currentPage: {
      get() {
        return this.page
      },
      set(pageNumber) {
        this.page = pageNumber
        this.$router.push(this.generateLinkToBatchSearchResults(pageNumber, this.selectedQueries))
      }
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
    selectedQueries() {
      return get(this, '$store.state.batchSearch.selectedQueries', [])
    },
    generateTo() {
      const baseTo = { name: 'batch-search' }
      const searchQueryExists = this.$route.query.query
      return {
        ...baseTo,
        ...(searchQueryExists && { query: { query: this.$route.query.query } })
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
    totalItems() {
      if (this.selectedQueries.length === 0) {
        return this.batchSearch.nbResults
      } else {
        const queryKeys = Object.keys(this.batchSearch.queries)
        return sumBy(queryKeys, (query) => {
          const findQuery = find(this.selectedQueries, ['label', query])
          if (findQuery) {
            return this.batchSearch.queries[query]
          }
        })
      }
    },
    numberOfPages() {
      return Math.ceil(this.totalItems / this.perPage)
    },

    pageOffset() {
      return (this.page - 1) * this.perPage
    },
    hasMultipleProjects() {
      return this.batchSearch.projects.length > 1
    }
  },
  watch: {
    page() {
      this.fetch()
    },
    queries(queries, oldQueries = []) {
      // Check array values to avoid unnecessary fetching
      if (!isEqual(queries, oldQueries)) {
        this.fetch()
      }
    },
    sort() {
      this.fetch()
    },
    order() {
      this.fetch()
    }
  },
  async created() {
    await this.fetch()
    await this.setIsMyBatchSearch()
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
          queries: queries.map((query) => query.label),
          sort,
          order,
          queries_sort: this.$route.query.queries_sort || undefined
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
    },
    localeLongDate(date) {
      return humanLongDate(date, this.$i18n.locale)
    },
    localeShortDate(date) {
      return moment(date).isValid() ? humanShortDate(date, this.$i18n.locale) : ''
    },
    updateRoute() {
      return this.$router.push(this.generateLinkToBatchSearchResults(this.currentPage, this.selectedQueries))
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
