<template>
  <div class="task">
    <page-header icon="rocket" :title="$t('tasks.title')" :description="$t('tasks.description')" :tab.sync="tab">
      <template #tabs>
        <b-tab :active="defaultTab === 0">
          <template #title>
            <fa icon="layer-group" fixed-width class="mr-1" />
            {{ $t('batchSearch.title') }}
          </template>
        </b-tab>
        <b-tab :active="defaultTab === 1">
          <template #title>
            <fa icon="download" fixed-width class="mr-1" />
            {{ $t('batchDownload.title') }}
          </template>
        </b-tab>
        <b-tab :active="defaultTab === 2" v-if="!isServer">
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
        const index = findIndex(this.tabRoutes, name => {
          return this.$route.name.startsWith(name)
        })
        // Use the defaultTab value when the current route doesn't match with any tab
        return index > -1 ? index : this.defaultTab
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
      return ['batch-search', 'batch-download', 'indexing']
    }
  },
  beforeRouteEnter (to, from, next) {
    return next(vm => {
      const defaultTab = vm.tabRoutes.indexOf(to.name)
      if (defaultTab > -1) {
        vm.defaultTab = defaultTab
      } else if (vm.$route.name !== 'batch-search') {
        vm.$router.push({ name: 'batch-search' })
      }
    })
  }
}
</script>
