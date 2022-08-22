<template>
  <div class="batch-search container h-100 pt-4">
    <div class="d-flex flex-wrap align-items-center ">
      <form class="batch-search__search-bar col-md-6 px-0 py-2"  @submit.prevent="searchBatchsearches">
          <div class="input-group">
            <input
              v-model="search"
              :placeholder="$t('batchSearch.placeholder')"
              class="batch-search__search-bar__input form-control ">
            <div class="batch-search__search-bar__button input-group-append">
              <b-dropdown :text="$t('batchSearch.field.' + field)" variant="outline-light" class="batch-search__search-bar__field" right :class="{ 'search-bar__field--selected': field !== 'all' }">
                <b-dropdown-item v-for="key in fieldOptions" :key="key" @click="field = key" class="batch-search__search-bar__field__items">
                  {{ $t('batchSearch.field.' + key) }}
                </b-dropdown-item>
              </b-dropdown>
              <button type="submit" class="btn btn-dark">
                {{ $t('search.buttonLabel') }}
              </button>
            </div>
          </div>
      </form>
      <b-btn class="batch-search__clear-filter-btn text-muted " variant="link"  @click="deleteFilters" :disabled="!hasActiveFilter">
        <fa icon="filter-circle-xmark" />
        {{ $t('batchSearch.clearFilters') }}
      </b-btn>
      <b-btn class="ml-auto " @click="$refs['batch-search-form'].show()" variant="primary" >
        <fa icon="plus" class="mr-1"></fa>
        <span class="text-nowrap">{{ $t('batchSearch.heading') }}</span>
      </b-btn>
      <b-modal ref="batch-search-form" hide-footer :title="$t('batchSearch.heading')" size="md" body-class="p-0">
        <batch-search-form hide-title hide-border @submit="$refs['batch-search-form'].hide()"></batch-search-form>
      </b-modal>
    </div>
    <v-wait for="load batchSearches" class="batch-search__items card">
      <content-placeholder slot="waiting" class="p-3" v-for="index in 3" :key="index" />
      <div class="">
      <b-table
        hover
        no-sort-reset
        responsive
        show-empty
        striped
        tbody-tr-class="batch-search__items__item"
        thead-tr-class="text-nowrap"
        :fields="fieldsIfAnyItemOrFilter"
        :items="batchSearches"
        :sort-by="sortBy"
        :sort-desc="orderBy"
        @sort-changed="sortChanged">
        <template #empty v-if="!hasActiveFilter">
          <p class="batch-search__items__item__no-item text-center m-0" v-html="$t('batchSearch.empty', { howToLink })"></p>
        </template>
        <template #empty v-else>
          <p class="batch-search__items__item__no-item-filtered text-center m-0" v-html="$t('batchSearch.emptyWithFilter')"></p>
        </template>
        <template v-slot:cell(name)="{ item }">
          <router-link
            :to="generateTo(item)"
            class="batch-search__items__item__link">
            {{ item.name }}
          </router-link>
          <p class="m-0 text-muted small">
            {{ item.description }}
          </p>
        </template>
        <template v-slot:cell(queries)="{ item }">
          <span class="batch-search__items__item__queries">
            {{ $n(item.nbQueries) }}
          </span>
        </template>
        <template v-slot:cell(state)="{ item }">
          <batch-search-status :batch-search="item" />
        </template>
        <template v-slot:head(state)="{ field }">
              <span>
                {{ field.label }}
              </span>
          <b-btn radius variant="outline" id="batch-search__items__header__filter-state-toggle" class="batch-search__items__header__filter-date-toggle">
            <fa icon="filter"/>
          </b-btn>
          <b-badge variant="secondary" class="position-absolute p-2 rounded-circle" v-if="selectedStates.length > 0">
            {{ }}
          </b-badge>
          <b-popover custom-class="popover-body-p-0"
                     lazy
                     target="batch-search__items__header__filter-state-toggle"
                     triggers="focus">
            <selectable-dropdown deactivate-keys v-model="selectedStates" multiple :items="states"/>
          </b-popover>
        </template>
        <template v-slot:head(projects)="{ field }">
              <span>
                {{ field.label }}
              </span>
          <b-btn radius variant="outline" id="batch-search__items__header__filter-project-toggle" class="batch-search__items__header__filter-date-toggle">
            <fa icon="filter"/>
          </b-btn>
          <b-badge variant="secondary" class="position-absolute p-2 rounded-circle" v-if="selectedProjects.length > 0">
            {{ }}
          </b-badge>
          <b-popover custom-class="popover-body-p-0"
                     lazy
                     target="batch-search__items__header__filter-project-toggle"
                     triggers="focus">
            <selectable-dropdown deactivate-keys v-model="selectedProjects" multiple :items="projects"/>
          </b-popover>
        </template>
        <template v-slot:head(date)="{ field }">
          <span>
            {{ field.label }}
          </span>
          <b-btn  variant="outline" id="batch-search__items__header__filter-date-toggle" class="batch-search__items__header__filter-date-toggle">
            <fa icon="filter" />
          </b-btn>
          <b-badge variant="secondary" class="position-absolute p-2 rounded-circle" v-if="selectedDateRange">
            {{  }}
          </b-badge>
          <b-popover custom-class="popover-body-p-0"
                    lazy
                    target="batch-search__items__header__filter-date-toggle"
                    triggers="click">
            <date-picker
              is-range
              color="gray"
              v-model="selectedDateRange"
              :model-config="{ type: 'number' }"
              :locale="locale"
              :key="locale">
            </date-picker>
          </b-popover>
        </template>
        <template v-slot:head(published)="{ field }">
          <span>
            {{ field.label }}
          </span>
          <b-btn radius variant="outline" id="batch-search__items__header__filter-published-toggle" class="batch-search__items__header__filter-date-toggle">
            <fa icon="filter"/>
          </b-btn>
          <b-badge variant="secondary" class="position-absolute p-2 rounded-circle" v-if="hasSelectedStatus">
            {{ }}
          </b-badge>
          <b-popover custom-class="popover-body-p-0"
                     lazy
                     target="batch-search__items__header__filter-published-toggle"
                     triggers="focus">
            <selectable-dropdown deactivate-keys v-model="selectedStatus" :items="status" :eq="isStatusSelected">
              <template #item-label="{ item }">
                <span v-html="item.label"></span>
              </template>
            </selectable-dropdown>
          </b-popover>
        </template>
        <template v-slot:cell(date)="{ item }">
          <span :title="moment(item.date).locale($i18n.locale).format('LLL')">
            {{ moment(item.date).locale($i18n.locale).format('LL') }}
          </span>
        </template>
        <!-- eslint-disable-next-line vue/valid-v-slot -->
        <template v-slot:cell(user.id)="{ item }">
          <user-display :username="item.user.id" v-if="item.user" />
        </template>
        <template v-slot:cell(nbResults)="{ item }">
          <span class="batch-search__items__item__results">
            {{ $n(item.nbResults) }}
          </span>
        </template>
        <template v-slot:cell(published)="{ item }">
          {{ item.published ? $t('global.yes') : $t('global.no') }}
        </template>
        <template v-slot:cell(projects)="{ item }">
          <span class="batch-search__items__item__projects text-truncate" v-b-tooltip.hover :title="getProjectsNames(item)">
            {{ getProjectsNames(item) }}
          </span>
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
</template>

