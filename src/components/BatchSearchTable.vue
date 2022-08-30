<template>
  <v-wait for="load batchSearches" class="batch-search__items card">
    <content-placeholder slot="waiting" class="p-3" v-for="index in 3" :key="index" />
    <b-table
      :fields="fieldsIfAnyItemOrFilter"
      :items="displayBatchSearches"
      :sort-by="sortBy"
      :sort-desc="sortDesc"
      hover
      no-sort-reset
      responsive
      show-empty
      striped
      tbody-tr-class="batch-search__items__item"
      thead-tr-class="text-nowrap"
      @sort-changed="sortChanged">
      <template #empty >
        <p class="batch-search__items__item__no-item text-center m-0"
           :class="{'batch-search__items__item__no-item-filtered':hasActiveFilter}"
           v-html="noItemMessage"/>
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
<!--        <router-link :to="generateTo(item)" class="batch-search__items__item__link">-->
          {{ item.name }}
<!--        </router-link>-->
        <p class="m-0 text-muted small">{{ item.description }}</p>
      </template>
      <template #cell(queries)="{ item }">
          <span class="batch-search__items__item__queries">
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
        <user-display v-if="item.hasUser" :username="item.userId"/>
      </template>
      <template #cell(nbResults)="{ item }">
        <span class="batch-search__items__item__results">{{ item.formatNbResults }}</span>
      </template>
      <template #cell(published)="{ item }">
        {{ item.isPublished }}
      </template>
      <template #cell(projects)="{ item }">
          <span class="batch-search__items__item__projects text-truncate" v-b-tooltip.hover :title="item.projectNames">
            {{ item.projectNames }}
          </span>
      </template>
    </b-table>

    <b-pagination-nav
      v-if="numberOfPages > 1"
      :link-gen="linkGen"
      :number-of-pages="numberOfPages"
      class="mt-2"
      use-router/>
  </v-wait>

</template>

<script>
import BatchSearchFilterDropdown from '@/components/BatchSearchFilterDropdown'
import BatchSearchFilterDate from '@/components/BatchSearchFilterDate'
import BatchSearchStatus from '@/components/BatchSearchStatus'
import UserDisplay from '@/components/UserDisplay'
import moment from 'moment'
import { compact, find } from 'lodash'
import settings from '@/utils/settings'
import utils from '@/mixins/utils'

const EBatchSearchStatusValue = Object.freeze({
  PUBLISHED: '1',
  NOT_PUBLISHED: '0'
})

const EBatchSearchStatus = Object.freeze({
  [EBatchSearchStatusValue.PUBLISHED]: {
    label: 'published',
    value: EBatchSearchStatusValue.PUBLISHED
  },
  [EBatchSearchStatusValue.NOT_PUBLISHED]: {
    label: 'notPublished',
    value: EBatchSearchStatusValue.NOT_PUBLISHED
  }
})

export default {
  name: 'BatchSearchTable',
  mixins: [utils],
  components: { UserDisplay, BatchSearchStatus, BatchSearchFilterDate, BatchSearchFilterDropdown },
  data () {
    return {
      status: [
        EBatchSearchStatus[EBatchSearchStatusValue.PUBLISHED],
        EBatchSearchStatus[EBatchSearchStatusValue.NOT_PUBLISHED]
      ],
      labelPath: 'batchSearch'
    }
  },
  mounted () {
    this.fetch()
  },
  watch: {
    $route: {
      async handler () {
        await this.fetchWithLoader()
      }
    }
  },
  computed: {
    query () {
      return ''
    },
    howToLink () {
      const { href } = this.$router.resolve('/docs/all-batch-search-documents')
      return href
    },
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
    fieldsIfAnyItemOrFilter () {
      return this.displayBatchSearches.length || this.hasActiveFilter ? this.fields : []
    },
    hasActiveFilter () {
      return this.hasQuery || this.hasSelectedDateRange ||
        this.hasSelectedProjects || this.hasSelectedStates ||
        this.hasSelectedStatus
    },
    hasSelectedStatus () {
      return !!this.publicationStatus
    },
    hasSelectedStates () {
      return this.selectedStates.length
    },
    hasSelectedProjects () {
      return this.selectedProjects.length
    },
    hasSelectedDateRange () {
      return !!this.selectedDateRange
    },
    hasQuery () {
      return !!this.query?.length
    },
    noItemMessage () {
      return this.hasActiveFilter ? this.$t('batchSearch.empty', { howToLink: this.howToLink }) : this.$t('batchSearch.emptyWithFilter')
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
      set (value) {
        const batchDate = value ? { dateStart: value?.start, dateEnd: value?.end } : null
        return this.$router.push(this.generateLinkToBatchSearch({ batchDate }))
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
          this.generateLinkToBatchSearch({ project }))
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
          this.generateLinkToBatchSearch({ state }))
      }
    },
    publicationStatus () {
      return EBatchSearchStatus[this.$route.query?.publishState]?.value ?? null
    },
    selectedStatus: {
      get () {
        return EBatchSearchStatus[this.$route.query?.publishState] ?? null
      },
      set (status) {
        const publishState = status?.value ?? null
        return this.$router.push(
          this.generateLinkToBatchSearch({ publishState }))
      }
    },
    sortBy () {
      return find(this.fields, item => item.name === this.sort).key
    },
    sortDesc () {
      return this.order === 'desc'
    },
    states () {
      return Object.values(settings.batchSearch.status)
    }
  },
  methods: {
    async fetch () {
      const from = (this.page - 1) * this.perPage
      const size = this.perPage
      const batchDate = this.selectedDateRange ? [`${this.selectedDateRange.start}`, `${this.selectedDateRange.end}`] : null
      const params = {
        from,
        size,
        sort: this.sort,
        order: this.order,
        query: this.query,
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
      // const fn = this.fetchForPoll
      // const timeout = () => random(1000, 4000)
      // this.registerPollOnce({ fn, timeout })
    },
    getProjectsNames (item) {
      return item.projects?.map(project => project.name).join(', ') ?? ''
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
    serverField (field) {
      return this.isServer ? field : null
    },
    async sortChanged (ctx) {
      const sort = find(this.fields, item => item.key === ctx.sortBy).name
      const params = { page: this.page, sort, order: this.order }
      console.log(params)
      // await this.$router.push(this.generateLinkToBatchSearch(params))
    }
  }
}
</script>

<style scoped>

</style>
