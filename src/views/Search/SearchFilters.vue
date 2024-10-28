<script setup>
import { computed } from 'vue'
import { uniq, groupBy } from 'lodash'
import { useStore } from 'vuex'

import { useViews } from '@/composables/views'
import FiltersPanel from '@/components/FiltersPanel/FiltersPanel'
import FiltersPanelSection from '@/components/FiltersPanel/FiltersPanelSection'
import FilterType from '@/components/Filter/FilterType/FilterType'
import FilterTypeDateRange from '@/components/Filter/FilterType/FilterTypeDateRange'
import FilterTypePath from '@/components/Filter/FilterType/FilterTypePath'
import FilterTypeProject from '@/components/Filter/FilterType/FilterTypeProject'
import FilterTypeRecommendedBy from '@/components/Filter/FilterType/FilterTypeRecommendedBy'
import FilterTypeStarred from '@/components/Filter/FilterType/FilterTypeStarred'

const { toggleFilters } = useViews()
const store = useStore()

const closeFilters = () => (toggleFilters.value = false)
const filters = store.getters['search/instantiatedFilters']
const filtersBySection = computed(() => groupBy(filters, 'section'))
const sections = computed(() => uniq(filters.map((filter) => filter.section)))
const types = {
  FilterType,
  FilterTypeDateRange,
  FilterTypeStarred,
  FilterTypeRecommendedBy,
  FilterTypePath,
  FilterTypeProject
}
</script>

<template>
  <filters-panel v-show="toggleFilters" class="search-filters flex-shrink-0 me-5" @close="closeFilters">
    <filters-panel-section v-for="section in sections" :key="section" :title="$t(`filter.sections.${section}`)">
      <component
        :is="types[filter.component]"
        v-for="filter in filtersBySection[section]"
        :key="filter.name"
        :filter="filter"
      />
    </filters-panel-section>
  </filters-panel>
</template>
