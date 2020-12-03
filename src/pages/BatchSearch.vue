<template>
  <div class="batch-search h-100">
    <page-header icon="layer-group" :title="$t('batchSearch.title')" :description="$t('batchSearch.lead')">
      <b-btn @click="$refs['batch-search-form'].show()" variant="primary">
        <fa icon="plus" class="mr-1"></fa>
        {{ $t('batchSearch.heading') }}
      </b-btn>
      <b-modal ref="batch-search-form" hide-footer :title="$t('batchSearch.heading')" size="md" body-class="p-0">
        <batch-search-form hide-title hide-border @submit="$refs['batch-search-form'].hide()"></batch-search-form>
      </b-modal>
    </page-header>
    <div class="container pt-4">
      <div class="batch-search__items">
        <v-wait for="load batchSearches">
          <div slot="waiting">
            <content-placeholder :rows="rows" class="p-0 my-2"></content-placeholder>
            <content-placeholder :rows="rows" class="p-0 my-2"></content-placeholder>
            <content-placeholder :rows="rows" class="p-0 my-2"></content-placeholder>
          </div>
          <div class="card small">
            <b-table
              class="m-0"
              :empty-text="$t('global.emptyTextTable')"
              :fields="fields"
              hover
              :items="batchSearches"
              no-sort-reset
              responsive
              :sort-by="sortBy"
              @sort-changed="sortChanged"
              :sort-desc="orderBy"
              striped
              tbody-tr-class="batch-search__items__item"
              thead-tr-class="text-nowrap">
              <template v-slot:cell(name)="{ item }">
                <router-link
                  :to="{
                    name: 'batch-search.results',
                    params: { index: item.project.name, uuid: item.uuid },
                    query: { page: 1, sort: sortResults, order: orderResults }
                  }"
                  class="batch-search__items__item__link">
                  {{ item.name }}
                </router-link>
              </template>
              <template v-slot:cell(queries)="{ item }">
                {{ $tc('batchSearch.query', item.nbQueries) }}
              </template>
              <template v-slot:cell(state)="{ item }">
                <span :class="`text-${ toVariant(lowerCase(item.state)) }`">
                  <fa :icon="getStateIcon(lowerCase(item.state))"></fa>
                  {{ capitalize(item.state) }}
                </span>
                <b-badge
                  class="cursor-pointer ml-1"
                  @click.prevent="openErrorMessage(item)"
                  :id="item.uuid"
                  v-if="isFailed(item)"
                  variant="danger">
                  {{ $t('batchSearch.seeError') }}
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
                {{ item.published ? $t('global.yes') : $t('global.no') }}
              </template>
            </b-table>
          </div>
          <b-pagination-nav
            class="mt-2"
            :link-gen="linkGen"
            :number-of-pages="numberOfPages"
            use-router
            v-if="numberOfPages > 1"></b-pagination-nav>
        </v-wait>
      </div>
    </div>
    <b-modal id="error-modal" :title="$t('batchSearch.errorTitle')" ok-only body-class="py-0">
      <div v-if="errorQuery" class="font-size-large pb-2 font-weight-bolder">
        <fa icon="exclamation-triangle" class="mr-1"></fa>
        {{ $t('batchSearch.errorQuery', { query: errorQuery }) }}
      </div>
      <div v-if="errorMessage">
        <div v-html="$t('batchSearch.errorMessage')"></div>
        <div class="batch-search__modal mt-3 px-3 py-1 text-monospace text-break">
          {{ errorMessage }}
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
import { capitalize, compact, find, get, lowerCase } from 'lodash'
import moment from 'moment'
import { mapState } from 'vuex'

import BatchSearchForm from '@/components/BatchSearchForm'
import PageHeader from '@/components/PageHeader'
import toVariant from '@/filters/toVariant'
import utils from '@/mixins/utils'
import settings from '@/utils/settings'

