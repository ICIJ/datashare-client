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
          <dd class="col-sm-8"><b-badge variant="darker">{{ capitalize(meta.state) }}</b-badge></dd>
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
          <b-table striped hover no-local-sorting :fields="fields" :items="results" :sort-by="sortBy" :sort-desc="orderBy" @sort-changed="sortChanged" tbody-tr-class="batch-search-results__queries__query">
            <template #documentNumber="{ item }">
              {{ item.documentNumber + 1 }}
            </template>
            <template #documentName="{ item }">
              <router-link :to="{ name: 'document', params: { index: $route.params.index, id: item.documentId, routing: item.rootId } }" target="_blank" class="batch-search-results__queries__query__link">
                {{ item.documentName }}
              </router-link>
            </template>
            <template #creationDate="{ item }">
              {{ moment(item.creationDate).isValid() ? moment(item.creationDate).format('LLL') : '' }}
            </template>
            <template #contentType="{ item }">
              {{ getDocumentTypeLabel(item.contentType) }}
            </template>
            <template #contentLength="{ item }">
              {{ item.contentLength | humanSize }}
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
import castArray from 'lodash/castArray'
import find from 'lodash/find'
import get from 'lodash/get'

import DatashareClient from '@/api/DatashareClient'
import { getDocumentTypeLabel } from '@/utils/utils'
import humanSize from '@/filters/humanSize'
import Pagination from '@/components/Pagination'
import settings from '@/utils/settings'

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
          sortable: true,
          name: 'doc_nb'
        },
        {
          key: 'query',
          label: this.$t('batchSearchResults.query')
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
      isReady: false,
      rows: [
        {
          height: '1em',
          boxes: [['10%', '80%']]
        }
      ],
      from: 0,
      size: settings.batchSearchResults.size,
      queries: [],
      sort: settings.batchSearchResults.sort,
      order: settings.batchSearchResults.order
    }
  },
  beforeRouteEnter (to, from, next) {
    next(async vm => {
      vm.$set(vm, 'from', parseInt(get(to.query, 'from', vm.from)))
      vm.$set(vm, 'size', parseInt(get(to.query, 'size', vm.size)))
      vm.$set(vm, 'queries', castArray(get(to.query, 'queries', vm.queries)))
      vm.$set(vm, 'sort', get(to.query, 'sort', vm.sort))
      vm.$set(vm, 'order', get(to.query, 'order', vm.order))
      store.commit('batchSearch/selectedQueries', vm.queries)
      await vm.fetchBatchSearches()
      await vm.fetch()
    })
  },
  async beforeRouteUpdate (to, from, next) {
    this.$set(this, 'from', parseInt(get(to.query, 'from', this.from)))
    this.$set(this, 'size', parseInt(get(to.query, 'size', this.size)))
    this.$set(this, 'queries', get(to.query, 'queries', this.queries))
    this.$set(this, 'sort', get(to.query, 'sort', this.sort))
    this.$set(this, 'order', get(to.query, 'order', this.order))
    store.commit('batchSearch/selectedQueries', this.queries)
    await this.fetchBatchSearches()
    await this.fetch()
    next()
  },
  computed: {
    ...mapState('batchSearch', ['results', 'selectedQueries']),
    meta () {
      return find(this.$store.state.batchSearch.batchSearches, { uuid: this.uuid }) || { }
    },
    downloadLink () {
      return DatashareClient.getFullUrl(`/api/batch/search/result/csv/${this.uuid}`)
    },
    sortBy () {
      return find(this.fields, item => item.name === this.sort).key
    },
    orderBy () {
      return this.order === 'desc'
    }
  },
  mounted () {
    this.$root.$on('batch-search-results::filter', this.filter)
  },
  methods: {
    async fetch () {
      this.$set(this, 'isReady', false)
      this.$Progress.start()
      await this.fetchBatchSearchResults()
      this.$Progress.finish()
      this.$set(this, 'isReady', true)
    },
    fetchBatchSearches () {
      return store.dispatch('batchSearch/getBatchSearches')
    },
    fetchBatchSearchResults () {
      return store.dispatch('batchSearch/getBatchSearchResults', { batchId: this.uuid, from: this.from, size: this.size, queries: this.queries, sort: this.sort, order: this.order })
    },
    getToTemplate () {
      return { name: 'batch-search.results', params: { index: this.$route.params.index, uuid: this.$route.params.uuid }, query: { from: this.from, size: this.size, queries: this.queries, sort: this.sort, order: this.order } }
    },
    async sortChanged (ctx) {
      const sort = find(this.fields, item => item.key === ctx.sortBy).name
      const order = ctx.sortDesc ? 'desc' : 'asc'
      this.$router.push({ name: 'batch-search.results', params: { index: this.$route.params.index, uuid: this.$route.params.uuid }, query: { from: this.from, size: this.size, queries: this.queries, sort, order } })
    },
    filter () {
      this.$router.push({ name: 'batch-search.results', params: { index: this.$route.params.index, uuid: this.$route.params.uuid }, query: { from: this.from, size: this.size, queries: this.selectedQueries, sort: this.sort, order: this.order } })
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
