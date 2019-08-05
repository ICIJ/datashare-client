<template>
  <div class="batch-search-results">
    <div class="d-flex my-2 mx-3">
      <h3 class="text-truncate flex-grow-1">
        {{ meta.name }}
      </h3>
      <router-link :to="{ name: 'batch-search' }" class="p-2">
        <fa icon="times" size="lg" />
      </router-link>
    </div>
    <div class="batch-search-results__queries">
      <b-table striped hover bordered :fields="fields" :items="results" tbody-tr-class="batch-search-results__queries__query">
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
      </b-table>
    </div>
    <div class="batch-search-results__download text-right b-0 pr-4">
      <b-button variant="primary" :href="downloadLink">
        <fa icon="download" />
        {{ $t('batchSearchResults.downloadResults') }}
      </b-button>
    </div>
  </div>
</template>

<script>
import store from '@/store'
import moment from 'moment'
import last from 'lodash/last'
import find from 'lodash/find'

import DatashareClient from '@/api/DatashareClient'

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
  data () {
    return {
      results: [],
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
          label: this.$t('batchSearchResults.creationDate')
        }
      ]
    }
  },
  async beforeRouteEnter (to, from, next) {
    const results = await store.dispatch('batchSearch/getBatchSearchResults', to.params.uuid)
    next(vm => { vm.results = results })
  },
  computed: {
    meta () {
      return find(this.$store.state.batchSearch.batchSearches, { uuid: this.uuid }) || { }
    },
    downloadLink () {
      return DatashareClient.getFullUrl(`/api/batch/search/result/csv/${this.uuid}`)
    }
  },
  methods: {
    getFileName (documentPath) {
      return last(documentPath.split('/'))
    },
    moment
  }
}
</script>
