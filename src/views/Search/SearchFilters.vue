<script setup>
import { computed, ref, shallowRef, watch } from 'vue'
import uniq from 'lodash/uniq'
import groupBy from 'lodash/groupBy'
import property from 'lodash/property'
import { useI18n } from 'vue-i18n'

import { useViews } from '@/composables/useViews'
import { useMode } from '@/composables/useMode'
import { useSearchFilter } from '@/composables/useSearchFilter'
import FiltersPanel from '@/components/FiltersPanel/FiltersPanel'
import FiltersPanelSection from '@/components/FiltersPanel/FiltersPanelSection'
import { useSearchStore } from '@/store/modules'

const searchStore = useSearchStore.inject()
const { toggleFilters } = useViews()
const { isMode } = useMode()
const { getFilterComponent } = useSearchFilter()
const { t } = useI18n()

const q = ref('')
const filters = computed(() => {
  return searchStore.instantiatedFilters.filter((filter) => {
    // Skip filters flagged as hidden — they still sync to URL and breadcrumb
    // but must not appear in the filters panel.
    if (filter.hidden) {
      return false
    }
    // We apply a first filter to remove filters that are not available in the current mode
    return !filter.modes || filter.modes.some(isMode)
  })
})

const filtersTitles = computed(() => filters.value.map(filter => ({ filter, title: t(`filter.${filter.name}`) })))

// Fuse.js is only needed once the user actually searches the filter list, so
// defer loading its chunk until the first keystroke instead of importing it
// eagerly for every search-page load.
const Fuse = shallowRef(null)
watch(q, () => import('fuse.js').then(module => (Fuse.value = module.default)), { once: true })

const fuse = computed(() => Fuse.value && new Fuse.value(filtersTitles.value, { threshold: 0.1, shouldSort: false, keys: ['title'] }))
const fuseFilters = computed(() => (fuse.value ? fuse.value.search(q.value).map(property('item.filter')) : filters.value))
const displayedFilters = computed(() => (q.value ? fuseFilters.value : filters.value))
const filtersBySection = computed(() => groupBy(displayedFilters.value, 'section'))
const sections = computed(() => uniq(displayedFilters.value.map(filter => filter.section)))
const closeFilters = () => (toggleFilters.value = false)
</script>

<template>
  <filters-panel
    v-model:q="q"
    @close="closeFilters"
  >
    <filters-panel-section
      v-for="section in sections"
      :key="section"
      :title="t(`filter.sections.${section}`)"
    >
      <component
        :is="getFilterComponent(filter)"
        v-for="filter in filtersBySection[section]"
        :key="filter.name"
        :filter="filter"
      />
    </filters-panel-section>
  </filters-panel>
</template>
