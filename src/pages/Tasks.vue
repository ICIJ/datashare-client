<template>
  <div class="task">
    <page-header v-model:tab="tab" icon="rocket" :title="$t('tasks.title')" :description="$t('tasks.description')">
      <template #tabs>
        <b-tab :active="defaultTab === 0">
          <template #title>
            <fa icon="layer-group" fixed-width class="me-1" />
            {{ $t('batchSearch.title') }}
          </template>
        </b-tab>
        <b-tab :active="defaultTab === 1">
          <template #title>
            <fa icon="download" fixed-width class="me-1" />
            {{ $t('batchDownload.title') }}
          </template>
        </b-tab>
        <b-tab v-if="!isServer" :active="defaultTab === 2">
          <template #title>
            <fa icon="magnifying-glass-plus" fixed-width class="me-1" />
            {{ $t('indexing.title') }}
          </template>
        </b-tab>
      </template>
      <div v-if="$route.name === 'task.batch-search.list'">
        <b-button class="ms-auto my-1 text-nowrap" variant="primary" :to="{ name: 'task.batch-search.new' }">
          <fa class="me-1" icon="plus" />
          {{ $t('batchSearch.heading') }}
        </b-button>
      </div>
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
  components: {
    PageHeader
  },
  mixins: [utils],
  beforeRouteEnter(to, from, next) {
    return next((vm) => {
      if (vm.$options.name === 'Task') {
        const defaultTab = vm.tabRoutes.indexOf(to.name)
        if (defaultTab > -1) {
          vm.defaultTab = defaultTab
        } else if (!vm.$route.name.includes('batch-search')) {
          vm.$router.push({ name: 'task.batch-search.list' })
        }
      }
    })
  },
  data() {
    return {
      defaultTab: null
    }
  },
  computed: {
    tab: {
      get() {
        const index = findIndex(this.tabRoutes, (name) => {
          return this.$route?.name?.startsWith(name)
        })
        // Use the defaultTab value when the current route doesn't match with any tab
        return index > -1 ? index : this.defaultTab
      },
      set(value) {
        const name = this.tabRoutes[value]
        const resolvedPath = this.$router.resolve({ name })?.path
        // Must be the current route or one of its children
        const isMatchedRoute = this.$route.matched.some((m) => m.path.startsWith(resolvedPath))
        // Change tab only if the route changed
        if (!isMatchedRoute) {
          this.$router.push({ name })
        }
      }
    },
    tabRoutes() {
      return ['task.batch-search.list', 'task.batch-download.list', 'task.analysis.list']
    }
  }
}
</script>