<script>
import { compact, find, isEqual, random, some } from 'lodash'
import moment from 'moment'
import { mapState } from 'vuex'

import BatchSearchForm from '@/components/BatchSearchForm'
import BatchSearchStatus from '@/components/BatchSearchStatus'
import UserDisplay from '@/components/UserDisplay'
import polling from '@/mixins/polling'
import utils from '@/mixins/utils'
import settings from '@/utils/settings'
import DatePicker from 'v-calendar/lib/components/date-picker.umd'

const EBatchSearchState = Object.freeze({
  QUEUED: 'QUEUED',
  RUNNING: 'RUNNING',
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE'
})
const EBatchSearchStatusValue = Object.freeze({
  PUBLISHED: '1',
  NOT_PUBLISHED: '0'
})
const EBatchSearchStatusLabel = Object.freeze({
  [EBatchSearchStatusValue.PUBLISHED]: 'Published',
  [EBatchSearchStatusValue.NOT_PUBLISHED]: 'Not published'
})

const EBatchSearchStatus = Object.freeze({
  [EBatchSearchStatusValue.PUBLISHED]: {
    label: EBatchSearchStatusLabel[EBatchSearchStatusValue.PUBLISHED],
    value: EBatchSearchStatusValue.PUBLISHED
  },
  [EBatchSearchStatusValue.NOT_PUBLISHED]: {
    label: EBatchSearchStatusLabel[EBatchSearchStatusValue.NOT_PUBLISHED],
    value: EBatchSearchStatusValue.NOT_PUBLISHED
  }
})
export default {
  name: 'BatchSearches',
  mixins: [polling, utils],
  components: {
    DatePicker,
    BatchSearchForm,
    BatchSearchStatus,
    UserDisplay
  },
  data () {
    return {
      field: 'all',
      order: settings.batchSearch.order,
      page: 1,
      perPage: settings.batchSearch.size,
      query: '',
      search: '',
      states: EBatchSearchState,
      status: [
        EBatchSearchStatus[EBatchSearchStatusValue.PUBLISHED],
        EBatchSearchStatus[EBatchSearchStatusValue.NOT_PUBLISHED]
      ],
      sort: settings.batchSearch.sort,
      selectedDateRange: null,
      selectedProjects: [],
      selectedStates: [],
      selectedStatus: null,
      start: null,
      end: null
    }
  },
  mounted () {
    this.setDataFromQueryParams()
    this.fetchAndRegisterPollWithLoader()
  },
  computed: {
    ...mapState('batchSearch', ['batchSearches', 'total']),
    publicationStatus () {
      return this.selectedStatus?.value ?? null
    },
    howToLink () {
      const { href } = this.$router.resolve('/docs/all-batch-search-documents')
      return href
    },
    sortResults () {
      return settings.batchSearchResults.sort
    },
    orderResults () {
      return settings.batchSearchResults.order
    },
    projectNameField () {
      return this.isServer
        ? {
          key: 'projects',
          label: this.$t('batchSearch.projects'),
          sortable: true,
          name: 'projects'
        }
        : null
    },
    authorField () {
      return this.isServer
        ? {
          key: 'user.id',
          label: this.$t('batchSearch.author'),
          sortable: true,
          name: 'user_id'
        }
        : null
    },
    publishedField () {
      return this.isServer
        ? {
          key: 'published',
          label: this.$t('batchSearch.published'),
          sortable: true,
          name: 'published'
        }
        : null
    },
    fieldOptions () {
      const options = ['all', 'name', 'description']
      if (this.isServer) {
        options.push('user_id')
      }
      return options
    },
    fieldsIfAnyItemOrFilter () {
      if (this.batchSearches.length || this.hasActiveFilter) {
        return this.fields
      }
      return []
    },
    fields () {
      return compact([
        {
          key: 'state',
          label: this.$t('batchSearch.state'),
          sortable: true,
          name: 'state'
        },
        this.projectNameField,
        {
          key: 'name',
          label: this.$t('batchSearch.name'),
          sortable: true,
          name: 'name'
        },
        this.authorField,
        {
          key: 'queries',
          label: this.$t('batchSearch.queries'),
          sortable: false
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
    },
    hasPendingBatchSearches () {
      const pendingStates = ['RUNNING', 'QUEUED']
      return some(this.batchSearches, ({ state }) => pendingStates.includes(state))
    },
    hasSelectedStatus () {
      return this.publicationStatus
    },
    hasActiveFilter () {
      return this.query !== '' || this.selectedDateRange !== null ||
        this.selectedProjects.length > 0 || this.selectedStates.length > 0 ||
        this.hasSelectedStatus
    },
    locale () {
      return this.$i18n.locale
    },
    projects () {
      return this.$core.projects
    }

  },
  methods: {
    setDataFromQueryParams (to = this.$route) {
      // logical-nullish-assignment '??=' : update a variable with a new value,
      // but only if that variable currently holds a "nullish" value (either null or undefined).
      this.page ??= parseInt(to.query?.page) ?? 1
      this.sort ??= to.query?.sort
      this.order ??= to.query?.order
      this.query ??= to.query?.query
      this.field ??= to.query?.field
      this.search ??= to.query?.query // TODO : there is two get on query.query

      if (to.query?.dateStart && to.query?.dateEnd) {
        const start = parseInt(to.query?.dateStart)
        const end = parseInt(to.query?.dateEnd)
        if (!Number.isNaN(start) && !Number.isNaN(end)) {
          if (start !== this.selectedDateRange?.start && end !== this.selectedDateRange?.end) {
            this.$set(this, 'selectedDateRange', { start, end })
          }
        } else if (this.selectedDateRange !== null) {
          this.$set(this, 'selectedDateRange', null)
        }
      } else if (this.selectedDateRange !== null) {
        this.$set(this, 'selectedDateRange', null)
      }

      this.selectedProjects ??= to.query?.project
      this.selectedStates ??= to.query?.states

      const newObj = EBatchSearchStatus[to.query?.publishState] ?? null
      if (newObj && newObj?.value !== this.selectedStatus?.value) {
        this.selectedStatus = newObj
      } else if (!newObj && this.publicationStatus) {
        this.selectedStatus = null
      }
    },
    generateTo (item) {
      const baseTo = { name: 'batch-search.results', params: { index: this.getProjectsNames(item).replace(/\s/g, ''), uuid: item.uuid }, query: { page: 1, sort: this.sortResults, order: this.orderResults } }
      const searchQueryExists = this.query
      return {
        ...baseTo,
        ...(searchQueryExists && { query: { query: this.query } })
      }
    },
    generateLinkToBatchSearch ({
      page = this.page,
      sort = this.sort,
      order = this.order,
      query = this.query,
      field = this.field,
      project = this.selectedProjects,
      state = this.selectedStates,
      batchDate = this.selectedDateRange,
      publishState = this.publicationStatus
    }) {
      const date = batchDate ? { dateStart: batchDate?.start, dateEnd: batchDate?.end } : null
      page = '' + page
      const route = {
        name: 'batch-search',
        query: { page, sort, order, query, field, ...project, ...state, ...date }
      }
      if (publishState) {
        route.query.publishState = publishState
      } else {
        delete route.query?.publishState
      }
      return route
    },
    isStatusSelected (item, other) {
      return item?.value === other?.value
    },
    updateRoute () {
      const route = this.generateLinkToBatchSearch({})
      const { currentRoute: { query: curQuery } } = this.$router
      if (!isEqual(curQuery, route.query)) {
        return this.$router.push(this.generateLinkToBatchSearch({}))
      }
      return Promise.resolve()
    },
    async sortChanged (ctx) {
      const sort = find(this.fields, item => item.key === ctx.sortBy).name
      const order = ctx.sortDesc ? 'desc' : 'asc'
      const params = { page: this.page, sort, order }

      await this.$router.push(this.generateLinkToBatchSearch(params))
    },
    async fetch () {
      const from = (this.page - 1) * this.perPage
      const size = this.perPage
      const dateRange = this.selectedDateRange ? [`${this.selectedDateRange.start}`, `${this.selectedDateRange.end}`] : null
      const params = { from, size, sort: this.sort, order: this.order, query: this.query, field: this.field, project: this.selectedProjects, state: this.selectedStates, batchDate: dateRange, publishState: this.publicationStatus }
      return this.$store.dispatch('batchSearch/getBatchSearches', params)
    },
    async fetchWithLoader () {
      this.$wait.start('load batchSearches')
      this.$Progress.start()
      await this.fetch()
      this.$Progress.finish()
      this.$wait.end('load batchSearches')
    },
    async  fetchAndRegisterPollWithLoader () {
      this.$wait.start('load batchSearches')
      this.$Progress.start()
      await this.fetchAndRegisterPoll()
      this.$Progress.finish()
      this.$wait.end('load batchSearches')
    },
    async fetchForPoll () {
      await this.fetch()
      // Continue to poll data if they are pending batch searches and we are on page 1
      return this.page === 1 && this.hasPendingBatchSearches
    },
    async fetchAndRegisterPoll () {
      await this.fetch()
      const fn = this.fetchForPoll
      const timeout = () => random(1000, 4000)
      this.registerPollOnce({ fn, timeout })
    },
    linkGen (page) {
      return this.generateLinkToBatchSearch({ page })
    },
    searchBatchsearches () {
      this.query = this.search
      const params = { page: 1, query: this.query }
      return this.$router.push(this.generateLinkToBatchSearch(params))
    },
    getProjectsNames (item) {
      if (item.projects === undefined) {
        return ''
      } else {
        return item.projects.map(project => project.name).join(', ')
      }
    },
    deleteFilters () {
      this.$set(this, 'query', '')
      this.$set(this, 'search', '')
      this.$set(this, 'selectedDateRange', null)
      this.$set(this, 'selectedProjects', [])
      this.$set(this, 'selectedStates', [])
      this.$set(this, 'selectedStatus', null)
    },
    moment
  },
  watch: {
    page () {
      this.updateRoute()
    },
    sort () {
      this.updateRoute()
    },
    order () {
      this.updateRoute()
    },
    query () {
      this.updateRoute()
    },
    selectedDateRange () {
      this.updateRoute()
    },
    publicationStatus (newStatus, oldStatus) {
      if (newStatus !== oldStatus) {
        this.updateRoute()
      }
    },
    $route: {
      async handler (to) {
        this.setDataFromQueryParams(to)
        await this.fetchWithLoader()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .batch-search {
    display: grid;
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

        &:deep(.btn) {
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

      &:deep(.table-responsive) {
        margin: 0;
      }

      &:deep(table) {
        margin: 0;

        thead th {
          white-space: nowrap;
          vertical-align: middle;
          border-top:none;
        }
      }

      &__header__filter-date-toggle{
        padding: 0px 0.5em;
      }

      &__item {

        &__projects {
          display: block;
          max-width: 10vw;
        }
      }
    }
  }
</style>
