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
        <p class="text-center text-muted">
          {{ $t('batchSearchResults.sample') }}
        </p>
        <div class="card">
          <b-table striped hover :fields="fields" :items="results" tbody-tr-class="batch-search-results__queries__query" :filter="selectedQueries" :filter-function="filter">
            <template #documentNumber="row">
              {{ row.item.documentNumber + 1 }}
            </template>
            <template #documentPath="row">
              <router-link :to="{ name: 'document', params: { index: $route.params.index, id: row.item.documentId, routing: row.item.rootId } }" target="_blank" class="batch-search-results__queries__query__link">
                {{ getFileName(row.item.documentPath) }}
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
      <div>
        <span @click="fetchFirstBatchSearchResults" class="p-2">
          <fa icon="angle-double-left" />
        </span>
        <span @click="fetchPreviousBatchSearchResults" class="p-2">
          <fa icon="angle-left" />
        </span>
        <span @click="fetchNextBatchSearchResults" class="p-2">
          <fa icon="angle-right" />
        </span>
        <span @click="fetchLastBatchSearchResults" class="p-2">
          <fa icon="angle-double-right" />
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import store from '@/store'
import moment from 'moment'
import capitalize from 'lodash/capitalize'
import find from 'lodash/find'
import floor from 'lodash/floor'
import includes from 'lodash/includes'
import { mapState } from 'vuex'
import last from 'lodash/last'
import max from 'lodash/max'

import DatashareClient from '@/api/DatashareClient'
import { getDocumentTypeLabel } from '@/utils/utils'
import humanSize from '@/filters/humanSize'

export default {
  name: 'BatchSearchResults',
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
          key: 'documentPath',
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
      size: 5
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => vm.fetch())
  },
  async beforeRouteUpdate (to, from, next) {
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
      await this.fetchBatchSearches()
      await this.fetchBatchSearchResults()
      this.isReady = true
    },
    fetchBatchSearches () {
      return store.dispatch('batchSearch/getBatchSearches')
    },
    fetchFirstBatchSearchResults () {
      this.from = 0
      this.fetchBatchSearchResults()
    },
    fetchPreviousBatchSearchResults () {
      this.from = max([0, this.from - this.size])
      this.fetchBatchSearchResults()
    },
    fetchNextBatchSearchResults () {
      const nextFrom = this.from + this.size
      this.from = nextFrom < this.meta.nbResults ? nextFrom : this.from
      this.fetchBatchSearchResults()
    },
    fetchLastBatchSearchResults () {
      const gap = (this.meta.nbResults % this.size === 0) ? 1 : 0
      this.from = this.size * (floor(this.meta.nbResults / this.size) - gap)
      this.fetchBatchSearchResults()
    },
    fetchBatchSearchResults () {
      return store.dispatch('batchSearch/getBatchSearchResults', { batchId: this.uuid, from: this.from, size: this.size })
    },
    getFileName (documentPath) {
      return last(documentPath.split('/'))
    },
    filter (item, filter) {
      return includes(filter, item.query)
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
