<script setup>
import Fuse from 'fuse.js'
import { computed, ref } from 'vue'
import { uniq, groupBy, property } from 'lodash'
import { useI18n } from 'vue-i18n'

import { useViews } from '@/composables/useViews'
import { useMode } from '@/composables/useMode'
import { useSearchFilter } from '@/composables/useSearchFilter'
import FiltersPanel from '@/components/FiltersPanel/FiltersPanel'
import FiltersPanelSection from '@/components/FiltersPanel/FiltersPanelSection'
import { useSearchStore } from '@/store/modules'

const { toggleFilters } = useViews()
const searchStore = useSearchStore.inject()
const { isMode } = useMode()
const { getFilterComponent } = useSearchFilter()
const { t } = useI18n()

const q = ref('')
const filters = computed(() => {
  return searchStore.instantiatedFilters.filter((filter) => {
    // We apply a first filter to remove filters that are not available in the current mode
    return !filter.modes || filter.modes.some(isMode)
  })
})

const filtersTitles = computed(() => filters.value.map((filter) => ({ filter, title: t(`filter.${filter.name}`) })))
const fuse = computed(() => new Fuse(filtersTitles.value, { threshold: 0.1, shouldSort: false, keys: ['title'] }))
const fuseFilters = computed(() => fuse.value.search(q.value).map(property('item.filter')))
const displayedFilters = computed(() => (q.value ? fuseFilters.value : filters.value))
const filtersBySection = computed(() => groupBy(displayedFilters.value, 'section'))
const sections = computed(() => uniq(displayedFilters.value.map((filter) => filter.section)))
const closeFilters = () => (toggleFilters.value = false)
</script>

<template>
  <filters-panel
    v-show="toggleFilters"
    v-model:q="q"
    class="search-filters flex-shrink-0 me-3"
    sticky
    @close="closeFilters"
  >
    <filters-panel-section v-for="section in sections" :key="section" :title="t(`filter.sections.${section}`)">
      <component
        :is="getFilterComponent(filter)"
        v-for="filter in filtersBySection[section]"
        :key="filter.name"
        :filter="filter"
      />
    </filters-panel-section>
  </filters-panel>
</template>
