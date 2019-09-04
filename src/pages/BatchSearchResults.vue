<template>
  <div class="batch-search-results">
    <div class="batch-search-results__explanation bg-white py-5">
      <div class="container">
        <div class="batch-search-results__download float-right">
          <a :href="downloadLink" class="btn btn-primary">
            <fa icon="download" />
            {{ $t('batchSearchResults.downloadResults') }} (CSV)
          </a>
        </div>
        <h3>
          <router-link :to="{ name: 'batch-search' }">
            {{ $t('batchSearch.title') }}
          </router-link>
          <fa icon="angle-right" class="small" />
          {{ meta.name }}
        </h3>
        <p class="m-0">
          {{ meta.description }}
        </p>
      </div>
    </div>
    <div class="container py-4">
      <div class="batch-search-results__info d-flex my-2 mx-3">
        <dl class="row" v-if="Object.keys(meta).length !== 0">
          <dt class="col-sm-4 text-right">{{ $t('batchSearch.projectName') }}</dt>
          <dd class="col-sm-8">{{ meta.project.name }}</dd>
          <dt class="col-sm-4 text-right">{{ $t('batchSearch.state') }}</dt>
          <dd class="col-sm-8"><span class="badge badge-darker">{{ capitalize(meta.state) }}</span></dd>
          <dt class="col-sm-4 text-right">{{ $t('batchSearch.date') }}</dt>
          <dd class="col-sm-8">{{ moment(meta.date).format('LLL') }}</dd>
          <dt class="col-sm-4 text-right">{{ $t('batchSearch.nbResults') }}</dt>
          <dd class="col-sm-8">{{ meta.nbResults }}</dd>
        </dl>
      </div>
      <div v-if="!isReady" class="card">
        <div>
          <content-placeholder :rows="rows" class="p-0 my-3" />
          <content-placeholder :rows="rows" class="p-0 my-3" />
          <content-placeholder :rows="rows" class="p-0 my-3" />
        </div>
      </div>
      <div v-else class="batch-search-results__queries">
        <div class="card">
          <b-table striped hover :fields="fields" :items="results" tbody-tr-class="batch-search-results__queries__query" :filter="selectedQueries" :filter-function="filter">
            <template #documentNumber="row">
              {{ row.item.documentNumber + 1 }}
            </template>
            <template #documentName="row">
              <router-link :to="{ name: 'document', params: { index: $route.params.index, id: row.item.documentId, routing: row.item.rootId } }" target="_blank" class="batch-search-results__queries__query__link">
                {{ row.item.documentName }}
              </router-link>
            </template>
            <template #creationDate="row">
              {{ moment(row.item.creationDate).isValid() ? moment(row.item.creationDate).format('LLL') : '' }}
            </template>
            <template #contentType="row">
              {{ getDocumentTypeLabel(row.item.contentType) }}
            </template>
            <template #contentLength="row">
              {{  row.item.contentLength | humanSize }}
            </template>
          </b-table>
        </div>
      </div>
      <pagination :total="meta.nbResults" :get-to-template="getToTemplate"></pagination>
    </div>
  </div>
</template>

<script>
import store from '@/store'
import moment from 'moment'
import { mapState } from 'vuex'
import capitalize from 'lodash/capitalize'
import find from 'lodash/find'
import get from 'lodash/get'
import includes from 'lodash/includes'

import DatashareClient from '@/api/DatashareClient'
import { getDocumentTypeLabel } from '@/utils/utils'
import humanSize from '@/filters/humanSize'
import Pagination from '@/components/Pagination'

export default {
  name: 'BatchSearchResults',
  components: {
    Pagination
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
    humanSize
  },
  data () {
    return {
      fields: [
        {
          key: 'documentNumber',
          label: this.$t('batchSearchResults.index'),
          sortable: true
        },
        {
          key: 'query',
          label: this.$t('batchSearchResults.query'),
          sortable: true
        },
        {
          key: 'documentName',
          label: this.$t('batchSearchResults.documentName'),
          sortable: true
        },
        {
          key: 'creationDate',
          label: this.$t('batchSearchResults.creationDate'),
          sortable: true
        },
        {
          key: 'contentType',
          label: this.$t('batchSearchResults.contentType'),
          sortable: true
        },
        {
          key: 'contentLength',
          label: this.$t('batchSearchResults.size'),
          sortable: true
        }
      ],
      isReady: false,
      rows: [
        {
          height: '1em',
          boxes: [['10%', '80%']]
        }
      ],
      from: 0,
      size: 100,
      queries: [],
      sort: 'doc_nb',
      order: 'desc'
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.from = parseInt(get(to.query, 'from', vm.from))
      vm.size = parseInt(get(to.query, 'size', vm.size))
      vm.queries = get(to.query, 'queries', vm.queries)
      vm.sort = get(to.query, 'sort', vm.sort)
      vm.order = get(to.query, 'order', vm.order)
      vm.fetch()
    })
  },
  async beforeRouteUpdate (to, from, next) {
    this.from = parseInt(get(to.query, 'from', this.from))
    this.size = parseInt(get(to.query, 'size', this.size))
    this.queries = get(to.query, 'queries', this.queries)
    this.sort = get(to.query, 'sort', this.sort)
    this.order = get(to.query, 'order', this.order)
    await this.fetch()
    next()
  },
  computed: {
    ...mapState('batchSearch', ['results']),
    meta () {
      return find(this.$store.state.batchSearch.batchSearches, { uuid: this.uuid }) || { }
    },
    downloadLink () {
      return DatashareClient.getFullUrl(`/api/batch/search/result/csv/${this.uuid}`)
    },
    selectedQueries () {
      return this.$store.state.batchSearch.selectedQueries
    }
  },
  methods: {
    async fetch () {
      this.$Progress.start()
      await this.fetchBatchSearches()
      await this.fetchBatchSearchResults()
      this.isReady = true
      this.$Progress.finish()
    },
    fetchBatchSearches () {
      return store.dispatch('batchSearch/getBatchSearches')
    },
    fetchBatchSearchResults () {
      return store.dispatch('batchSearch/getBatchSearchResults', { batchId: this.uuid, from: this.from, size: this.size, queries: this.queries, sort: this.sort, order: this.order })
    },
    filter (item, filter) {
      return includes(filter, item.query)
    },
    getToTemplate () {
      return { name: 'batch-search.results', params: { index: this.$route.params.index, uuid: this.$route.params.uuid }, query: { from: this.from, size: this.size } }
    },
    capitalize,
    moment,
    getDocumentTypeLabel
  }
}
</script>

<style lang="scss">
.batch-search-results {

  &__queries {
    table {
      margin: 0;

      thead th {
        border-top: 0;
      }
    }
  }
}
</style>
