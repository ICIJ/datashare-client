<template>
  <div class="d-flex flex-column my-2">
    <b-table
      :busy="isBusy"
      :fields="fields"
      :items="displayBatchSearches"
      :sort-by="sortBy"
      :sort-desc="isDesc"
      hover
      no-sort-reset
      responsive
      show-empty
      striped
      tbody-tr-class="batch-search-table__item"
      thead-tr-class="batch-search-table__head text-nowrap"
      @sort-changed="sortChanged">
      <template #table-busy>
        <content-placeholder slot="waiting" class="p-3" v-for="index in 3" :key="index" :rows="placeholderRows"/>
      </template>
      <template #empty >
        <p class="batch-search-table__item__no-item text-center m-0" v-html="noItemMessage"/>
      </template>
      <!-- Filterable Headers -->
      <template #head(state)="{ field }">
        <batch-search-filter-dropdown v-model="selectedStates" :items="states" :id="field.key" :name="field.label" multiple>
          <template #label="{item}">
            {{$t(`batchSearch.status.${item.toLowerCase()}`).toUpperCase()}}
          </template>
        </batch-search-filter-dropdown>
      </template>
      <template #head(projects)="{ field }">
        <batch-search-filter-dropdown v-model="selectedProjects" :items="projects" :id="field.key" :name="field.label" multiple/>
      </template>
      <template #head(date)="{ field }">
        <batch-search-filter-date v-model="selectedDateRange" :date="selectedDateRange" :id="field.key" :name="field.label"/>
      </template>
      <template #head(published)="{ field }">
        <batch-search-filter-dropdown v-model="selectedStatus" :items="status" :id="field.key" :name="field.label">
          <template #label="{item}">
            {{$t(`batchSearch.${item.label}`)}}
          </template>
        </batch-search-filter-dropdown>
      </template>
      <!-- Cells -->
      <template #cell(name)="{ item }">
        <router-link :to="generateTo(item)" class="batch-search-table__item__link">
          {{ item.name }}
        </router-link>
        <p class="m-0 text-muted small">{{ item.description }}</p>
      </template>
      <template #cell(queries)="{ item }">
          <span class="batch-search-table__item__queries">
            {{ $n(item.nbQueries) }}
          </span>
      </template>
      <template #cell(state)="{ item }">
        <batch-search-status :batch-search="item" />
      </template>
      <template #cell(date)="{ item }">
        <span :title="item.dateTitle">{{ item.dateContent }}</span>
      </template>
      <!-- eslint-disable-next-line vue/valid-v-slot -->
      <template #cell(user.id)="{ item }">
        <user-display v-if="item.hasUser" :username="item.userId" style="vertical-align:center"/>
      </template>
      <template #cell(nbResults)="{ item }">
        <span class="batch-search-table__item__results">{{ item.formatNbResults }}</span>
      </template>
      <template #cell(published)="{ item }">
        {{ item.isPublished }}
      </template>
      <template #cell(projects)="{ item }">
          <span class="batch-search-table__item__projects text-truncate" v-b-tooltip.hover :title="item.projectNames">
            {{ item.projectNames }}
          </span>
      </template>
    </b-table>

    <b-pagination-nav
      v-if="numberOfPages > 1"
      :link-gen="linkGen"
      :number-of-pages="numberOfPages"
      class="mt-2 mx-auto"
      use-router/>
  </div>
</template>

<script>
import BatchSearchFilterDropdown from '@/components/BatchSearchFilterDropdown'
import BatchSearchFilterDate from '@/components/BatchSearchFilterDate'
import BatchSearchStatus from '@/components/BatchSearchStatus'
import UserDisplay from '@/components/UserDisplay'
import moment from 'moment'
import { compact, find, random } from 'lodash'
import settings from '@/utils/settings'
import utils from '@/mixins/utils'
import { mapState } from 'vuex'

const BATCHSEARCH_STATUS_VALUE = Object.freeze({
  PUBLISHED: '1',
  NOT_PUBLISHED: '0'
})

