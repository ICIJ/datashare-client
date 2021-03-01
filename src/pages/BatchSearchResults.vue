<template>
  <div class="batch-search-results" v-if="Object.keys(batchSearch).length !== 0">
    <page-header icon="layer-group" :title="batchSearch.name" :description="batchSearch.description">
      <template v-slot:preTitle>
        <router-link :to="{ name: 'batch-search' }" class="mx-1">{{ $t('batchSearch.title') }}</router-link>
        <fa icon="angle-right" class="small"></fa>
      </template>
      <div class="d-flex my-2 mx-3">
        <div>
          <b-btn variant="light" class="batch-search-results__action" id="batch-search-results-filters-toggle" v-b-tooltip.hover :title="$t('batchSearchResultsFilters.queries.heading')">
            <fa icon="filter"></fa>
            <span class="sr-only">
              {{ $t('batchSearchResultsFilters.queries.heading') }}
            </span>
            <b-badge variant="secondary" class="batch-search-results__action__counter" v-if="selectedQueries.length">
              {{ selectedQueries.length }}
            </b-badge>
          </b-btn>
          <b-popover target="batch-search-results-filters-toggle" triggers="focus" placement="bottom" lazy custom-class="popover-body-p-0">
            <batch-search-results-filters :uuid="uuid" :index="index" hide-border></batch-search-results-filters>
          </b-popover>
        </div>
        <div class="batch-search-results__action batch-search-results__delete" v-if="isMyBatchSearch" v-b-tooltip.hover :title="$t('batchSearch.delete')">
          <confirm-button class="btn btn-light ml-2" :confirmed="deleteBatchSearch" :label="$t('batchSearch.delete')" :yes="$t('global.yes')" :no="$t('global.no')">
            <fa icon="trash-alt"></fa>
            <span class="sr-only">
              {{ $t('batchSearch.delete') }}
            </span>
          </confirm-button>
        </div>
        <div class="batch-search-results__action batch-search-results__relaunch float-right" v-if="isMyBatchSearch && isBatchsearchEnded">
          <b-btn class="btn-light ml-2" @click="$refs['batch-search-copy-form'].show()" :disabled="isRelaunch">
            <fa icon="redo"></fa>
            {{ $t('batchSearchResults.relaunch') }}
          </b-btn>
          <b-modal ref="batch-search-copy-form" hide-footer :title="$t('batchSearchResults.relaunchTitle')" size="md" body-class="p-0">
            <b-form @submit.prevent="copyBatchSearch">
              <div class="card w-100">
                <div class="card-body pb-1">
                  <b-form-group
                    label-size="sm"
                    :label="`${ $t('batchSearch.name') } *`">
                    <b-form-input
                      v-model="name"
                      type="text"
                      required></b-form-input>
                  </b-form-group>
                  <b-form-group
                  label-size="sm"
                  :label="$t('batchSearch.description')">
                    <b-form-textarea
                      v-model="description"
                      rows="2"
                      max-rows="6"></b-form-textarea>
                  </b-form-group>
                  <b-form-group
                    label-size="sm">
                    <b-form-checkbox
                      v-model="deleteAfterRelaunch"
                      switch>
                      {{ $t('batchSearchResults.deleteAfterRelaunch') }}
                    </b-form-checkbox>
                  </b-form-group>
                </div>
                <div class="card-footer">
                  <div class="d-flex justify-content-end align-items-center">
                    <b-btn type="submit" variant="primary">
                      {{ $t('global.submit') }}
                    </b-btn>
                  </div>
                </div>
              </div>
            </b-form>
          </b-modal>
        </div>
        <div class="batch-search-results__action batch-search-results__download-queries" v-b-tooltip.hover :title="$t('batchSearchResults.downloadQueriesTooltip')">
          <a :href="apiFullUrl('/api/batch/search/' + uuid + '/queries?format=csv')" class="btn btn-light ml-2">
            <fa icon="download"></fa>
            {{ $t('batchSearchResults.downloadQueries') }}
          </a>
        </div>
        <div class="batch-search-results__action batch-search-results__download-results float-right" v-b-tooltip.hover :title="$t('batchSearchResults.downloadQueriesTooltip')" v-if="results.length">
          <a :href="apiFullUrl('/api/batch/search/result/csv/' + uuid)" class="btn btn-primary ml-2">
            <fa icon="download"></fa>
            {{ $t('batchSearchResults.downloadResults') }}
          </a>
        </div>
      </div>
    </page-header>
    <div class="container py-4">
      <div class="batch-search-results__info d-md-flex align-items-start" v-if="Object.keys(batchSearch).length !== 0">
        <dl class="row m-0 w-50">
          <dt class="text-nowrap col-sm-6 text-right text-truncate" v-if="isServer">
            {{ $t('batchSearch.project') }}
          </dt>
          <dd class="col-sm-6 text-truncate" v-if="isServer">
            {{ batchSearch.project.name }}
          </dd>
          <dt class="col-sm-6 text-right text-truncate" v-if="isServer">
            {{ $t('batchSearch.published') }}
          </dt>
          <dd class="col-sm-6 text-truncate" v-if="isServer">
            <b-form-checkbox v-model="batchSearch.published" switch @change="changePublished" v-if="isMyBatchSearch"></b-form-checkbox>
            <span v-else>
              {{ batchSearch.published ? $t('global.yes') : $t('global.no') }}
            </span>
          </dd>
          <dt class="text-nowrap col-sm-6 text-right text-truncate">
            {{ $t('batchSearch.state') }}
          </dt>
          <dd class="col-sm-6 text-truncate">
            <batch-search-status :batch-search="batchSearch"></batch-search-status>
          </dd>
          <dt class="text-nowrap col-sm-6 text-right text-truncate">
            {{ $t('batchSearch.date') }}
          </dt>
          <dd class="col-sm-6 text-truncate">
            {{ moment(batchSearch.date).locale($i18n.locale).format('LLL') }}
          </dd>
          <dt class="text-nowrap col-sm-6 text-right text-truncate">
            {{ $t('batchSearch.nbResults') }}
          </dt>
          <dd class="col-sm-6 text-truncate">
            {{ batchSearch.nbResults }}
          </dd>
          <dt class="text-nowrap col-sm-6 text-right text-truncate">
            {{ $t('batchSearch.queries') }}
          </dt>
          <dd class="col-sm-6 text-truncate">
            {{ keys(batchSearch.queries).length }}
          </dd>
        </dl>
        <dl class="row m-0 w-50">
          <dt class="text-nowrap col-sm-6 text-right text-truncate">
            {{ $t('batchSearch.phraseMatch') }}
          </dt>
          <dd class="col-sm-6 text-truncate">
            {{ batchSearch.phraseMatches ? $t('global.yes') : $t('global.no') }}
          </dd>
          <dt class="text-nowrap col-sm-6 text-right text-truncate">
            {{ fuzzinessLabel }}
          </dt>
          <dd class="col-sm-6 text-truncate">
            {{ batchSearch.fuzziness }}
          </dd>
          <dt class="text-nowrap col-sm-6 text-right text-truncate">
            {{ $t('batchSearch.fileTypes') }}
          </dt>
          <dd class="col-sm-6 text-truncate">
            <ul v-if="batchSearch.fileTypes.length" class="list-unstyled list-group list-group-horizontal">
              <li v-for="fileType in batchSearch.fileTypes" :key="fileType" class="mr-2">
                <content-type-badge :value="fileType"></content-type-badge>
              </li>
            </ul>
            <span v-else>
              {{ $t('global.no') }}
            </span>
          </dd>
          <dt class="text-nowrap col-sm-6 text-right text-truncate">
            {{ $t('batchSearch.path') }}
          </dt>
          <dd class="col-sm-6 text-truncate">
            <ul v-if="batchSearch.paths.length" class="list-unstyled list-group list-group-horizontal">
              <li v-for="path in batchSearch.paths" :key="path" class="mr-2">
                <b-badge variant="dark">
                  {{ path }}
                </b-badge>
              </li>
            </ul>
            <span v-else>
              {{ $t('global.no') }}
            </span>
          </dd>
          <dt class="col-sm-6 text-right text-truncate" v-if="isServer">
            {{ $t('batchSearch.author') }}
          </dt>
          <dd class="col-sm-6 text-truncate" v-if="isServer">
            {{ batchSearch.user.id }}
          </dd>
        </dl>
      </div>
      <v-wait for="load batchSearch results">
        <div slot="waiting" class="card py-2">
          <content-placeholder :rows="rows" class="p-0 my-2"></content-placeholder>
          <content-placeholder :rows="rows" class="p-0 my-2"></content-placeholder>
          <content-placeholder :rows="rows" class="p-0 my-2"></content-placeholder>
        </div>
        <div class="batch-search-results__queries">
          <div class="card small">
            <b-table
              class="m-0"
              :empty-text="$t('global.emptyTextTable')"
              :fields="fields"
              hover
              :items="results"
              no-local-sorting
              no-sort-reset
              :per-page="perPage"
              responsive
              show-empty
              striped
              :sort-by="sortBy"
              @sort-changed="sortChanged"
              :sort-desc="orderBy"
              tbody-tr-class="batch-search-results__queries__query">
              <template v-slot:cell(documentNumber)="{ item }">
                {{ item.documentNumber + 1 }}
              </template>
              <template v-slot:cell(documentPath)="{ item, index }">
                <router-link
                  @click.native="openDocumentModal($event, index)"
                  class="batch-search-results__queries__query__link"
                  target="_blank"
                  :to="{ name: 'document-standalone', params: { index: $route.params.index, id: item.documentId, routing: item.rootId }, query: { q: item.query } }">
                  <active-text-truncate class="batch-search-results__queries__query__link__path" v-b-tooltip.hover :title="item.documentPath">
                    {{ item.documentPath }}
                  </active-text-truncate>
                </router-link>
              </template>
              <template v-slot:cell(creationDate)="{ item }">
                <span :title="moment(item.creationDate).locale($i18n.locale).format('LLL')">
                  {{ moment(item.creationDate).isValid() ? moment(item.creationDate).locale($i18n.locale).format('LL') : '' }}
                </span>
              </template>
              <template v-slot:cell(contentType)="{ item }">
                <content-type-badge :value="item.contentType" :document-name="item.documentPath"></content-type-badge>
              </template>
              <template v-slot:cell(contentLength)="{ item }">
                {{ getDocumentSize(item.contentLength, '-') }}
              </template>
              <template v-slot:cell(empty)>
                <div class="text-center">
                  {{ $t('batchSearchResults.empty') }}
                </div>
              </template>
            </b-table>
          </div>
        </div>
        <b-pagination-nav
          class="mt-2"
          :link-gen="linkGen"
          :number-of-pages="numberOfPages"
          use-router
          v-if="numberOfPages > 1"></b-pagination-nav>
      </v-wait>
    </div>
    <b-modal id="document-modal" size="xl" lazy hide-header hide-footer body-class="p-0">
      <div  v-if="documentInModal" :key="documentInModalIndex">
        <document-navbar :index="documentInModal.index" :id="documentInModal.id" :routing="documentInModal.routing">
          <template #back>
            <a @click="$bvModal.hide('document-modal')" role="button" class="small text-white">
              <fa icon="chevron-circle-left" />
              <span class="ml-2">
                {{ $t('Back to results') }}
              </span>
            </a>
          </template>
          <template #nav>
            <quick-item-nav v-model="documentInModalIndex" :total-items="totalItems" />
          </template>
        </document-navbar>
        <document-view :index="documentInModal.index" :id="documentInModal.id" :routing="documentInModal.routing" :q="documentInModal.q" />
      </div>
    </b-modal>
  </div>