export default {
  name: 'BatchSearches',
  mixins: [utils],
  components: {
    BatchSearchForm,
    PageHeader
  },
  data () {
    return {
      errorMessage: null,
      errorQuery: null,
      order: settings.batchSearch.order,
      page: 1,
      perPage: settings.batchSearch.size,
      rows: [
        {
          height: '1em',
          boxes: [['10%', '80%']]
        }
      ],
      sort: settings.batchSearch.sort
    }
  },
  computed: {
    ...mapState('batchSearch', ['batchSearches', 'total']),
    sortResults () {
      return settings.batchSearchResults.sort
    },
    orderResults () {
      return settings.batchSearchResults.order
    },
    projectNameField () {
      return this.isServer ? {
        key: 'project.name',
        label: this.$t('batchSearch.project'),
        sortable: true,
        name: 'prj_id'
      } : null
    },
    authorField () {
      return this.isServer ? {
        key: 'user.id',
        label: this.$t('batchSearch.author'),
        sortable: true,
        name: 'user_id'
      } : null
    },
    publishedField () {
      return this.isServer ? {
        key: 'published',
        label: this.$t('batchSearch.published'),
        sortable: true,
        name: 'published'
      } : null
    },
    fields () {
      return compact([
        this.projectNameField,
        {
          key: 'name',
          label: this.$t('batchSearch.name'),
          sortable: true,
          name: 'name'
        },
        this.authorField,
        {
          key: 'description',
          label: this.$t('batchSearch.description'),
          sortable: false,
          name: 'description'
        },
        {
          key: 'queries',
          label: this.$t('batchSearch.queries'),
          sortable: false
        },
        {
          key: 'state',
          label: this.$t('batchSearch.state'),
          sortable: true,
          name: 'state'
        },
        {
          key: 'date',
          label: this.$t('batchSearch.date'),
          sortable: true,
          name: 'batch_date'
        },
        {
          key: 'nbResults',
          label: this.$t('batchSearch.nbResults'),
          sortable: true,
          name: 'batch_results'
        },
        this.publishedField
      ])
    },
    sortBy () {
      return find(this.fields, item => item.name === this.sort).key
    },
    orderBy () {
      return this.order === 'desc'
    },
    numberOfPages () {
      return Math.ceil(this.total / this.perPage)
    }
  },
  watch: {
    page () {
      this.fetch()
    },
    sort () {
      this.fetch()
    },
    order () {
      this.fetch()
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.$set(vm, 'page', parseInt(get(to, 'query.page', vm.page)))
      vm.$set(vm, 'sort', get(to, 'query.sort', vm.sort))
      vm.$set(vm, 'order', get(to, 'query.order', vm.order))
    })
  },
  beforeRouteUpdate (to, from, next) {
    this.$set(this, 'page', parseInt(get(to, 'query.page', this.page)))
    this.$set(this, 'sort', get(to, 'query.sort', this.sort))
    this.$set(this, 'order', get(to, 'query.order', this.order))
    next()
  },
  async mounted () {
    this.fetch()
  },
  methods: {
    isFailed (item) {
      return item.state === 'FAILURE'
    },
    openErrorMessage (item) {
      if (this.isFailed(item)) {
        this.$set(this, 'errorMessage', item.errorMessage)
        this.$set(this, 'errorQuery', item.errorQuery)
        this.$bvModal.show('error-modal')
      }
    },
    generateLinkToBatchSearch (page = this.page, sort = this.sort, order = this.order) {
      return {
        name: 'batch-search',
        query: { page, sort, order }
      }
    },
    async sortChanged (ctx) {
      const sort = find(this.fields, item => item.key === ctx.sortBy).name
      const order = ctx.sortDesc ? 'desc' : 'asc'
      this.$router.push(this.generateLinkToBatchSearch(this.page, sort, order))
    },
    async fetch () {
      this.$wait.start('load batchSearches')
      this.$Progress.start()
      const from = (this.page - 1) * this.perPage
      const size = this.perPage
      await this.$store.dispatch('batchSearch/getBatchSearches',
        { from, size, sort: this.sort, order: this.order })
      this.$Progress.finish()
      this.$wait.end('load batchSearches')
    },
    linkGen (page) {
      return this.generateLinkToBatchSearch(page)
    },
    getStateIcon (state) {
      const icons = {
        failure: 'times-circle',
        queued: 'clock',
        running: 'circle-notch',
        success: 'glass-cheers'
      }
      return get(icons, state, 'ban')
    },
    capitalize,
    lowerCase,
    moment,
    toVariant
  }
}
</script>

<style lang="scss">
  .batch-search {

    &__items {
      border-radius: $card-border-radius 0 0 0;
      margin-top: $spacer;
      overflow: hidden;
      position: static;

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

      .font-size-large {
        font-size: $font-size-lg;
      }
    }
  }

  .cursor-pointer {
    cursor: pointer;
  }
</style>
