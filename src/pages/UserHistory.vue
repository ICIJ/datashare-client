<template>
  <div>
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
      <template v-if="events.length && !$wait.is(loader)">
        <confirm-button class="btn btn-primary" :confirmed="deleteUserHistory" :label="$t('global.confirmLabel')" :yes="$t('global.yes')" :no="$t('global.no')">
          <fa icon="trash-alt" class="mr-1"></fa>
          {{ $t('userHistory.clear') }}
        </confirm-button>
      </template>
    </page-header>
    <v-wait :for="loader">
      <template #waiting>
        <div class="p-4 text-center">
          <fa icon="circle-notch" spin size="2x"></fa>
        </div>
      </template>
      <router-view :events="this.events" />
    </v-wait>
  </div>
</template>

<script>
import Api from '@/api'
import { findIndex, uniqueId } from 'lodash'
import PageHeader from '@/components/PageHeader'

export default {
  components: {
    PageHeader
  },
  data () {
    return {
      events: [],
      defaultTab: 0,
      defaultType: 'document'
    }
  },
  computed: {
    api () {
      return new Api()
    },
    tab: {
      get () {
        return findIndex(this.tabRoutes, name => {
          return this.$route.name.startsWith(name)
        })
      },
      set (value) {
        const name = this.tabRoutes[value]
        this.$router.push({ name })
      }
    },
    tabRoutes () {
      return ['document-history', 'search-history']
    },
    loader () {
      return uniqueId('user-history-load-events-')
    }
  },
  beforeRouteEnter (to, from, next) {
    return next(vm => {
      const defaultTab = vm.tabRoutes.indexOf(to.name)
      if (defaultTab > -1) {
        vm.defaultTab = defaultTab
      }
    })
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
      const events = await this.api.getUserHistory(type)
      this.$set(this, 'events', events)
    },
    async deleteUserHistory () {
      const type = this.getTypeOfCurrentPage()
      await this.api.deleteUserHistory(type)
      this.$set(this, 'events', [])
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
  }
</style>
