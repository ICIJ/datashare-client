<template>
  <div class="user-history">
    <page-header icon="clock" :title="$t('userHistory.heading')" :description="$t('userHistory.description')" :tab.sync="tab">
      <template #tabs>
        <b-tab :active="defaultTab == 0">
          <template #title>
            <fa icon="file" fixed-width class="mr-1" />
            {{ $t('userHistory.document') }}
          </template>
        </b-tab>
        <b-tab :active="defaultTab == 1">
          <template #title>
            <fa icon="search" fixed-width class="mr-1" />
            {{ $t('userHistory.search') }}
          </template>
        </b-tab>
      </template>
      <confirm-button class="btn btn-primary"
                      :disabled="!totalEvents || $wait.is(loader)"
                      :confirmed="deleteUserHistory"
                      :label="$t('global.confirmLabel')"
                      :yes="$t('global.yes')"
                      :no="$t('global.no')">
        <fa icon="trash-alt" class="mr-1"></fa>
        {{ $t('userHistory.clear') }}
      </confirm-button>
    </page-header>
    <v-wait class="container" :for="loader">
      <template #waiting>
        <div class="p-4 text-center">
          <fa icon="circle-notch" spin size="2x"></fa>
        </div>
      </template>
      <router-view :events="this.events" />
      <div class="user-history__pagination pt-2" v-if="totalEvents > perPage" >
        <custom-pagination v-model="currentPage" :per-page="perPage" :total-rows="totalEvents"/>
      </div>
    </v-wait>
  </div>
</template>

<script>
import { findIndex, uniqueId, isEqual } from 'lodash'
import PageHeader from '@/components/PageHeader'
import settings from '@/utils/settings'

export default {
  components: {
    PageHeader
  },
  data () {
    return {
      events: [],
      totalEvents: 0,
      page: 1,
      defaultTab: null,
      defaultType: 'document'
    }
  },
  computed: {
    tab: {
      get () {
        return findIndex(this.tabRoutes, name => {
          return this.$route.name.startsWith(name)
        })
      },
      set (value) {
        const name = this.tabRoutes[value]
        // Change tab only if the route changed
        if (name !== this.$route.name) {
          this.$router.push({ name })
        }
      }
    },
    tabRoutes () {
      return ['document-history', 'search-history']
    },
    loader () {
      return uniqueId('user-history-load-events-')
    },
    perPage () {
      return settings.userHistory.size
    },
    pageOffset () {
      return (this.page - 1) * this.perPage
    },
    currentPage: {
      get () {
        return this.page
      },
      set (pageNumber) {
        this.page = pageNumber
        this.$router.push({ query: { page: this.page, from: this.pageOffset, size: this.perPage } })
      }
    }
  },
  beforeRouteEnter (to, from, next) {
    return next(vm => {
      const defaultTab = vm.tabRoutes.indexOf(to.name)
      if (!isEqual(from.path, to.path)) {
        vm.page = 1
      }
      if (defaultTab > -1) {
        vm.defaultTab = defaultTab
      } else if (vm.$route.name !== 'document-history') {
        vm.$router.push({ name: 'document-history' })
      }
    })
  },
  beforeRouteUpdate (to, from, next) {
    const defaultTab = this.tabRoutes.indexOf(to.name)
    if (!isEqual(from.path, to.path)) {
      this.page = 1
    }
    if (defaultTab > -1) {
      this.defaultTab = defaultTab
    } else if (this.$route.name !== 'document-history') {
      this.$router.push({ name: 'document-history' })
    }
    next()
  },
  created () {
    this.getUserHistoryWithSpinner()
  },
  watch: {
    $route () {
      this.getUserHistoryWithSpinner()
    }
  },
  methods: {
    async getUserHistoryWithSpinner () {
      this.$wait.start(this.loader)
      await this.getUserHistory()
      this.$wait.end(this.loader)
    },
    async getUserHistory () {
      const type = this.getTypeOfCurrentPage()
      const events = await this.$core.api.getUserHistory(type, this.pageOffset, this.perPage)
      this.$set(this, 'events', events.items)
      this.$set(this, 'totalEvents', events.total)
    },
    async deleteUserHistory () {
      const type = this.getTypeOfCurrentPage()
      await this.$core.api.deleteUserHistory(type)
      this.$set(this, 'events', [])
      this.$set(this, 'totalEvents', 0)
    },
    getTypeOfCurrentPage () {
      const type = this.$route.path.split('/').pop()
      if (this.tabRoutes.some(tab => tab.startsWith(type))) {
        return type
      } else {
        return this.defaultType
      }
    }
  }
}
</script>

<style lang="scss">
  .user-history {
    background: $body-bg;
    color: $body-color;
    overflow: auto;
    position: relative;

    &__header {
      z-index: 100;
      background: inherit;
      position: sticky;
      top:0;
    }

    &__pagination {
      max-width: 40%;
    }
  }
</style>
