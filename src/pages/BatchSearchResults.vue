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
        <dt class="col-sm-4 text-right">{{ $t('batchSearch.projectName') }}</dt>
        <dd class="col-sm-8">{{ meta.project.name }}</dd>
        <dt class="col-sm-4 text-right">{{ $t('batchSearch.description') }}</dt>
        <dd class="col-sm-8">{{ meta.description }}</dd>
        <dt class="col-sm-4 text-right">{{ $t('batchSearch.state') }}</dt>
        <dd class="col-sm-8">{{ capitalize(meta.state) }}</dd>
        <dt class="col-sm-4 text-right">{{ $t('batchSearch.date') }}</dt>
        <dd class="col-sm-8">{{ moment(meta.date).format('LLL') }}</dd>
        <dt class="col-sm-4 text-right">{{ $t('batchSearch.nbResults') }}</dt>
        <dd class="col-sm-8">{{ meta.nbResults }}</dd>
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
    <div class="batch-search-results__selected-queries my-2 mx-3">
      <h5>
        {{ $t('batchSearch.queries') }}
      </h5>
      <selectable-dropdown
        class="batch-search-results__selected-queries__dropdown"
        deactivate-keys
        :items="meta.queries"
        multiple
        v-if="meta.queries && meta.queries.length > 1"
        v-model="selectedQueries"
      ></selectable-dropdown>
      <div v-else v-for="query in meta.queries" :key="query" class="batch-search-results__selected-queries__list">
        {{ query }}
      </div>
    </div>
    <div v-if="!isReady">
      <content-placeholder :rows="rows" class="p-0 my-3" />
      <content-placeholder :rows="rows" class="p-0 my-3" />
      <content-placeholder :rows="rows" class="p-0 my-3" />
    </div>
    <div v-else class="batch-search-results__queries">
      <b-table striped hover bordered :fields="fields" :items="results" tbody-tr-class="batch-search-results__queries__query" :filter="selectedQueries" :filter-function="filter">
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
          {{ getDocumentTypeLabel(row.item.document.contentType) }}
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
import includes from 'lodash/includes'

import DatashareClient from '@/api/DatashareClient'
import { getDocumentTypeLabel } from '@/utils/utils'
import { mapState } from 'vuex'

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
          key: 'document.humanSize',
          label: this.$t('batchSearchResults.size'),
          sortable: true
        }
      ],
      selectedQueries: [],
      isReady: false,
      rows: [
        {
          height: '1em',
          boxes: [['10%', '80%']]
        }
      ]
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => vm.getBatchSearchResults(to.params))
  },
  beforeRouteUpdate (to, from, next) {
    this.getBatchSearchResults(to.params)
    next()
  },
  computed: {
    ...mapState('batchSearch', ['results']),
    meta () {
      return find(this.$store.state.batchSearch.batchSearches, { uuid: this.uuid }) || { }
    },
    downloadLink () {
      return DatashareClient.getFullUrl(`/api/batch/search/result/csv/${this.uuid}`)
    }
  },
  methods: {
    async getBatchSearchResults (params) {
      await store.dispatch('batchSearch/getBatchSearchResults', params.uuid, 0, 100)
      this.isReady = true
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
.batch-search {
  .batch-search-results {
    .row {
      min-height: auto;
    }

    &__selected-queries__dropdown {
      max-height: 15rem;
      overflow: auto;
      width: 100%;
    }
  }
}
</style>
