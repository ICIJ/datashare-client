<template>
  <div class="batch-search-table d-flex flex-column my-2">
    <b-table
      :busy="isBusy"
      :fields="fields"
      :items="displayBatchSearches"
      :sort-by="sortByOption"
      class="card"
      hover
      no-local-sorting
      no-sort-reset
      responsive
      show-empty
      striped
      tbody-tr-class="batch-search-table__item"
      thead-tr-class="batch-search-table__head text-nowrap"
      @sorted="sortChanged"
    >
      <template #table-busy>
        <content-placeholder v-for="index in 3" :key="index" class="p-3" :rows="placeholderRows" />
      </template>
      <template #empty>
        <p class="batch-search-table__item__no-item text-center m-0" v-html="noItemMessage" />
      </template>
      <!-- Filterable Headers -->
      <template #head(state)="{ field }">
        <column-filter-dropdown
          :id="field.key"
          v-model="selectedStates"
          :items="states"
          :name="field.label"
          immediate
          multiple
          sortable
        >
          <template #label="{ item }">
            {{ $t(`batchSearch.status.${item.toLowerCase()}`).toUpperCase() }}
          </template>
        </column-filter-dropdown>
      </template>
      <template #head(date)="{ field }">
        <batch-search-filter-date :id="field.key" v-model="selectedDateRange" :name="field.label" />
      </template>
      <template #head(published)="{ field }">
        <column-filter-dropdown
          :id="field.key"
          v-model="selectedStatus"
          :items="status"
          :eq="isSelected"
          :name="field.label"
          immediate
        >
          <template #label="{ item }">
            {{ $t(`batchSearch.${item.label}`) }}
          </template>
        </column-filter-dropdown>
      </template>
      <template #head(projects)="{ field }">
        <column-filter-dropdown
          :id="field.key"
          v-model="selectedProjects"
          :items="projects"
          :name="field.label"
          immediate
          multiple
        />
      </template>
      <!-- Cells -->
      <template #cell(name)="{ item }">
        <router-link :to="generateTo(item)" class="batch-search-table__item__link">
          {{ item.name }}
        </router-link>
        <p class="m-0 text-muted small">{{ item.description }}</p>
      </template>
      <template #cell(queries)="{ item }">
        <span class="batch-search-table__item__queries text-nowrap">
          {{ item.formatNbQueries }}
        </span>
      </template>
      <template #cell(state)="{ item }">
        <batch-search-status :batch-search="item" />
      </template>
      <template #cell(date)="{ item }">
        <span v-b-tooltip :title="item.dateTitle" class="text-nowrap">{{ item.dateContent }}</span>
      </template>
      <!-- eslint-disable-next-line vue/valid-v-slot -->
      <template #cell(user.id)="{ item }">
        <user-display v-if="item.hasUser" :username="item.userId" style="vertical-align: center" />
      </template>
      <template #cell(nbResults)="{ item }">
        <span class="batch-search-table__item__results text-nowrap">
          {{ item.formatNbResults }}
        </span>
      </template>
      <template #cell(published)="{ item }">
        {{ item.isPublished }}
      </template>
      <template #cell(projects)="{ item }">
        <span class="batch-search-table__item__projects">
          <span v-for="name in item.projects" :key="name" class="batch-search-table__item__projects__link">
            <project-link :project="name" class="btn btn-sm btn-light p-1 me-1 mb-1" />
          </span>
        </span>
      </template>
    </b-table>
    <tiny-pagination v-if="numberOfPages > 1" v-model="page" :total-rows="numberOfPages" class="mt-2 mx-auto" />
  </div>
</template>

<script>
import { compact, find, some, random } from 'lodash'
import { mapState } from 'vuex'
import { computed } from 'vue'

import ColumnFilterDropdown from '@/components/ColumnFilterDropdown'
import BatchSearchFilterDate from '@/components/BatchSearchFilterDate'
import ProjectLink from '@/components/ProjectLink'
import BatchSearchStatus from '@/components/BatchSearchStatus'
import UserDisplay from '@/components/UserDisplay'
import settings from '@/utils/settings'
import polling from '@/mixins/polling'
import utils from '@/mixins/utils'
import { humanLongDate, fromNow } from '@/utils/humanDate'
import { SORT_ORDER } from '@/utils/utils'
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