const BATCHSEARCH_STATUS = Object.freeze({
  [BATCHSEARCH_STATUS_VALUE.PUBLISHED]: {
    label: 'published',
    value: BATCHSEARCH_STATUS_VALUE.PUBLISHED
  },
  [BATCHSEARCH_STATUS_VALUE.NOT_PUBLISHED]: {
    label: 'notPublished',
    value: BATCHSEARCH_STATUS_VALUE.NOT_PUBLISHED
  }
})
const SORT_ORDER = Object.freeze({
  ASC: 'asc',
  DESC: 'desc'
})

export default {
  name: 'BatchSearchTable',
  mixins: [utils],
  components: { UserDisplay, BatchSearchStatus, BatchSearchFilterDate, BatchSearchFilterDropdown },
  data () {
    return {
      status: [
        BATCHSEARCH_STATUS[BATCHSEARCH_STATUS_VALUE.PUBLISHED],
        BATCHSEARCH_STATUS[BATCHSEARCH_STATUS_VALUE.NOT_PUBLISHED]
      ],
      perPage: settings.batchSearch.size,
      placeholderRows: [
        {
          height: '1em',
          boxes: [[0, '100%']]
        }
      ]
    }
  },
  mounted () {
    this.fetchWithLoader()
  },
  watch: {
    $route: {
      async handler () {
        await this.fetchWithLoader()
      }
    }
  },
  methods: {
    createBatchSearchRoute ({
      page = this.page,
      sort = this.selectedSort.sort,
      order = this.selectedSort.order,
      query = this.search,
      field = this.field,
      project = this.selectedProjects,
      state = this.selectedStates,
      batchDate = this.selectedDateRange,
      publishState = this.publicationStatus
    }) {
      batchDate = batchDate ? { dateStart: batchDate?.start, dateEnd: batchDate?.end } : null

      const route = {
        name: 'batch-search',
        query: { query, page, sort, order, field, project, state, ...batchDate, publishState }
      }
      if (!this.hasQuery) {
        delete route.query?.query
      }
      if (!publishState) {
        delete route.query?.publishState
      }
      if (!project) {
        delete route.query?.project
      }
      if (!state) {
        delete route.query?.state
      }
      return route
    },
    async fetch () {
      const from = (this.page - 1) * this.perPage
      const size = this.perPage
      const batchDate = this.selectedDateRange ? [`${this.selectedDateRange.start}`, `${this.selectedDateRange.end}`] : null
      const params = {
        from,
        size,
        sort: this.selectedSort.sort,
        order: this.selectedSort.order,
        query: this.search,
        field: this.field,
        project: this.selectedProjects,
        state: this.selectedStates,
        batchDate,
        publishState: this.publicationStatus
      }
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
      return this.createBatchSearchRoute({ page })
    },
    generateTo (item) {
      const baseTo = {
        name: 'batch-search.results',
        params: {
          index: this.getProjectsNames(item).replace(/\s/g, ''),
          uuid: item.uuid
        },
        query: {
          page: 1,
          sort: settings.batchSearchResults.sort,
          order: settings.batchSearchResults.order
        }
      }
      const searchQueryExists = this.search
      return {
        ...baseTo,
        ...(searchQueryExists && { query: { query: this.search } })
      }
    },
    getProjectsNames (item) {
      return item.projects?.map(project => project.name).join(', ') ?? ''
    },
    serverField (field) {
      return this.isServer ? field : null
    },
    async sortChanged (ctx) {
      const order = ctx.sortDesc ? SORT_ORDER.DESC : SORT_ORDER.ASC
      console.log('ctx', ctx.sortDesc, order)
      this.selectedSort = {
        sort: this.fieldNameByKey(ctx.sortBy),
        order
      }
    },
    fieldNameByKey (key) {
      return find(this.fields, item => item.key === key)?.name
    },
    updateRoute (params) {
      return this.$router.push(
        this.createBatchSearchRoute(params))
    }
  },
  computed: {
    ...mapState('batchSearch', ['total']),
    displayBatchSearches () {
      return this.$store.state.batchSearch.batchSearches.map((batchSearch) => {
        return {
          ...batchSearch,
          queries: this.$n(batchSearch.queries),
          dateTitle: moment(batchSearch.date).locale(this.$i18n.locale).format('LLL'),
          dateContent: moment(batchSearch.date).locale(this.$i18n.locale).format('LL'),
          userId: batchSearch.user?.id,
          hasUser: !!batchSearch.user,
          formatNbResults: this.$n(batchSearch.nbResults),
          isPublished: batchSearch.published ? this.$t('global.yes') : this.$t('global.no'),
          projectNames: this.getProjectsNames(batchSearch)
        }
      })
    },
    fields () {
      return compact([
        {
          key: 'state',
          label: this.$t('batchSearch.state'),
          sortable: true,
          name: 'state'
        },
        this.serverField({
          key: 'projects',
          label: this.$t('batchSearch.projects'),
          sortable: true,
          name: 'projects'
        }),
        {
          key: 'name',
          label: this.$t('batchSearch.name'),
          sortable: true,
          name: 'name'
        },
        this.serverField({
          key: 'user.id',
          label: this.$t('batchSearch.author'),
          sortable: true,
          name: 'user_id'
        }),
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
        this.serverField({
          key: 'published',
          label: this.$t('batchSearch.published'),
          sortable: true,
          name: 'published'
        })
      ])
    },
    howToLink () {
      const { href } = this.$router.resolve('/docs/all-batch-search-documents')
      return href
    },
    isBusy () {
      return this.$wait.waiting('load batchSearches')
    },
    search () {
      return this.$route.query?.query ?? ''
    },
    noItemMessage () {
      return this.$t('batchSearch.emptyWithFilter')
    },
    numberOfPages () {
      return Math.ceil(this.total / this.perPage)
    },
    projects () {
      return this.$core.projects
    },
    selectedDateRange: {
      get () {
        const start = parseInt(this.$route.query?.dateStart)
        const end = parseInt(this.$route.query?.dateEnd)
        const areNumber = !Number.isNaN(start) && !Number.isNaN(end)
        return areNumber ? { start, end } : null
      },
      set (batchDate) {
        return this.$router.push(this.createBatchSearchRoute({ batchDate }))
      }
    },
    selectedProjects: {
      get () {
        const param = this.$route.query?.project
        let projects = param
        if (typeof param === 'string') {
          projects = param?.split(',') ?? []
        }
        return projects?.filter(p => this.projects.includes(p)) ?? []
      },
      set (values) {
        const project = values?.length > 0 ? values?.join(',') : null
        return this.$router.push(
          this.createBatchSearchRoute({ project }))
      }
    },
    isDesc () {
      return this.selectedSort.order === SORT_ORDER.DESC
    },
    page: {
      get () {
        return this.$route.query?.page ?? 1
      }
    },
    selectedSort: {
      get () {
        const sort = this.fieldNameByKey(this.$route.query?.sort?.toLowerCase()) ?? settings.batchSearch.sort
        const order = SORT_ORDER[this.$route.query?.order?.toUpperCase()] ?? settings.batchSearch.order
        return { sort, order }
      },
      set ({ sort, order }) {
        const params = { page: this.page, sort: sort, order: order }
        return this.updateRoute(params)
      }
    },
    selectedStates: {
      get () {
        let states = this.$route.query?.state
        if (typeof states === 'string') {
          states = states?.split(',') ?? []
        }
        return states?.map(p => p.toUpperCase()).filter(p => this.states.includes(p)) ?? []
      },
      set (values) {
        const state = values?.length > 0 ? values?.join(',') : null
        return this.$router.push(
          this.createBatchSearchRoute({ state }))
      }
    },
    publicationStatus () {
      return BATCHSEARCH_STATUS[this.$route.query?.publishState]?.value ?? null
    },
    selectedStatus: {
      get () {
        return BATCHSEARCH_STATUS[this.$route.query?.publishState] ?? null
      },
      set (status) {
        const publishState = status?.value ?? null
        return this.$router.push(
          this.createBatchSearchRoute({ publishState }))
      }
    },
    sortBy () {
      return find(this.fields, item => item.name === this.selectedSort.sort).key
    },
    states () {
      return Object.values(settings.batchSearch.status)
    }
  }
}
</script>

<style lang="scss" scoped>
.batch-search-table {
  &__item {
    &__projects {
      display: block;
      max-width: 10vw;
    }
  }

}
</style>
