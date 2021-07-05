<template>
  <div>
     <page-header icon="clock" :title="$t('userHistory.heading')" :description="events.length ? $t('userHistory.description') : $t('userHistory.empty')" :tab.sync="tab">
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
      <confirm-button class="btn btn-primary" :confirmed="deleteUserHistory" v-if="events.length" :label="$t('global.confirmLabel')" :yes="$t('global.yes')" :no="$t('global.no')">
        <fa icon="trash-alt" class="mr-1"></fa>
        {{ $t('userHistory.clear') }}
      </confirm-button>
    </page-header>
    <router-view :events="filteredEvents" />
  </div>
</template>

<script>
import Api from '@/api'
import { findIndex } from 'lodash'
import PageHeader from '@/components/PageHeader'

export default {
  components: {
    PageHeader
  },
  data () {
    return {
      events: [],
      defaultTab: 0
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
    filteredEvents () {
      return this.events.filter(event => {
        return this.$route.name.startsWith(event.type.toLowerCase())
      })
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
  async created () {
    await this.getUserHistory()
  },
  methods: {
    async getUserHistory () {
      const events = await this.api.getUserHistory()
      this.$set(this, 'events', events)
    },
    async deleteUserHistory () {
      await this.api.deleteUserHistory(this.$route.path.split('/').pop())
      const events = this.events.filter(event => !this.filteredEvents.includes(event))
      this.$set(this, 'events', events)
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
