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
        <b-tab v-if="!isServer" :active="defaultTab === 2">
          <template #title>
            <fa icon="search-plus" fixed-width class="mr-1" />
            {{ $t('indexing.title') }}
          </template>
        </b-tab>
      </template>
      <div v-if="$route.name === 'batch-search'">
        <b-btn class="ml-auto my-1 text-nowrap" variant="primary" @click="$refs['batch-search-form'].show()">
          <fa class="mr-1" icon="plus" />
          {{ $t('batchSearch.heading') }}
        </b-btn>
        <b-modal ref="batch-search-form" :title="$t('batchSearch.heading')" body-class="p-0" hide-footer size="md">
          <batch-search-form hide-border hide-title @submit="$refs['batch-search-form'].hide()"></batch-search-form>
        </b-modal>
      </div>
    </page-header>
    <router-view />
  </div>
</template>

<script>
import { findIndex } from 'lodash'

import utils from '@/mixins/utils'
import BatchSearchForm from '@/components/BatchSearchForm'
import PageHeader from '@/components/PageHeader'

export default {
  name: 'Tasks',
  components: {
    BatchSearchForm,
    PageHeader
  },
  mixins: [utils],
  beforeRouteEnter(to, from, next) {
    return next((vm) => {
      const defaultTab = vm.tabRoutes.indexOf(to.name)
      if (defaultTab > -1) {
        vm.defaultTab = defaultTab
      } else if (!vm.$route.name.includes('batch-search')) {
        vm.$router.push({ name: 'batch-search' })
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
          return this.$route.name.startsWith(name)
        })
        // Use the defaultTab value when the current route doesn't match with any tab
        return index > -1 ? index : this.defaultTab
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
      return ['batch-search', 'batch-download', 'indexing']
    }
  }
}
</script>
