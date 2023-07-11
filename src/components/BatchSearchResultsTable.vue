<template>
  <div class="batch-search-results__queries">
    <div class="card">
      <v-wait for="load batchSearch results table">
        <div slot="waiting" class="card py-2">
          <content-placeholder v-for="index in 3" :key="index" class="py-2 px-3" />
        </div>
        <b-table
          :busy="isBusy"
          :empty-text="$t('global.emptyTextTable')"
          :fields="fields"
          :items="results"
          :per-page="perPage"
          :sort-by="sortBy"
          :sort-desc="orderBy"
          hover
          no-local-sorting
          no-sort-reset
          responsive
          show-empty
          striped
          tbody-tr-class="batch-search-results__queries__query "
          @sort-changed="sortChanged"
        >
          <template #head(contentType)="{ field }">
            <column-filter-dropdown
              :id="field.key"
              v-model="selectedContentType"
              :items="contentTypes"
              :name="field.label"
              multiple
            >
              <template #label="{ item }">
                {{ item.toLowerCase() | fileExtension }}
              </template>
            </column-filter-dropdown>
          </template>
          <template #cell(documentNumber)="{ item }">
            {{ item.documentNumber + 1 }}
          </template>
          <template #cell(documentPath)="{ item, index }">
            <router-link
              class="batch-search-results__queries__query__link"
              target="_blank"
              :to="{
                name: 'document-standalone',
                params: { index: item.project.name, id: item.documentId, routing: item.rootId },
                query: { q: item.query }
              }"
              @click.native.prevent="openDocumentModal(index)"
            >
              <active-text-truncate
                v-b-tooltip.hover
                class="batch-search-results__queries__query__link__path"
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
            <content-type-badge :value="item.contentType" :document-name="item.documentPath"></content-type-badge>
          </template>
          <template #cell(contentLength)="{ item }">
            {{ getDocumentSize(item.contentLength, '-') }}
          </template>
          <template #cell(empty)>
            <div class="text-center">
              {{ $t('batchSearchResults.empty') }}
            </div>
          </template>
        </b-table>
      </v-wait>
    </div>
    <slot name="pagination"> </slot>
  </div>
</template>

<script>
import { compact, find, get, isEqual, sumBy, uniq, map } from 'lodash'
import moment from 'moment'
import { mapState } from 'vuex'

import ColumnFilterDropdown from '@/components/ColumnFilterDropdown'
import ContentTypeBadge from '@/components/ContentTypeBadge'
import humanSize from '@/filters/humanSize'
import humanNumber from '@/filters/humanNumber'
import { fileExtension } from '@/filters/fileExtension'
import { humanLongDate, humanShortDate } from '@/filters/humanDate'
import utils from '@/mixins/utils'
import settings from '@/utils/settings'

/**
 * This page will list all the results of a batch search.
 */
export default {
  name: 'BatchSearchResultsTable',
  components: {
    ContentTypeBadge,
    ColumnFilterDropdown
  },
  filters: {
    humanSize,
    humanNumber,
    fileExtension
  },
  mixins: [utils],
  props: {
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
      order: settings.batchSearchResults.order,
      page: 1,
      sort: settings.batchSearchResults.sort
    }
  },
  computed: {
    ...mapState('batchSearch', ['batchSearch', 'results', 'selectedQueries']),
    isBusy() {
      return this.$wait.waiting('load batchSearch results table')
    },
    contentTypes() {
      const elems = this.selectedQueries.length ? this.selectedQueries : this.results
      const elements = uniq(map(elems, 'contentType'))
      console.log(elements)
      return elements //
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
    fields() {
      return compact([
        {
          key: 'documentNumber',
          label: this.$t('batchSearchResults.rank'),
          sortable: false,
          name: 'doc_nb'
        },
        {
          key: 'query',
          label: this.$t('batchSearchResults.query'),
          sortable: true,
          name: 'query'
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
          name: 'creation_date'
        },
        {
          key: 'contentType',
          label: this.$t('batchSearchResults.contentType'),
          sortable: true,
          name: 'content_type'
        },
        {
          key: 'contentLength',
          label: this.$t('batchSearchResults.size'),
          sortable: true,
          name: 'content_length'
        }
      ])
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
    hasDocumentInModal() {
      const pageIndex = this.documentInModalPageIndex
      return pageIndex !== null && this.results[pageIndex]
    },
    documentInModal() {
      if (!this.hasDocumentInModal) {
        return null
      }
      const document = this.results[this.documentInModalPageIndex]
      const { documentId: id, rootId: routing, query: q, project } = document
      const index = project.name
      return { index, id, routing, q }
    },
    documentInModalIndex: {
      get() {
        return this.pageOffset + this.documentInModalPageIndex
      },
      async set(index) {
        if (index >= this.pageOffset + this.perPage) {
          this.page++
        } else if (index < this.pageOffset) {
          this.page--
        }
        this.documentInModalPageIndex = index - this.pageOffset
      }
    },
    pageOffset() {
      return (this.page - 1) * this.perPage
    },
    isFirstDocument() {
      return this.documentInModalPageIndex === 0
    },
    isLastDocument() {
      const totalResultsIndices = this.results.length - 1
      return this.documentInModalPageIndex === totalResultsIndices
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
      this.$wait.start('load batchSearch results table')
      const { order, sort, queries, perPage: size, pageOffset: from } = this
      const params = { batchId: this.batchSearch.uuid, from, size, queries, sort, order }
      await this.$store.dispatch('batchSearch/getBatchSearchResults', params)
      this.$wait.end('load batchSearch results table')
    },
    async setIsMyBatchSearch() {
      const username = await this.$core.auth.getUsername()
      this.isMyBatchSearch = username === get(this, 'batchSearch.user.id')
    },
    async sortChanged(ctx) {
      const sort = find(this.fields, (item) => item.key === ctx.sortBy).name
      const order = ctx.sortDesc ? 'desc' : 'asc'
      this.$router.push(this.generateLinkToBatchSearchResults(this.page, this.selectedQueries, sort, order))
    },
    filter() {
      this.$router.push(this.generateLinkToBatchSearchResults(1, this.selectedQueries))
    },
    linkGen(page) {
      return this.generateLinkToBatchSearchResults(page, this.selectedQueries)
    },
    generateLinkToBatchSearchResults(page = this.page, queries = this.queries, sort = this.sort, order = this.order) {
      return {
        name: 'batch-search.results',
        params: {
          indices: this.indices,
          uuid: this.batchSearch.uuid
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
      this.$store.dispatch('batchSearch/updateBatchSearch', { batchId: this.batchSearch.uuid, published })
    },
    openDocumentModal(pageIndex) {
      this.$set(this, 'documentInModalPageIndex', pageIndex)
      this.$emit.show('document-modal')
    },
    localeLongDate(date) {
      return humanLongDate(date, this.$i18n.locale)
    },
    localeShortDate(date) {
      return moment(date).isValid() ? humanShortDate(date, this.$i18n.locale) : ''
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
