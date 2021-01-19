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
      <form class="batch-search__search-bar container-fluid p-0" v-if="hasFeature('BATCHSEARCH_SEARCH_BAR')">
        <div class="d-flex align-items-left w-50">
          <div class="input-group">
            <input
              v-model="search"
              :placeholder="$t('batchSearch.placeholder')"
              class="batch-search__search-bar__input form-control">
            <div class="batch-search__search-bar__button input-group-append">
              <b-dropdown :text="$t('search.field.' + field)" variant="outline-light" class="batch-search__search-bar__field" right :class="{ 'search-bar__field--selected': field !== 'all' }">
                <b-dropdown-item v-for="key in fieldOptions" :key="key" @click="field = key" class="batch-search__search-bar__field__items">
                  {{ $t('search.field.' + key) }}
                </b-dropdown-item>
              </b-dropdown>
              <button type="submit" class="btn btn-dark" @click="searchBatchsearches">
                {{ $t('search.buttonLabel') }}
              </button>
            </div>
          </div>
        </div>
      </form>
      <div class="batch-search__items">
        <v-wait for="load batchSearches">
          <div slot="waiting" class="card py-2">
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
                <batch-search-status :batch-search="item"></batch-search-status>
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
  </div>
</template>

<script>
import { compact, find, get } from 'lodash'
import moment from 'moment'
import { mapState } from 'vuex'

import BatchSearchForm from '@/components/BatchSearchForm'
import BatchSearchStatus from '@/components/BatchSearchStatus'
import PageHeader from '@/components/PageHeader'
import features from '@/mixins/features'
import utils from '@/mixins/utils'
import settings from '@/utils/settings'

export default {
  name: 'BatchSearches',
  mixins: [features, utils],
  components: {
    BatchSearchForm,
    BatchSearchStatus,
    PageHeader
  },
  data () {
    return {
      field: 'all',
      order: settings.batchSearch.order,
      page: 1,
      perPage: settings.batchSearch.size,
      query: '',
      search: '',
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
    fieldOptions () {
      const options = ['all', 'title', 'description']
      if (this.isServer) {
        options.push('author')
      }
      return options
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
    },
    query () {
      this.fetch()
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.$set(vm, 'page', parseInt(get(to, 'query.page', vm.page)))
      vm.$set(vm, 'sort', get(to, 'query.sort', vm.sort))
      vm.$set(vm, 'order', get(to, 'query.order', vm.order))
      vm.$set(vm, 'query', get(to, 'query.query', vm.query))
      vm.$set(vm, 'field', get(to, 'query.field', vm.field))
    })
  },
  beforeRouteUpdate (to, from, next) {
    this.$set(this, 'page', parseInt(get(to, 'query.page', this.page)))
    this.$set(this, 'sort', get(to, 'query.sort', this.sort))
    this.$set(this, 'order', get(to, 'query.order', this.order))
    this.$set(this, 'query', get(to, 'query.query', this.query))
    this.$set(this, 'field', get(to, 'query.field', this.field))
    next()
  },
  async mounted () {
    this.fetch()
  },
  methods: {
    generateLinkToBatchSearch (page = this.page, sort = this.sort, order = this.order, query = this.query, field = this.field) {
      return {
        name: 'batch-search',
        query: { page, sort, order, query, field }
      }
    },
    sortChanged (ctx) {
      const sort = find(this.fields, item => item.key === ctx.sortBy).name
      const order = ctx.sortDesc ? 'desc' : 'asc'
      return this.$router.push(this.generateLinkToBatchSearch(this.page, sort, order))
    },
    async fetch () {
      this.$wait.start('load batchSearches')
      this.$Progress.start()
      const from = (this.page - 1) * this.perPage
      const size = this.perPage
      await this.$store.dispatch('batchSearch/getBatchSearches',
        { from, size, sort: this.sort, order: this.order, query: this.query, field: this.field })
      this.$Progress.finish()
      this.$wait.end('load batchSearches')
    },
    linkGen (page) {
      return this.generateLinkToBatchSearch(page)
    },
    searchBatchsearches () {
      this.$set(this, 'query', this.search)
      return this.$router.push(this.generateLinkToBatchSearch())
    },
    moment
  }
}
</script>

<style lang="scss" scoped>
  .batch-search {
    &__search-bar {
      &__input {
        border-radius: 1.5em 0 0 1.5rem;
      }

      &__button .btn {
        border-radius: 0 1.5em 1.5rem 0;
      }

      &__field {
        background: $input-bg;
        border-left: dashed 1px  $input-border-color;
        font-size: inherit;

        &--selected:after {
          bottom: 1px;
          border: 2px solid $tertiary;
          content: "";
          left: 0;
          position: absolute;
          right: 1px;
          top: 1px;
        }

        /deep/ .btn {
          border: 1px solid $input-border-color;
          border-left: 0;
          box-shadow: $input-box-shadow;
          color: $text-muted;

          .input-group-lg & {
            font-size: 1.25rem;
          }
        }
      }
    }

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
    }
  }
</style>
