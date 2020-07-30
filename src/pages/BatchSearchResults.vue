<template>
  <div class="batch-search-results">
    <page-header icon="layer-group" :title="batchSearch.name" :description="batchSearch.description">
      <template v-slot:preTitle>
        <router-link :to="{ name: 'batch-search' }">{{ $t('batchSearch.title') }}</router-link>
        <fa icon="angle-right" class="small ml-2"></fa>
      </template>
      <div class="d-flex my-2 mx-3">
        <div>
          <b-button variant="light" class="batch-search-results__action mr-2" id="batch-search-results-filters-toggle" v-b-tooltip.hover :title="$t('batchSearchResultsFilters.queries.heading')">
            <fa icon="filter"></fa>
            <span class="sr-only">
                {{ $t('batchSearchResultsFilters.queries.heading') }}
              </span>
            <b-badge variant="secondary" class="batch-search-results__action__counter" v-if="selectedQueries.length">
              {{ selectedQueries.length }}
            </b-badge>
          </b-button>
          <b-popover target="batch-search-results-filters-toggle" triggers="focus" placement="bottom" lazy custom-class="popover-body-p-0">
            <batch-search-results-filters :uuid="uuid" :index="index" hide-border />
          </b-popover>
        </div>
        <div class="batch-search-results__action batch-search-results__delete" v-if="isMyBatchSearch">
          <confirm-button class="btn btn-light mr-2" :confirmed="deleteBatchSearch" v-b-tooltip.hover :title="$t('batchSearch.delete')">
            <fa icon="trash-alt"></fa>
            <span class="sr-only">
                {{ $t('batchSearch.delete') }}
              </span>
          </confirm-button>
        </div>
        <div class="batch-search-results__action batch-search-results__download__queries" v-b-tooltip.hover :title="$t('batchSearchResults.downloadTooltip')">
          <a :href="apiFullUrl('/api/batch/search/' + uuid + '/queries?format=csv')" class="btn btn-light mr-2">
            <fa icon="download"></fa>
            {{ $t('batchSearchResults.downloadQueries') }}
          </a>
        </div>
        <div class="batch-search-results__action batch-search-results__download__results float-right" v-b-tooltip.hover :title="$t('batchSearchResults.downloadTooltip')" v-if="results.length">
          <a :href="apiFullUrl('/api/batch/search/result/csv/' + uuid)" class="btn btn-primary" >
            <fa icon="download"></fa>
            {{ $t('batchSearchResults.downloadResults') }}
          </a>
        </div>
      </div>
    </page-header>
    <div class="container py-4">
      <div class="batch-search-results__info d-md-flex align-items-start" v-if="Object.keys(batchSearch).length !== 0">
        <dl class="row mb-0">
          <dt class="text-nowrap col-sm-4 text-right" v-if="$config.is('multipleProjects')">
            {{ $t('batchSearch.project') }}
          </dt>
          <dd class="col-sm-8" v-if="$config.is('multipleProjects')">
            {{ batchSearch.project.name }}
          </dd>
          <dt class="col-sm-4 text-right" v-if="$config.is('multipleProjects')">
            {{ $t('batchSearch.published') }}
          </dt>
          <dd class="col-sm-8" v-if="$config.is('multipleProjects')">
            <b-form-checkbox v-model="batchSearch.published" switch @change="changePublished" v-if="isMyBatchSearch"></b-form-checkbox>
            <span v-else>{{ batchSearch.published ? $t('indexing.yes') : $t('indexing.no') }}</span>
          </dd>
          <dt class="text-nowrap col-sm-4 text-right">
            {{ $t('batchSearch.state') }}
          </dt>
          <dd class="col-sm-8">
            <b-badge
              @click.prevent="openErrorMessage"
              :class="{ 'cursor-pointer': isFailed }"
              :variant="batchSearch.state | toVariant">
              {{ capitalize(batchSearch.state) }}
            </b-badge>
          </dd>
          <dt class="text-nowrap col-sm-4 text-right">
            {{ $t('batchSearch.date') }}
          </dt>
          <dd class="col-sm-8">
            {{ moment(batchSearch.date).locale($i18n.locale).format('LLL') }}
          </dd>
          <dt class="text-nowrap col-sm-4 text-right">
            {{ $t('batchSearch.nbResults') }}
          </dt>
          <dd class="col-sm-8">
            {{ batchSearch.nbResults }}
          </dd>
          <dt class="text-nowrap col-sm-4 text-right">
            {{ $t('batchSearch.queries') }}
          </dt>
          <dd class="col-sm-8">
            {{ keys(batchSearch.queries).length }}
          </dd>
        </dl>
        <dl class="row mb-0">
          <dt class="text-nowrap col-sm-4 text-right">
            {{ $t('batchSearch.phraseMatch') }}
          </dt>
          <dd class="col-sm-8">
            {{ batchSearch.phraseMatches ? $t('indexing.yes') : $t('indexing.no') }}
          </dd>
          <dt class="text-nowrap col-sm-4 text-right">
            {{ fuzzinessLabel }}
          </dt>
          <dd class="col-sm-8">
            {{ batchSearch.fuzziness }}
          </dd>
          <dt class="text-nowrap col-sm-4 text-right">
            {{ $t('batchSearch.fileTypes') }}
          </dt>
          <dd class="col-sm-8">
            <ul v-if="batchSearch.fileTypes.length" class="list-unstyled list-group list-group-horizontal">
              <li v-for="fileType in batchSearch.fileTypes" :key="fileType" class="mr-2">
                <content-type-badge :value="fileType"></content-type-badge>
              </li>
            </ul>
            <span v-else>
              {{ $t('indexing.no') }}
            </span>
          </dd>
          <dt class="text-nowrap col-sm-4 text-right">
            {{ $t('batchSearch.path') }}
          </dt>
          <dd class="col-sm-8">
            <ul v-if="batchSearch.paths.length" class="list-unstyled list-group list-group-horizontal">
              <li v-for="path in batchSearch.paths" :key="path" class="mr-2">
                <b-badge variant="dark">
                  {{ path }}
                </b-badge>
              </li>
            </ul>
            <span v-else>
              {{ $t('indexing.no') }}
            </span>
          </dd>
          <dt class="col-sm-4 text-right" v-if="$config.is('multipleProjects')">
            {{ $t('batchSearch.author') }}
          </dt>
          <dd class="col-sm-8" v-if="$config.is('multipleProjects')">
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
              <template v-slot:cell(documentName)="{ item }">
                <router-link
                  class="batch-search-results__queries__query__link"
                  target="_blank"
                  :to="{ name: 'document', params: { index: $route.params.index, id: item.documentId, routing: item.rootId }, query: { q: item.query } }">
                  {{ item.documentName }}
                </router-link>
              </template>
              <template v-slot:cell(creationDate)="{ item }">
                <span :title="moment(item.creationDate).locale($i18n.locale).format('LLL')">
                  {{ moment(item.creationDate).isValid() ? moment(item.creationDate).locale($i18n.locale).format('LL') : '' }}
                </span>
              </template>
              <template v-slot:cell(contentType)="{ item }">
                <content-type-badge :value="item.contentType" :document-name="item.documentName"></content-type-badge>
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
    <b-modal id="error-modal" :title="$t('batchSearchResults.errorTitle')" ok-only>
      <div v-html="$t('batchSearchResults.errorMessage')"></div>
      <div class="code mt-3 px-3 py-1 text-monospace text-break">
        {{ this.batchSearch.errorMessage }}
      </div>
    </b-modal>
  </div>
