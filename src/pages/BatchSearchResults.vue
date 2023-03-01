<template>
  <div v-if="isLoaded" class="batch-search-results">
    <div class="my-4 container">
      <div class="mx-1 mb-2">
        <router-link :to="generateTo">
          <fa icon="angle-left" class="mr-1" fixed-width />
          {{ $t('batchSearch.title') }}
        </router-link>
      </div>
      <div class="card">
        <div class="card-body d-flex align-items-center">
          <h5 class="m-0 flex-grow-1">
            {{ batchSearch.name }}
          </h5>
          <batch-search-actions :batch-search="batchSearch" />
        </div>
        <div class="card-footer p-0 overflow-hidden">
          <p v-if="batchSearch.description" class="p-3 m-0 border-bottom">
            {{ batchSearch.description }}
          </p>
          <dl class="batch-search-results__info">
            <div v-if="isServer">
              <dt>
                {{ $t('batchSearch.projects') }}
              </dt>
              <dd>
                <router-link
                  v-for="(project, index) in batchSearch.projects"
                  :key="project.name"
                  :to="{
                    name: 'search',
                    query: {
                      q: '*',
                      indices: project.name
                    }
                  }"
                  class="batch-search-results__info__project-link"
                >
                  {{ project.name }}<span v-if="isNotLastArrayItem(index, batchSearch.projects.length)">,</span>
                </router-link>
              </dd>
            </div>
            <div v-if="isServer && isMyBatchSearch">
              <dt>
                {{ $t('batchSearch.published') }}
              </dt>
              <dd>
                <b-form-checkbox v-model="batchSearch.published" switch @change="changePublished" />
              </dd>
            </div>
            <div>
              <dt>
                {{ $t('batchSearch.state') }}
              </dt>
              <dd>
                <batch-search-status :batch-search="batchSearch" />
              </dd>
            </div>
            <div>
              <dt>
                {{ $t('batchSearch.date') }}
              </dt>
              <dd>
                {{ moment(batchSearch.date).locale($i18n.locale).format('LLL') }}
              </dd>
            </div>
            <div>
              <dt>
                {{ $t('batchSearch.nbResults') }}
              </dt>
              <dd :title="batchSearch.nbResults">
                {{ batchSearch.nbResults | humanNumber }}
              </dd>
            </div>
            <div>
              <dt>
                {{ $t('batchSearch.queries') }}
              </dt>
              <dd :title="batchSearch.nbQueries">
                {{ batchSearch.nbQueries | humanNumber }}
              </dd>
            </div>
            <div v-if="batchSearch.phraseMatches">
              <dt>
                {{ $t('batchSearch.phraseMatch') }}
              </dt>
              <dd>
                {{ $t('global.yes') }}
              </dd>
            </div>
            <div v-if="batchSearch.fuzziness > 0">
              <dt>
                {{ fuzzinessLabel }}
              </dt>
              <dd>
                {{ batchSearch.fuzziness }}
              </dd>
            </div>
            <div v-if="batchSearch.fileTypes.length">
              <dt>
                {{ $t('batchSearch.fileTypes') }}
              </dt>
              <dd>
                <ul class="list-unstyled list-group list-group-horizontal mt-1">
                  <li v-for="fileType in batchSearch.fileTypes" :key="fileType" class="mr-2">
                    <content-type-badge :value="fileType" />
                  </li>
                </ul>
              </dd>
            </div>
            <div v-if="batchSearch.paths.length">
              <dt>
                {{ $t('batchSearch.path') }}
              </dt>
              <dd>
                <ul class="list-unstyled list-group list-group-horizontal">
                  <li v-for="path in batchSearch.paths" :key="path" class="mr-2">
                    <b-badge variant="dark">
                      {{ path }}
                    </b-badge>
                  </li>
                </ul>
              </dd>
            </div>
            <div v-if="isServer">
              <dt>
                {{ $t('batchSearch.author') }}
              </dt>
              <dd>
                <user-display :username="batchSearch.user.id" />
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>

    <div class="container">
      <v-wait for="load batchSearch results">
        <div slot="waiting" class="card py-2">
          <content-placeholder v-for="index in 3" :key="index" class="py-2 px-3" />
        </div>
        <div class="batch-search-results__queries">
          <div class="card">
            <b-table
              :empty-text="$t('global.emptyTextTable')"
              :fields="fields"
              hover
              :items="results"
              no-local-sorting
              no-sort-reset
              :per-page="perPage"
              :responsive="true"
              show-empty
              striped
              :sort-by="sortBy"
              :sort-desc="orderBy"
              tbody-tr-class="batch-search-results__queries__query"
              @sort-changed="sortChanged"
            >
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
                <span :title="moment(item.creationDate).locale($i18n.locale).format('LLL')">
                  {{
                    moment(item.creationDate).isValid()
                      ? moment(item.creationDate).locale($i18n.locale).format('LL')
                      : ''
                  }}
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
          </div>
        </div>
        <custom-pagination
          v-model="currentPage"
          class="batch-search-results__pagination my-4"
          :per-page="perPage"
          :total-rows="totalItems"
        />
      </v-wait>
    </div>
    <b-modal id="document-modal" size="xl" lazy hide-header hide-footer body-class="p-0">
      <div v-if="documentInModal" :key="documentInModalIndex">
        <document-navbar :id="documentInModal.id" :index="documentInModal.index" :routing="documentInModal.routing">
          <template #back>
            <a role="button" class="small text-white" @click="$bvModal.hide('document-modal')">
              <fa icon="chevron-circle-left"></fa>
              <span class="ml-2">
                {{ $t('Back to results') }}
              </span>
            </a>
          </template>
          <template #nav>
            <quick-item-nav
              v-model="documentInModalIndex"
              :total-items="totalItems"
              @previous="handlePrevNextRoute"
              @next="handlePrevNextRoute"
            >
            </quick-item-nav>
          </template>
        </document-navbar>
        <v-wait for="load batchSearch results">
          <document-view
            :id="documentInModal.id"
            :index="documentInModal.index"
            :q="documentInModal.q"
            :routing="documentInModal.routing"
          />
        </v-wait>
      </div>
    </b-modal>
  </div>