export default {
  name: 'BatchSearchTable',
  components: { ProjectLink, UserDisplay, BatchSearchStatus, BatchSearchFilterDate, ColumnFilterDropdown },
  mixins: [polling, utils],
  provide() {
    return {
      sortBy: computed(() => this.sortByOption[0])
    }
  },
  data() {
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
  computed: {
    ...mapState('batchSearch', ['total']),
    displayBatchSearches() {
      return this.$store.state.batchSearch.batchSearches.map((batchSearch) => {
        return {
          ...batchSearch,
          queries: this.$n(batchSearch.nbQueries),
          dateTitle: humanLongDate(batchSearch.date, this.$i18n.locale),
          dateContent: fromNow(batchSearch.date, this.$i18n.locale),
          userId: batchSearch.user?.id,
          hasUser: !!batchSearch.user,
          formatNbQueries: this.$n(batchSearch.nbQueries),
          formatNbResults: this.$n(batchSearch.nbResults),
          isPublished: batchSearch.published ? this.$t('global.yes') : this.$t('global.no'),
          projectsNames: batchSearch.projects
        }
      })
    },
    fields() {
      return compact([
        {
          key: 'state',
          label: this.$t('batchSearch.state'),
          sortable: true,
          name: 'state'
        },
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
          sortable: false,
          name: 'query'
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
        }),
        {
          key: 'date',
          label: this.$t('batchSearch.date'),
          sortable: true,
          name: 'batch_date',
          thStyle: { width: '10rem' }
        },
        this.withProjectsField({
          key: 'projects',
          label: this.$t('batchSearch.projects'),
          sortable: false,
          name: 'projects',
          thStyle: { width: '20rem' }
        })
      ])
    },
    hasPendingBatchSearches() {
      const RUNNING = settings.batchSearch.status.running
      const QUEUED = settings.batchSearch.status.queued
      const pendingStates = [RUNNING, QUEUED]
      return some(this.displayBatchSearches, ({ state }) => pendingStates.includes(state))
    },
    howToLink() {
      const { href } = this.$router.resolve('/docs/all-batch-search-documents')
      return href
    },
    isBusy() {
      return this.$wait.waiting('load batchSearches')
    },
    search() {
      return this.$route?.query?.query ?? ''
    },
    fieldValue() {
      const fieldValue = this.$route?.query?.field
      return this.fieldOptions?.includes(fieldValue) ? fieldValue : 'all'
    },
    fieldOptions() {
      const options = ['all', 'name', 'description']
      if (this.isServer) {
        options.push('user_id')
      }
      return options
    },
    noItemMessage() {
      return this.$t('batchSearch.emptyWithFilter')
    },
    numberOfPages() {
      return Math.ceil(this.total / this.perPage)
    },
    projects() {
      return this.$core.projectIds
    },
    selectedDateRange: {
      get() {
        const start = parseInt(this.$route?.query?.dateStart)
        const end = parseInt(this.$route?.query?.dateEnd)
        const areNumber = !Number.isNaN(start) && !Number.isNaN(end)
        return areNumber ? { start, end } : null
      },
      set(batchDate) {
        return this.$router.push(this.generateRoute({ batchDate }))
      }
    },
    selectedProjects: {
      get() {
        const param = this.$route?.query?.project
        let projects = param
        if (typeof param === 'string') {
          projects = param?.split(',') ?? []
        }
        return projects?.filter((p) => this.projects.includes(p)) ?? []
      },
      set(values) {
        const project = values?.length > 0 ? values?.join(',') : null
        return this.$router.push(this.generateRoute({ project }))
      }
    },
    page: {
      set(page) {
        return this.updateRoute({ page })
      },
      get() {
        const value = parseInt(this.$route?.query?.page)
        return !isNaN(value) && value > 0 ? value : 1
      }
    },
    sort() {
      const sortNameFromQuery = this.$route?.query?.sort?.toLowerCase()
      const sortKeyExists = this.fieldKeyByName(sortNameFromQuery)
      return sortKeyExists ? sortNameFromQuery : settings.batchSearch.sort
    },
    order() {
      return SORT_ORDER[this.$route?.query?.order?.toUpperCase()] ?? settings.batchSearch.order
    },
    selectedSort: {
      get() {
        return { sort: this.sort, order: this.order }
      },
      set({ sort, order }) {
        const params = { page: this.page, sort, order }
        return this.updateRoute(params)
      }
    },
    selectedStates: {
      get() {
        let states = this.$route?.query?.state
        if (typeof states === 'string') {
          states = states?.split(',') ?? []
        }
        return states?.map((p) => p.toUpperCase()).filter((p) => this.states.includes(p)) ?? []
      },
      set(values) {
        const state = values?.length > 0 ? values?.join(',') : null
        return this.$router.push(this.generateRoute({ state }))
      }
    },
    publicationStatus() {
      return BATCHSEARCH_STATUS[this.$route?.query?.publishState]?.value ?? null
    },
    selectedStatus: {
      get() {
        return BATCHSEARCH_STATUS[this.$route?.query?.publishState] ?? null
      },
      set(status) {
        const publishState = status?.value ?? null
        return this.$router.push(this.generateRoute({ publishState }))
      }
    },
    sortByOption() {
      return [{ key: this.fieldKeyByName(this.selectedSort.sort), order: this.selectedSort.order }]
    },
    states() {
      return Object.values(settings.batchSearch.status)
    }
  },
  watch: {
    $route() {
      return this.fetchWithLoader()
    },
    total() {
      this.fetchAndRegisterPollWithLoader()
    }
  },
  mounted() {
    this.fetchAndRegisterPollWithLoader()
  },
  methods: {
    generateRoute({
      page = this.page,
      sort = this.selectedSort.sort,
      order = this.selectedSort.order,
      query = this.search,
      field = this.fieldValue,
      project = this.selectedProjects,
      state = this.selectedStates,
      batchDate = this.selectedDateRange,
      publishState = this.publicationStatus
    }) {
      batchDate = batchDate ? { dateStart: batchDate?.start, dateEnd: batchDate?.end } : null
      const queryParams = { query, page, sort, order, field, project, state, ...batchDate, publishState }
      this.removeEmptySearchParams(queryParams)

      return {
        name: 'task.batch-search.list',
        query: queryParams
      }
    },
    removeEmptySearchParams(query) {
      if (!query.query?.length) delete query?.query
      if (!query?.publishState) delete query?.publishState
      if (!query?.project || !query?.project?.length) delete query?.project
      if (!query?.state || !query?.state?.length) delete query?.state
    },
    async fetch() {
      const from = (this.page - 1) * this.perPage
      const size = this.perPage
      const batchDate = this.selectedDateRange
        ? [`${this.selectedDateRange.start}`, `${this.selectedDateRange.end}`]
        : null
      const params = {
        from,
        size,
        sort: this.selectedSort.sort,
        order: this.selectedSort.order,
        query: this.search,
        field: this.fieldValue,
        project: this.selectedProjects,
        state: this.selectedStates,
        batchDate,
        publishState: this.publicationStatus
      }
      return this.$store.dispatch('batchSearch/getBatchSearches', params)
    },
    async fetchWithLoader() {
      this.$wait.start('load batchSearches')
      await this.fetch()
      this.$wait.end('load batchSearches')
    },
    async fetchAndRegisterPollWithLoader() {
      this.$wait.start('load batchSearches')
      await this.fetchAndRegisterPoll()
      this.$wait.end('load batchSearches')
    },
    async fetchForPoll() {
      await this.fetch()
      // Continue to poll data if they are pending batch searches and we are on page 1
      return this.page === 1 && this.hasPendingBatchSearches
    },
    async fetchAndRegisterPoll() {
      await this.fetch()
      const fn = this.fetchForPoll
      const timeout = () => random(1000, 4000)
      this.registerPollOnce({ fn, timeout })
    },
    generateTo(item) {
      const baseTo = {
        name: 'task.batch-search.view.results',
        params: {
          indices: item.projects.join(','),
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
    isSelected(item) {
      return item?.value === this.selectedStatus?.value
    },
    serverField(field) {
      return this.isServer ? field : null
    },
    withProjectsField(field) {
      return this.isServer || this.projects.length > 1 ? field : null
    },
    async sortChanged({ key, order }) {
      this.selectedSort = {
        sort: this.fieldNameByKey(key),
        order: order ? SORT_ORDER.DESC : SORT_ORDER.ASC
      }
    },
    fieldNameByKey(fieldKey) {
      return find(this.fields, (item) => item.key === fieldKey)?.name
    },
    fieldKeyByName(fieldName) {
      return find(this.fields, (item) => item.name === fieldName)?.key
    },
    updateRoute(params) {
      return this.$router.push(this.generateRoute(params))
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