</template>

<script>
import capitalize from 'lodash/capitalize'
import find from 'lodash/find'
import get from 'lodash/get'
import isEqual from 'lodash/isEqual'
import indexOf from 'lodash/indexOf'
import keys from 'lodash/keys'
import sumBy from 'lodash/sumBy'
import moment from 'moment'
import { mapState } from 'vuex'

import Api from '@/api'
import Auth from '@/api/resources/Auth'
import BatchSearchResultsFilters from '@/components/BatchSearchResultsFilters'
import ContentTypeBadge from '@/components/ContentTypeBadge'
import PageHeader from '@/components/PageHeader'
import humanSize from '@/filters/humanSize'
import toVariant from '@/filters/toVariant'
import settings from '@/utils/settings'

export const auth = new Auth()

export default {
  name: 'BatchSearchResults',
  components: {
    BatchSearchResultsFilters,
    ContentTypeBadge,
    PageHeader
  },
  props: {
    uuid: {
      type: String
    },
    index: {
      type: String
    }
  },
  filters: {
    humanSize,
    toVariant
  },
  data () {
    return {
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
          key: 'documentName',
          label: this.$t('batchSearchResults.documentName'),
          sortable: true,
          name: 'doc_name'
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
      rows: [
        {
          height: '1em',
          boxes: [['10%', '80%']]
        }
      ],
      page: 1,
      queries: [],
      sort: settings.batchSearchResults.sort,
      order: settings.batchSearchResults.order,
      published: false,
      isMyBatchSearch: false
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
    numberOfPages () {
      let total
      if (this.selectedQueries.length === 0) {
        total = this.batchSearch.nbResults
      } else {
        total = sumBy(keys(this.batchSearch.queries), query => {
          if (indexOf(this.selectedQueries, query) > -1) {
            return this.batchSearch.queries[query]
          }
        })
      }
      return Math.ceil(total / this.perPage)
    },
    isFailed () {
      return this.batchSearch.state === 'FAILURE'
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.$set(vm, 'published', vm.batchSearch.published)
      vm.$set(vm, 'page', parseInt(get(to, 'query.page', vm.page)))
      vm.$set(vm, 'queries', get(to, 'query.queries', vm.queries))
      vm.$set(vm, 'sort', get(to, 'query.sort', vm.sort))
      vm.$set(vm, 'order', get(to, 'query.order', vm.order))
    })
  },
  beforeRouteUpdate (to, from, next) {
    this.$set(this, 'page', parseInt(get(to, 'query.page', this.page)))
    this.$set(this, 'queries', get(to, 'query.queries', this.queries))
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
      const from = (this.page - 1) * this.perPage
      const size = this.perPage
      await this.$store.dispatch('batchSearch/getBatchSearchResults',
        { batchId: this.uuid, from, size, queries: this.queries, sort: this.sort, order: this.order })
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
    getDocumentSize (value) {
      const size = humanSize(value)
      return size === 'unknown' ? '-' : size
    },
    changePublished (published) {
      this.$store.dispatch('batchSearch/updateBatchSearch', { batchId: this.uuid, published })
    },
    openErrorMessage () {
      if (this.isFailed) {
        this.$bvModal.show('error-modal')
      }
    },
    capitalize,
    moment,
    keys
  }
}
</script>

<style lang="scss">
.batch-search-results {

  &__action {
    position: relative;

    & &__counter {
      position: absolute;
      right: 0;
      top: 0;
      margin: 0;
      z-index: 100;
      transform: translate(50%, -50%);
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
  }
}

.code {
  background-color: black;
  color: white;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
