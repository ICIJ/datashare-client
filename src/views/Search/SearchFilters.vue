<script setup>
import { computed } from 'vue'
import { uniq, groupBy } from 'lodash'
import { useStore } from 'vuex'

import { useViews } from '@/composables/views'
import { useSearchFilter } from '@/composables/search-filter'
import FiltersPanel from '@/components/FiltersPanel/FiltersPanel'
import FiltersPanelSection from '@/components/FiltersPanel/FiltersPanelSection'

const { toggleFilters } = useViews()
const store = useStore()
const { getFilterComponent } = useSearchFilter()

const closeFilters = () => (toggleFilters.value = false)
const filters = store.getters['search/instantiatedFilters']
const filtersBySection = computed(() => groupBy(filters, 'section'))
const sections = computed(() => uniq(filters.map((filter) => filter.section)))
</script>

<template>
  <filters-panel v-show="toggleFilters" class="search-filters flex-shrink-0 me-5" sticky @close="closeFilters">
    <filters-panel-section v-for="section in sections" :key="section" :title="$t(`filter.sections.${section}`)">
      <component
        :is="getFilterComponent(filter)"
        v-for="filter in filtersBySection[section]"
        :key="filter.name"
        :filter="filter"
      />
    </filters-panel-section>
  </filters-panel>
</template>
