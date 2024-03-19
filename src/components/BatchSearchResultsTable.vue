<template>
  <div class="batch-search-results-table">
    <div class="card">
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
        tbody-tr-class="batch-search-results-table__queries__query "
        @sort-changed="sortChanged"
      >
        <template #head(contentType)="{ field }">
          <column-filter-dropdown
            :id="field.key"
            v-model="selectedContentTypes"
            :items="contentTypes"
            :name="field.label"
            multiple
          >
            <template #label="{ item }">
              {{ item | fileExtension }}
            </template>
          </column-filter-dropdown>
        </template>
        <template #head(query)="{ field }">
          <column-filter-dropdown
            v-if="queryKeys.length"
            :id="field.key"
            :values="selectedQueries"
            :items="queryKeys"
            :name="field.label"
            :counter="nbSelectedQueries"
            :popover-white="false"
            multiple
          >
            <template #dropdown>
              <batch-search-results-filters
                v-model="selectedQueries"
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
          <content-type-badge :value="item.contentType" :document-name="item.documentPath"></content-type-badge>
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
import { compact, find, get, isEqual, uniq, isArray } from 'lodash'
import { mapState, mapGetters } from 'vuex'

import BatchSearchResultsFilters from '@/components/BatchSearchResultsFilters'
import ColumnFilterDropdown from '@/components/ColumnFilterDropdown'
import ContentTypeBadge from '@/components/ContentTypeBadge'
import humanSize from '@/filters/humanSize'
import humanNumber from '@/filters/humanNumber'
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
  filters: {
    humanSize,
    humanNumber,
    fileExtension
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
      //  order: settings.batchSearchResults.order,
      // page: 1
      // sort: settings.batchSearchResults.sort
    }
  },
  computed: {
    ...mapState('batchSearch', ['batchSearch', 'results', 'contentTypes']),
    ...mapGetters('batchSearch', ['queryKeys', 'nbSelectedQueries', 'totalItems']),
    isBusy() {
      return this.$wait.waiting('load batchSearch results table')
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
      return find(this.fields, (item) => item.name === this.sort).key
    },
    queriesExcluded() {
      return this.$route?.query?.queriesExcluded === 'true' || this.$route?.query?.queriesExcluded === true
    },
    orderBy() {
      return this.order.toLowerCase() === 'desc'
    },
    order() {
      return this.$route.query?.order ?? settings.batchSearchResults.order
    },
    sort() {
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
    sort() {
      return this.fetch()
    },
    order() {
      return this.fetch()
    },
    selectedContentTypes() {
      return this.fetch()
    },
    selectedQueries() {
      return this.fetch()
    },
    queriesExcluded() {
      return this.fetch()
    }
  },
  async created() {
    await Promise.all([this.fetch(), this.setIsMyBatchSearch(), this.getQueries()])
  },
  methods: {
    async fetch() {
      this.$wait.start('load batchSearch results table')
      const {
        order,
        sort,
        selectedQueries: queries,
        perPage: size,
        pageOffset: from,
        selectedContentTypes: contentTypes,
        queriesExcluded
      } = this
      const params = { batchId: this.uuid, from, size, queries, sort, order, contentTypes, queriesExcluded }
      await this.$store.dispatch('batchSearch/getBatchSearchResults', params)
      this.$wait.end('load batchSearch results table')
    },
    async setIsMyBatchSearch() {
      const username = await this.$core.auth.getUsername()
      this.isMyBatchSearch = username === get(this, 'batchSearch.user.id')
    },
    getQueries() {
      return this.$store.dispatch('batchSearch/getBatchSearchQueries', this.uuid)
    },
    async sortChanged(ctx) {
      const sort = find(this.fields, (item) => item.key === ctx.sortBy).name
      const order = ctx.sortDesc ? 'desc' : 'asc'
      return this.updateRoute({ page: this.page, sort, order })
    },
    filter() {
      return this.updateRoute({ page: 1 })
    },
    linkGen(page) {
      return this.generateRoute({ page })
    },
    updateRoute(query) {
      const to = this.generateRoute(query)
      if (!isEqual(to.query, this.$route.query)) {
        return this.$router.push(to)
      }
    },
    generateRoute({
      page = this.page,
      contentTypes = this.selectedContentTypes,
      sort = this.sort,
      order = this.order,
      queries = this.selectedQueries
    }) {
      if (isArray(queries)) {
        queries = queries.join(',')
      }
      if (isArray(contentTypes)) {
        contentTypes = contentTypes.join(',')
      }
      contentTypes = isEqual(this.contentTypes, contentTypes) ? undefined : contentTypes

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
