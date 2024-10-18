<script setup>
import { computed, watch, onBeforeMount } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'

import PageContainer from '@/components/PageContainer/PageContainer'
import ButtonToggleFilters from '@/components/Button/ButtonToggleFilters'
import ButtonToggleSettings from '@/components/Button/ButtonToggleSettings'
import Hook from '@/components/Hook'
import { useViews } from '@/composables/views'
import { useSearchFilter } from '@/composables/search-filter'

const { toggleSettings, toggleFilters, isFiltersClosed } = useViews()
const { refreshRouteAndSearch, refreshSearch, watchProjects } = useSearchFilter()
const store = useStore()
const route = useRoute()

onBeforeMount(refreshSearch)
// Refresh store and search based on route query
store.dispatch('search/updateFromRouteQuery', route.query)
// Refresh route and search when filter values change
watch(() => store.state.search.values, refreshRouteAndSearch, { deep: true })
// Refresh route and search when reversed filters change
watch(() => store.state.search.excludeFilters, refreshRouteAndSearch, { deep: true })
// Refresh route and search when sort by and order by changes
watch(() => store.getters['app/getSettings']('search', 'sortBy'), refreshRouteAndSearch)
watch(() => store.getters['app/getSettings']('search', 'orderBy'), refreshRouteAndSearch)
// Refresh route and search when size (per page) changes
watch(() => store.getters['app/getSettings']('search', 'perPage'), refreshRouteAndSearch)
// Refresh route and search when projects change
watchProjects(refreshRouteAndSearch)

const hits = computed(() => store.state.search.response.hits)
</script>

<template>
  <page-container class="search" fluid>
    <hook name="search:before" />
    <div class="search__main d-flex">
      <slot name="filters" />
      <div class="search__main__content py-3 px-5">
        <button-toggle-filters
          v-if="isFiltersClosed"
          v-model:active="toggleFilters"
          class="search__main__toggle-filters"
        />
        <button-toggle-settings v-model:active="toggleSettings" class="search__main__toggle-settings" />
        <div class="search__main__results">
          <pre>{{ hits.map((h) => h.title) }}</pre>
        </div>
      </div>
    </div>
    <hook name="search:after" />
  </page-container>
</template>