</template>

<script>
import { castArray, find, get, indexOf, isEqual, keys, sumBy } from 'lodash'
import moment from 'moment'
import { mapState } from 'vuex'

import Api from '@/api'
import Auth from '@/api/resources/Auth'
import BatchSearchResultsFilters from '@/components/BatchSearchResultsFilters'
import BatchSearchStatus from '@/components/BatchSearchStatus'
import ContentTypeBadge from '@/components/ContentTypeBadge'
import DocumentNavbar from '@/components/document/DocumentNavbar'
import DocumentView from '@/pages/DocumentView'
import PageHeader from '@/components/PageHeader'
import QuickItemNav from '@/components/QuickItemNav'
import humanSize from '@/filters/humanSize'
import utils from '@/mixins/utils'
import settings from '@/utils/settings'
import { toVariant } from '@/utils/utils'

export const api = new Api()
export const auth = new Auth()

/**
 * This page will list all the results of a batch search.
 */
export default {
  name: 'BatchSearchResults',
  components: {
    BatchSearchResultsFilters,
    BatchSearchStatus,
    ContentTypeBadge,
    DocumentNavbar,
    DocumentView,
    PageHeader,
    QuickItemNav
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
     * The Elasticsearch index of the batch search
     */
    index: {
      type: String
    }
  },
  filters: {
    humanSize
  },
  data () {
    return {
      deleteAfterRelaunch: false,
      description: '',
      documentInModalPageIndex: null,
      fields: [
        {
          key: 'documentNumber',
          label: this.$t('batchSearchResults.rank'),
          sortable: true,
          name: 'doc_nb'
        },
        {
          key: 'query',
          label: this.$t('batchSearchResults.query'),
          sortable: true,
          name: 'query'
        },
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
      ],
      isMyBatchSearch: false,
      isRelaunch: false,
      name: '',
      order: settings.batchSearchResults.order,
      page: 1,
      published: false,
      queries: [],
      rows: [
        {
          height: '1em',
          boxes: [['10%', '80%']]
        }
      ],
      sort: settings.batchSearchResults.sort
    }
  },
  watch: {
    page () {
      this.fetch()
    },
    queries (queries, oldQueries = []) {
      // Check array values to avoid unnecessary fetching
      if (!isEqual(queries, oldQueries)) {
        this.fetch()
      }
    },
    sort () {
      this.fetch()
    },
    order () {
      this.fetch()
    }
  },
  mounted () {
    this.fetch()
  },
  computed: {
    ...mapState('batchSearch', ['batchSearch', 'results']),
    selectedQueries () {
      return get(this, '$store.state.batchSearch.selectedQueries', [])
    },
    fuzzinessLabel () {
      return this.batchSearch.phraseMatches ? this.$t('batchSearch.proximitySearches') : this.$t('batchSearch.fuzziness')
    },
    perPage () {
      return settings.batchSearchResults.size
    },
    sortBy () {
      return find(this.fields, item => item.name === this.sort).key
    },
    orderBy () {
      return this.order === 'desc'
    },
    totalItems () {
      if (this.selectedQueries.length === 0) {
        return this.batchSearch.nbResults
      } else {
        return sumBy(keys(this.batchSearch.queries), query => {
          if (indexOf(this.selectedQueries, query) > -1) {
            return this.batchSearch.queries[query]
          }
        })
      }
    },
    numberOfPages () {
      return Math.ceil(this.totalItems / this.perPage)
    },
    isBatchsearchEnded () {
      return this.batchSearch.state === 'FAILURE' || this.batchSearch.state === 'SUCCESS'
    },
    hasDocumentInModal () {
      const pageIndex = this.documentInModalPageIndex
      return pageIndex !== null && this.results[pageIndex]
    },
    documentInModal () {
      if (!this.hasDocumentInModal) {
        return null
      }
      const document = this.results[this.documentInModalPageIndex]
      const { documentId: id, rootId: routing, query: q } = document
      const { index } = this.$route.params
      return { index, id, routing, q }
    },
    documentInModalIndex: {
      get () {
        return this.pageOffset + this.documentInModalPageIndex
      },
      async set (index) {
        if (index >= this.pageOffset + this.perPage) {
          this.page++
        } else if (index < this.pageOffset) {
          this.page--
        }
        this.documentInModalPageIndex = index - this.pageOffset
      }
    },
    pageOffset () {
      return (this.page - 1) * this.perPage
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.$set(vm, 'published', vm.batchSearch.published)
      vm.$set(vm, 'page', parseInt(get(to, 'query.page', vm.page)))
      vm.$set(vm, 'queries', castArray(get(to, 'query.queries', vm.queries)))
      vm.$set(vm, 'sort', get(to, 'query.sort', vm.sort))
      vm.$set(vm, 'order', get(to, 'query.order', vm.order))
    })
  },
  beforeRouteUpdate (to, from, next) {
    this.$set(this, 'page', parseInt(get(to, 'query.page', this.page)))
    this.$set(this, 'queries', castArray(get(to, 'query.queries', this.queries)))
    this.$set(this, 'sort', get(to, 'query.sort', this.sort))
    this.$set(this, 'order', get(to, 'query.order', this.order))
    next()
  },
  beforeRouteLeave (to, from, next) {
    this.$store.commit('batchSearch/batchSearch', {})
    this.$store.commit('batchSearch/selectedQueries', [])
    next()
  },
  methods: {
    async checkIsMyBatchSearch () {
      const username = await auth.getUsername()
      this.isMyBatchSearch = username === get(this, 'batchSearch.user.id', '')
    },
    async fetch () {
      this.$wait.start('load batchSearch results')
      this.$Progress.start()
      await this.$store.dispatch('batchSearch/getBatchSearch', this.uuid)
      await this.checkIsMyBatchSearch()
      this.$set(this, 'description', this.batchSearch.description)
      this.$set(this, 'name', this.batchSearch.name)
      const from = this.pageOffset
      const size = this.perPage
      const batchId = this.uuid
      const queries = this.queries
      const sort = this.sort
      const order = this.order
      const params = { batchId, from, size, queries, sort, order }
      await this.$store.dispatch('batchSearch/getBatchSearchResults', params)
      this.$Progress.finish()
      this.$wait.end('load batchSearch results')
    },
    async sortChanged (ctx) {
      const sort = find(this.fields, item => item.key === ctx.sortBy).name
      const order = ctx.sortDesc ? 'desc' : 'asc'
      this.$router.push(this.generateLinkToBatchSearchResults(this.page, this.queries, sort, order))
    },
    filter () {
      this.$router.push(this.generateLinkToBatchSearchResults(1, this.selectedQueries))
    },
    linkGen (page) {
      return this.generateLinkToBatchSearchResults(page, this.selectedQueries)
    },
    apiFullUrl (url) {
      return Api.getFullUrl(url)
    },
    generateLinkToBatchSearchResults (page = this.page, queries = this.queries, sort = this.sort, order = this.order) {
      return {
        name: 'batch-search.results',
        params: { index: this.$route.params.index, uuid: this.$route.params.uuid },
        query: { page, queries: queries.map(query => query.label), sort, order, queries_sort: this.$route.query.queries_sort || undefined }
      }
    },
    async deleteBatchSearch () {
      const isDeleted = await this.$store.dispatch('batchSearch/deleteBatchSearch', { batchId: this.uuid })
      this.$router.push({ name: 'batch-search' })
      this.$root.$bvToast.toast(isDeleted ? this.$t('batchSearch.deleted') : this.$t('batchSearch.notDeleted'),
        { noCloseButton: true, variant: isDeleted ? 'success' : 'warning' })
    },
    async copyBatchSearch () {
      try {
        await api.copyBatchSearch(this.uuid, this.name, this.description)
        this.$set(this, 'isRelaunch', true)
        if (!this.isServer) {
          try {
            await this.$store.dispatch('indexing/runBatchSearch')
            this.$root.$bvToast.toast(this.$t('batchSearch.success'), { noCloseButton: true, variant: 'success' })
          } catch (_) {
            this.$root.$bvToast.toast(this.$t('batchSearch.error'), { noCloseButton: true, variant: 'danger' })
          }
        } else {
          this.$root.$bvToast.toast(this.$t('batchSearch.submitSuccess'), { noCloseButton: true, variant: 'success' })
        }
        if (this.deleteAfterRelaunch) {
          await this.$store.dispatch('batchSearch/deleteBatchSearch', { batchId: this.uuid })
        }
      } catch (_) {
        this.$root.$bvToast.toast(this.$t('batchSearch.submitError'), { noCloseButton: true, variant: 'danger' })
      } finally {
        this.$router.push({ name: 'batch-search' })
      }
    },
    getDocumentSize (value) {
      const size = humanSize(value)
      return size === 'unknown' ? '-' : size
    },
    changePublished (published) {
      this.$store.dispatch('batchSearch/updateBatchSearch', { batchId: this.uuid, published })
    },
    openDocumentModal (event, pageIndex) {
      event.preventDefault()
      this.$set(this, 'documentInModalPageIndex', pageIndex)
      this.$bvModal.show('document-modal')
    },
    keys,
    moment,
    toVariant
  }
}
</script>

<style lang="scss" scoped>
.batch-search-results {
  &__action {
    position: relative;

    & &__counter {
      margin: 0;
      position: absolute;
      right: 0;
      top: 0;
      transform: translate(50%, -50%);
      z-index: 100;
    }
  }

  &__queries {
    table {
      margin: 0;

      thead tr th {
        border-top: 0;
        white-space: nowrap;

        &[aria-sort]:hover {
          background-color: $lighter;
        }
      }
    }

    &__query__link {
      &:visited {
        color: mix(#609, white, 50%);
      }

      &__path {
        max-width: 30vw;
        display: block;
      }
    }
  }
}
</style>