</template>

<script>
import { castArray, compact, find, get, isEqual, sumBy } from 'lodash'
import moment from 'moment'
import { mapState } from 'vuex'

import BatchSearchActions from '@/components/BatchSearchActions'
import BatchSearchStatus from '@/components/BatchSearchStatus'
import ContentTypeBadge from '@/components/ContentTypeBadge'
import DocumentNavbar from '@/components/document/DocumentNavbar'
import QuickItemNav from '@/components/QuickItemNav'
import UserDisplay from '@/components/UserDisplay'
import humanSize from '@/filters/humanSize'
import humanNumber from '@/filters/humanNumber'
import utils from '@/mixins/utils'
import DocumentView from '@/pages/DocumentView'
import settings from '@/utils/settings'

/**
 * This page will list all the results of a batch search.
 */
export default {
  name: 'BatchSearchResults',
  components: {
    BatchSearchActions,
    BatchSearchStatus,
    ContentTypeBadge,
    DocumentNavbar,
    DocumentView,
    UserDisplay,
    QuickItemNav
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
    fuzzinessLabel() {
      if (this.batchSearch.phraseMatches) {
        return this.$t('batchSearch.proximitySearches')
      }
      return this.$t('batchSearch.fuzziness')
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
    handlePrevNextRoute() {
      if (this.isFirstDocument || this.isLastDocument) {
        this.$router.push(this.generateLinkToBatchSearchResults(this.currentPage, this.selectedQueries))
      }
    },
    async fetch() {
      this.$wait.start('load batchSearch results')
      this.$Progress.start()
      await this.$store.dispatch('batchSearch/getBatchSearch', this.uuid)
      const { order, sort, queries, uuid: batchId, perPage: size, pageOffset: from } = this
      const params = { batchId, from, size, queries, sort, order }
      await this.$store.dispatch('batchSearch/getBatchSearchResults', params)
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
      this.$set(this, 'documentInModalPageIndex', pageIndex)
      this.$bvModal.show('document-modal')
    },
    moment
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
