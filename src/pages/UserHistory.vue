<template>
  <div class="user-history">
    <page-header
      v-model:tab="tab"
      icon="clock"
      :title="$t('userHistory.heading')"
      :description="$t('userHistory.description')"
    >
      <template #tabs>
        <b-tab :active="defaultTab === 0">
          <template #title>
            <fa icon="file" fixed-width class="me-1" />
            {{ $t('userHistory.document') }}
          </template>
        </b-tab>
        <b-tab :active="defaultTab === 1">
          <template #title>
            <fa icon="magnifying-glass" fixed-width class="me-1" />
            {{ $t('userHistory.search') }}
          </template>
        </b-tab>
      </template>
      <confirm-button
        class="btn btn-primary"
        :disabled="!totalEvents || $wait.is(loader)"
        :confirmed="deleteUserHistory"
        :label="$t('global.confirmLabel')"
        :yes="$t('global.yes')"
        :no="$t('global.no')"
      >
        <fa icon="trash-can" class="me-1"></fa>
        {{ $t('userHistory.clear') }}
      </confirm-button>
    </page-header>
    <v-wait class="user-history__loader container" :for="loader">
      <template #waiting>
        <div class="p-4 text-center">
          <fa icon="circle-notch" spin size="2x"></fa>
        </div>
      </template>
      <router-view :events="events" />
      <div v-if="showPagination" class="user-history__pagination mb-3">
        <custom-pagination v-model="currentPage" :per-page="perPage" :total-rows="totalEvents" />
      </div>
    </v-wait>
  </div>
</template>

<script>
import { findIndex, uniqueId, isEqual } from 'lodash'

import PageHeader from '@/components/PageHeader'
import settings from '@/utils/settings'

export default {
  name: 'UserHistory',
  components: {
    PageHeader
  },
  beforeRouteEnter(to, from, next) {
    return next((vm) => {
      if (vm.$options.name === 'UserHistory') {
        const defaultTab = vm.tabRoutes.indexOf(to.name)
        if (!isEqual(from.path, to.path)) {
          vm.page = 1
        }
        if (defaultTab > -1) {
          vm.defaultTab = defaultTab
        } else if (vm.$route.name !== 'user-history.document.list') {
          vm.$router.push({ name: 'user-history.document.list' })
        }
      }
    })
  },
  beforeRouteUpdate(to, from, next) {
    const defaultTab = this.tabRoutes.indexOf(to.name)
    if (!isEqual(from.path, to.path)) {
      this.page = 1
    }
    if (defaultTab > -1) {
      this.defaultTab = defaultTab
    } else if (this.$route.name !== 'user-history.document.list') {
      this.$router.push({ name: 'user-history.document.list' })
    }
    next()
  },
  data() {
    return {
      events: [],
      totalEvents: 0,
      page: 1,
      defaultTab: -1,
      defaultType: 'document'
    }
  },
  computed: {
    showPagination() {
      return this.totalEvents > this.perPage
    },
    tab: {
      get() {
        return findIndex(this.tabRoutes, (name) => {
          return this.$route.name.startsWith(name)
        })
      },
      set(value) {
        const name = this.tabRoutes[value]
        // Change tab only if the route changed
        if (name !== this.$route.name) {
          this.$router.push({ name })
        }
      }
    },
    tabRoutes() {
      return ['user-history.document.list', 'user-history.saved-search.list']
    },
    loader() {
      return uniqueId('user-history-load-events-')
    },
    perPage() {
      return settings.userHistory.size
    },
    pageOffset() {
      return (this.page - 1) * this.perPage
    },
    currentPage: {
      get() {
        return this.page
      },
      set(pageNumber) {
        this.page = pageNumber
        const query = {
          ...this.$route.query,
          page: this.page,
          from: this.pageOffset,
          size: this.perPage
        }
        this.$router.push({ query })
      }
    },
    sortDesc() {
      return this.$route?.query?.desc
    },
    sortBy() {
      return this.$route?.query?.sort
    },
    projectsFilter() {
      return this.$route?.query?.projects
    }
  },
  watch: {
    $route() {
      this.getUserHistoryWithSpinner()
    }
  },
  created() {
    this.getUserHistoryWithSpinner()
  },
  methods: {
    async getUserHistoryWithSpinner() {
      this.$wait.start(this.loader)
      await this.getUserHistory()
      this.$wait.end(this.loader)
    },
    async getUserHistory() {
      const type = this.getTypeOfCurrentPage()
      try {
        const events = await this.$core.api.getUserHistory(
          type,
          this.pageOffset,
          this.perPage,
          this.sortBy,
          this.sortDesc,
          this.projectsFilter
        )
        this.events = events.items
        this.totalEvents = events.pagination?.total ?? 0
      } catch (e) {
        this.$toast.error('Failed to fetch user history')
        this.events = []
        this.totalEvents = 0
      }
    },
    async deleteUserHistory() {
      const type = this.getTypeOfCurrentPage()
      await this.$core.api.deleteUserHistory(type)
      this.events = []
      this.totalEvents = 0
    },
    getTypeOfCurrentPage() {
      const typeRouteMapping = {
        'user-history.document': 'document',
        'user-history.document.list': 'document',
        'user-history.saved-search': 'search',
        'user-history.saved-search.list': 'search'
      }
      return typeRouteMapping[this.$route.name] ?? this.defaultType
    }
  }
}
</script>

<style lang="scss">
@media (max-width: 576px) {
  .user-history__loader.container {
    max-width: 540px; /* prevent from loosing responsive on user history document table*/
  }
}

.user-history {
  color: $body-color;
  overflow: auto;
  position: relative;
}
</style>
