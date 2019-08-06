<template>
  <div class="batch-search-results">
    <div class="batch-search-results__title d-flex my-2 mx-3">
      <h3 class="text-truncate flex-grow-1">
        {{ meta.name }}
      </h3>
      <router-link :to="{ name: 'batch-search' }" class="p-2">
        <fa icon="times" size="lg" />
      </router-link>
    </div>
    <div class="batch-search-results__info d-flex my-2 mx-3">
      <dl class="row" v-if="Object.keys(meta).length !== 0">
        <dt class="col-sm-3">{{ $t('batchSearch.projectName') }}</dt>
        <dd class="col-sm-9">{{ meta.project.name }}</dd>
        <dt class="col-sm-3">{{ $t('batchSearch.description') }}</dt>
        <dd class="col-sm-9">{{ meta.description }}</dd>
        <dt class="col-sm-3">{{ $t('batchSearch.state') }}</dt>
        <dd class="col-sm-9">{{ capitalize(meta.state) }}</dd>
        <dt class="col-sm-3">{{ $t('batchSearch.date') }}</dt>
        <dd class="col-sm-9">{{ moment(meta.date).format('LLL') }}</dd>
      </dl>
    </div>
    <div class="batch-search-results__download d-flex my-2 mx-3">
      <div>
        {{ $t('batchSearchResults.sample') }}
      </div>
      <div class="ml-2">
        <a :href="downloadLink">
          <fa icon="download" />
          {{ $t('batchSearchResults.downloadResults') }}
        </a>
      </div>
    </div>
    <div class="batch-search-results__filters d-flex my-2 mx-3">
      <a @click.prevent="setFilter('')" href>
        {{ $t('batchSearchResults.all') }}
      </a>
      <a v-for="query in meta.queries" :key="query" @click.prevent="setFilter(query)" href class="ml-2">
        {{ query }}
      </a>
    </div>
    <div class="batch-search-results__queries">
      <b-table striped hover bordered :fields="fields" :items="results" tbody-tr-class="batch-search-results__queries__query" :filter="filter">
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
  </div>
</template>

<script>
import store from '@/store'
import moment from 'moment'
import capitalize from 'lodash/capitalize'
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
          label: this.$t('batchSearchResults.creationDate'),
          sortable: true
        }
      ],
      filter: ''
    }
  },
  async beforeRouteUpdate (to, from, next) {
    this.results = await store.dispatch('batchSearch/getBatchSearchResults', to.params.uuid, 0, 100)
    next()
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
    setFilter (filter) {
      this.filter = filter
    },
    capitalize,
    moment
  }
}
</script>

<style lang="scss">
.batch-search {
  .batch-search-results {
    .row {
      min-height: auto;
    }

    &__filters {
      overflow-x: auto;
    }
  }
}
</style>
