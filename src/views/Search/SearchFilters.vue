<script setup>
import { computed, ref, shallowRef, toRef, watch } from 'vue'
import { whenever } from '@vueuse/core'
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
const { toggleFilters, isFiltersClosed } = useViews()
const { isMode } = useMode()
const { getFilterComponent } = useSearchFilter()
const { t } = useI18n()

// The filter panel can start closed (the app default). In that case, don't
// mount — and thus don't chunk-load — the filter components until the
// current search has finished, so their dynamic imports never compete with
// the search fetch/render for network or main-thread time. If the panel is
// open at mount, or the user opens it before the search finishes, render
// right away instead of making them wait on either.
const shouldRenderFilters = ref(!isFiltersClosed.value || searchStore.isReady)
if (isFiltersClosed.value) {
  whenever(toRef(searchStore, 'isReady'), () => (shouldRenderFilters.value = true), { once: true })
}
watch(isFiltersClosed, (closed) => {
  if (!closed) {
    shouldRenderFilters.value = true
  }
})

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
    <template v-if="shouldRenderFilters">
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
    </template>
  </filters-panel>
</template>
