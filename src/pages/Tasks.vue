<template>
  <div class="task">
    <page-header icon="rocket" :title="$t('tasks.title')" :description="$t('tasks.description')" :tab.sync="tab">
      <template #tabs>
        <b-tab :active="defaultTab == 0">
          <template #title>
            <fa icon="layer-group" fixed-width class="mr-1" />
            {{ $t('batchSearch.title') }}
          </template>
        </b-tab>
        <b-tab :active="defaultTab == 1">
          <template #title>
            <fa icon="download" fixed-width class="mr-1" />
            {{ $t('batchDownload.title') }}
          </template>
        </b-tab>
        <b-tab :active="defaultTab == 2" v-if="!isServer">
          <template #title>
            <fa icon="search-plus" fixed-width class="mr-1" />
            {{ $t('indexing.title') }}
          </template>
        </b-tab>
      </template>
    </page-header>
    <router-view />
  </div>
</template>

<script>
import { findIndex } from 'lodash'
import utils from '@/mixins/utils'
import PageHeader from '@/components/PageHeader'

export default {
  name: 'Tasks',
  mixins: [utils],
  components: {
    PageHeader
  },
  data () {
    return {
      defaultTab: 0
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
        this.$router.push({ name })
      }
    },
    tabRoutes () {
      return ['batch-search', 'batch-download', 'indexing']
    }
  },
  beforeRouteEnter (to, from, next) {
    return next(vm => {
      const defaultTab = vm.tabRoutes.indexOf(to.name)
      if (defaultTab > -1) {
        vm.defaultTab = defaultTab
      }
    })
  }
}
</script>
