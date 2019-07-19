<template>
  <div class="batchsearchresults batchsearchresults__queries container container-fluid w-100">
    <b-table striped hover bordered :fields="fields" :items="batchSearch" tbody-tr-class="batchsearchresults__queries__query">
      <template #documentNumber="row">
        {{ row.item.documentNumber + 1 }}
      </template>
      <template #documentPath="row">
        <router-link :to="{ name: 'document', params: { index: $route.params.index, id: row.item.documentId, routing: row.item.rootId } }" target="_blank" class="batchsearchresults__queries__query__link">
          {{ getFileName(row.item.documentPath) }}
        </router-link>
      </template>
      <template #creationDate="row">
        {{ moment(row.item.creationDate).isValid() ? moment(row.item.creationDate).format('LLL') : '' }}
      </template>
    </b-table>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import store from '@/store'
import moment from 'moment'
import last from 'lodash/last'

export default {
  name: 'BatchSearchResults',
  data () {
    return {
      fields: [
        {
          key: 'documentNumber',
          label: 'Index',
          sortable: true
        },
        {
          key: 'query',
          sortable: true
        },
        {
          key: 'documentPath',
          label: 'Document Name',
          sortable: true
        },
        {
          key: 'creationDate'
        }
      ]
    }
  },
  computed: {
    ...mapState('batchSearch', ['batchSearch'])
  },
  beforeRouteEnter (to, from, next) {
    return store.dispatch('batchSearch/getBatchSearch', to.params.id).then(() => next())
  },
  methods: {
    getFileName (documentPath) {
      return last(documentPath.split('/'))
    },
    moment
  }
}
</script>
