<script setup>
import { computed, onBeforeMount } from 'vue'
import { sortBy } from 'lodash'

import { useCore } from '@/composables/core'
import { useSearchFilter } from '@/composables/search-filter'
import { useRecommendedStore } from '@/store/modules/recommended'
import DisplayUser from '@/components/Display/DisplayUser'
import FilterType from '@/components/Filter/FilterType/FilterType'
import FiltersPanelSectionFilterEntry from '@/components/FiltersPanel/FiltersPanelSectionFilterEntry'

const props = defineProps({
  filter: {
    type: Object,
    required: true
  }
})

const recommendedStore = useRecommendedStore()
const { core } = useCore()
const { computedFilterValues, watchIndices, indices } = useSearchFilter()

const selected = computedFilterValues(props.filter)
const currentUserId = computed(() => core.config.get('uid', 'local'))

const entries = computed(() => {
  // We ensure that the current user is always first
  return sortBy(recommendedStore.byUsers, ({ user, count }) => {
    return user === currentUserId.value ? -1e9 : -count
  })
})

function fetch() {
  return recommendedStore.fetchIndicesRecommendations(indices.value)
}

onBeforeMount(fetch)
watchIndices(fetch)
</script>

<template>
  <filter-type :filter="filter">
    <b-form-checkbox-group v-model="selected">
      <template v-for="{ count, user } in entries" :key="user">
        <filters-panel-section-filter-entry :label="user" :value="user" :count="count">
          <display-user :value="user" hide-avatar hide-link />
        </filters-panel-section-filter-entry>
      </template>
    </b-form-checkbox-group>
  </filter-type>
</template>
