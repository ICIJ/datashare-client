<script setup>
import Fuse from 'fuse.js'
import { computed, onBeforeMount } from 'vue'
import property from 'lodash/property'
import sortBy from 'lodash/sortBy'
import { useConfig } from '@/composables/useConfig'
import { useSearchFilter } from '@/composables/useSearchFilter'
import { useLockedFiltersStore, useRecommendedStore } from '@/store/modules'
import DisplayUser from '@/components/Display/DisplayUser'
import FormControlSearch from '@/components/Form/FormControl/FormControlSearch'
import FilterType from '@/components/Filter/FilterType/FilterType'
import FiltersPanelSectionFilterEntry from '@/components/FiltersPanel/FiltersPanelSectionFilterEntry'

const props = defineProps({
  filter: {
    type: Object,
    required: true
  },
  hideCount: {
    type: Boolean
  },
  // Suppresses the per-value lock button entirely. See FilterType.vue's
  // hideLock for why (disposable/unrelated screens rendering against a
  // non-live search store).
  hideLock: {
    type: Boolean
  }
})

const query = defineModel('query', { type: String, default: '' })

const recommendedStore = useRecommendedStore()
const config = useConfig()
const lockedFiltersStore = useLockedFiltersStore()
const { computedFilterValues, setFilterValue, watchIndices, indices } = useSearchFilter()

// `recommendedBy` has no exclude mode (hideExclude: true in its filter def),
// so the plain filter name is the lock store key, same as FilterTypeStarred.
function isItemLocked(user) {
  return lockedFiltersStore.isLocked({ name: 'recommendedBy', value: user })
}

function toggleLock(user, locked) {
  if (locked) {
    // Locking an unticked value also selects it — a single click both
    // applies and locks the filter.
    if (!selected.value.includes(user)) {
      selected.value = [...selected.value, user]
    }
    lockedFiltersStore.lock({ name: 'recommendedBy', value: user, label: user })
  }
  else {
    lockedFiltersStore.unlock({ name: 'recommendedBy', value: user })
  }
}

const selected = computedFilterValues(props.filter, {
  // computedFilterValues' default setter replaces the whole values array
  // rather than adding/removing one value at a time, bypassing
  // useSearchFilter's central unlock-on-remove path — unlock explicitly for
  // any value dropped from the selection, same as FilterTypeStarred.
  set(values) {
    for (const user of selected.value) {
      if (!values.includes(user)) {
        lockedFiltersStore.unlock({ name: 'recommendedBy', value: user })
      }
    }
    setFilterValue(props.filter, { key: values })
  }
})
const currentUserId = computed(() => config.get('uid', 'local'))

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
      <form-control-search
        v-model="query"
        clear-text
        class="filters-panel-section-filter__content__search mb-3"
      />
    </template>
    <b-form-checkbox-group v-model="selected">
      <template
        v-for="{ count, user } in entries"
        :key="user"
      >
        <filters-panel-section-filter-entry
          :label="user"
          :value="user"
          :count="count"
          :hide-count="hideCount"
          :hide-lock="hideLock"
          :locked="isItemLocked(user)"
          @update:locked="toggleLock(user, $event)"
        >
          <display-user
            :value="user"
            hide-avatar
            hide-link
          />
        </filters-panel-section-filter-entry>
      </template>
    </b-form-checkbox-group>
  </filter-type>
</template>
