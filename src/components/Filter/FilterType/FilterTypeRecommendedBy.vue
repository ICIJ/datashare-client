<script setup>
import Fuse from 'fuse.js'
import { computed, onBeforeMount } from 'vue'
import { property, sortBy } from 'lodash'

import { useCore } from '@/composables/useCore'
import { useSearchFilter } from '@/composables/useSearchFilter'
import { useRecommendedStore } from '@/store/modules'
import DisplayUser from '@/components/Display/DisplayUser'
import FormControlSearch from '@/components/Form/FormControl/FormControlSearch'
import FilterType from '@/components/Filter/FilterType/FilterType'
import FiltersPanelSectionFilterEntry from '@/components/FiltersPanel/FiltersPanelSectionFilterEntry'

const props = defineProps({
  filter: {
    type: Object,
    required: true
  }
})

const query = defineModel('query', { type: String, default: '' })

const recommendedStore = useRecommendedStore()
const { core } = useCore()
const { computedFilterValues, watchIndices, indices } = useSearchFilter()

const selected = computedFilterValues(props.filter)
const currentUserId = computed(() => core.config.get('uid', 'local'))

const recommendations = computed(() => {
  // We ensure that the current user is always first
  return sortBy(recommendedStore.byUsers, ({ user, count }) => {
    return user === currentUserId.value ? -1e9 : -count
  })
})

const fuse = computed(() => {
  return new Fuse(recommendations.value, {
    threshold: 0.1,
    shouldSort: false,
    keys: ['user']
  })
})

const entries = computed(() => {
  if (!query.value) {
    return recommendations.value
  }
  return fuse.value.search(query.value).map(property('item'))
})

function fetch() {
  return recommendedStore.fetchIndicesRecommendations(indices.value)
}

onBeforeMount(fetch)
watchIndices(fetch)
</script>

<template>
  <filter-type :filter="filter">
    <template #search>
      <form-control-search v-model="query" clear-text class="filters-panel-section-filter__content__search mb-3" />
    </template>
    <b-form-checkbox-group v-model="selected">
      <template v-for="{ count, user } in entries" :key="user">
        <filters-panel-section-filter-entry :label="user" :value="user" :count="count">
          <display-user :value="user" hide-avatar hide-link />
        </filters-panel-section-filter-entry>
      </template>
    </b-form-checkbox-group>
  </filter-type>
</template>
