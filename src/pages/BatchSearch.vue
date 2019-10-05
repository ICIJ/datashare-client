<template>
  <div class="batch-search h-100">
    <div class="batch-search__explanation bg-white py-5">
      <div class="container">
        <h3>
          {{ $t('batchSearch.title') }}
        </h3>
        <p class="m-0">
          {{ $t('batchSearch.lead') }}
        </p>
      </div>
    </div>
    <div class="container pt-4">
      <div class="batch-search__items card">
        <div v-if="!isReady">
          <content-placeholder :rows="rows" class="p-0 my-3" />
          <content-placeholder :rows="rows" class="p-0 my-3" />
          <content-placeholder :rows="rows" class="p-0 my-3" />
        </div>
        <b-table v-else striped hover responsive :fields="fields" :items="items" thead-tr-class="text-nowrap" tbody-tr-class="batch-search__items__item small">
          <template v-slot:cell(name)="{ item }">
            <router-link :to="{ name: 'batch-search.results', params: { index: item.project.id, uuid: item.uuid }, query: { page: 1, sort, order } }" class="batch-search__items__item__link">
              {{ item.name }}
            </router-link>
          </template>
          <template v-slot:cell(queries)="{ item }">
            {{ $tc('batchSearch.query', keys(item.queries).length) }}
          </template>
          <template v-slot:cell(state)="{ item }">
            <b-badge :variant="item.state | toVariant">
              {{ capitalize(item.state) }}
            </b-badge>
          </template>
          <template v-slot:cell(date)="{ item }">
            {{ moment(item.date).format('LLL') }}
          </template>
          <template v-slot:cell(nbResults)="{ item }">
            {{ $n(item.nbResults) }}
          </template>
          <template v-slot:cell(published)="{ item }">
            {{ item.published ? $t('indexing.yes') : $t('indexing.no') }}
          </template>
        </b-table>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import moment from 'moment'
import capitalize from 'lodash/capitalize'
import compact from 'lodash/compact'
import keys from 'lodash/keys'

import toVariant from '@/filters/toVariant'
import settings from '@/utils/settings'

export default {
  name: 'BatchSearches',
  filters: {
    toVariant
  },
  data () {
    return {
      isReady: false,
      rows: [
        {
          height: '1em',
          boxes: [['10%', '80%']]
        }
      ]
    }
  },
  computed: {
    ...mapState('batchSearch', { items: 'batchSearches' }),
    sort () {
      return settings.batchSearchResults.sort
    },
    order () {
      return settings.batchSearchResults.order
    },
    projectNameField () {
      // Disable the project name field on server mode
      return this.$config.is('multipleProjects') ? {
        key: 'project.name',
        label: this.$t('batchSearch.project'),
        sortable: true
      } : null
    },
    fields () {
      return compact([
        this.projectNameField,
        {
          key: 'name',
          label: this.$t('batchSearch.name')
        },
        {
          key: 'description',
          label: this.$t('batchSearch.description'),
          sortable: false
        },
        {
          key: 'queries',
          label: this.$t('batchSearch.queries'),
          sortable: false
        },
        {
          key: 'state',
          label: this.$t('batchSearch.state'),
          sortable: true
        },
        {
          key: 'date',
          label: this.$t('batchSearch.date'),
          sortable: true
        },
        {
          key: 'nbResults',
          label: this.$t('batchSearch.nbResults'),
          sortable: true
        },
        {
          key: 'published',
          label: this.$t('batchSearch.published'),
          sortable: true
        }
      ])
    }
  },
  async created () {
    this.$set(this, 'isReady', false)
    this.$Progress.start()
    await this.$store.dispatch('batchSearch/getBatchSearches')
    this.$Progress.finish()
    this.$set(this, 'isReady', true)
  },
  methods: {
    moment,
    capitalize,
    keys
  }
}
</script>

<style lang="scss">
  .batch-search {

     & .batch-search-form {

       .card {
         border: 2px solid $tertiary;
         box-shadow: 0 0 10px 0 rgba($dark, .1);
       }
    }

    &__items {
      position: static;
      margin-top: $spacer;
      border-radius: $card-border-radius 0 0 0;
      background: white;
      overflow: hidden;

      .table-responsive {
        margin: 0;
      }

      table {
        margin: 0;

        thead th {
          border-top: 0;
          white-space: nowrap;
        }
      }

      &__explanation {
        padding: $spacer * 3 0;
      }
    }
  }
</style>
