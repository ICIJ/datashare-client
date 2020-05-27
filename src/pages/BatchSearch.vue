<template>
  <div class="batch-search h-100">
    <div class="batch-search__explanation bg-white py-5">
      <div class="container">
        <b-button @click="$refs['batch-search-form'].show()" variant="primary" class="float-right">
          <fa icon="plus" class="mr-1" />
          {{ $t('batchSearch.heading') }}
        </b-button>
        <b-modal ref="batch-search-form" hide-footer :title="$t('batchSearch.heading')" size="md" body-class="p-0">
          <batch-search-form hide-title hide-border @submit="$refs['batch-search-form'].hide()" />
        </b-modal>
        <h3>
          <page-icon icon="layer-group" />
          {{ $t('batchSearch.title') }}
        </h3>
        <p class="m-0">
          {{ $t('batchSearch.lead') }}
        </p>
      </div>
    </div>
    <div class="container pt-4">
      <div class="batch-search__items card">
        <v-wait for="load batchSearches">
          <div slot="waiting">
            <content-placeholder :rows="rows" class="p-0 my-3" />
            <content-placeholder :rows="rows" class="p-0 my-3" />
            <content-placeholder :rows="rows" class="p-0 my-3" />
          </div>
          <b-table striped hover responsive :fields="fields" :items="items" thead-tr-class="text-nowrap" tbody-tr-class="batch-search__items__item small">
            <template v-slot:cell(name)="{ item }">
              <router-link :to="{ name: 'batch-search.results', params: { index: item.project.name, uuid: item.uuid }, query: { page: 1, sort, order } }" class="batch-search__items__item__link">
                {{ item.name }}
              </router-link>
            </template>
            <template v-slot:cell(queries)="{ item }">
              {{ $tc('batchSearch.query', keys(item.queries).length) }}
            </template>
            <template v-slot:cell(state)="{ item }">
              <b-badge
                :class="{ 'cursor-pointer': item.state === 'FAILURE' }"
                @click.prevent="openErrorMessage(item)"
                :variant="item.state | toVariant">
                {{ capitalize(item.state) }}
              </b-badge>
            </template>
            <template v-slot:cell(date)="{ item }">
              <span :title="moment(item.date).locale($i18n.locale).format('LLL')">
                {{ moment(item.date).locale($i18n.locale).format('LL') }}
              </span>
            </template>
            <template v-slot:cell(nbResults)="{ item }">
              {{ $n(item.nbResults) }}
            </template>
            <template v-slot:cell(published)="{ item }">
              {{ item.published ? $t('indexing.yes') : $t('indexing.no') }}
            </template>
          </b-table>
        </v-wait>
      </div>
    </div>
    <b-modal id="error-modal" :title="$t('batchSearchResults.errorTitle')" ok-only>
      <div v-html="$t('batchSearchResults.errorMessage')"></div>
      <div class="batch-search__modal mt-3 px-3 py-1 text-monospace text-break">
        {{ this.errorMessage }}
      </div>
    </b-modal>
  </div>
</template>

<script>
import capitalize from 'lodash/capitalize'
import compact from 'lodash/compact'
import keys from 'lodash/keys'
import moment from 'moment'
import { mapState } from 'vuex'

import toVariant from '@/filters/toVariant'
import settings from '@/utils/settings'
import BatchSearchForm from '@/components/BatchSearchForm'
import PageIcon from '@/components/PageIcon'

export default {
  name: 'BatchSearches',
  components: {
    BatchSearchForm,
    PageIcon
  },
  filters: {
    toVariant
  },
  data () {
    return {
      rows: [
        {
          height: '1em',
          boxes: [['10%', '80%']]
        }
      ],
      errorMessage: ''
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
      return this.$config.is('multipleProjects') ? {
        key: 'project.name',
        label: this.$t('batchSearch.project'),
        sortable: true
      } : null
    },
    authorField () {
      return this.$config.is('multipleProjects') ? {
        key: 'user.id',
        label: this.$t('batchSearch.author'),
        sortable: true
      } : null
    },
    publishedField () {
      return this.$config.is('multipleProjects') ? {
        key: 'published',
        label: this.$t('batchSearch.published'),
        sortable: true
      } : null
    },
    fields () {
      return compact([
        this.projectNameField,
        {
          key: 'name',
          label: this.$t('batchSearch.name'),
          sortable: true
        },
        this.authorField,
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
        this.publishedField
      ])
    }
  },
  async mounted () {
    this.$wait.start('load batchSearches')
    this.$Progress.start()
    await this.$store.dispatch('batchSearch/getBatchSearches')
    this.$Progress.finish()
    this.$wait.end('load batchSearches')
  },
  methods: {
    capitalize,
    keys,
    moment,
    openErrorMessage (item) {
      if (item.state === 'FAILURE') {
        this.errorMessage = item.errorMessage
        this.$bvModal.show('error-modal')
      }
    }
  }
}
</script>

<style lang="scss">
  .batch-search {

    &__items {
      background: white;
      border-radius: $card-border-radius 0 0 0;
      margin-top: $spacer;
      overflow: hidden;
      position: static;

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

    &__modal {
      background-color: black;
      color: white;
    }
  }

  .cursor-pointer {
    cursor: pointer;
  }
</style>
