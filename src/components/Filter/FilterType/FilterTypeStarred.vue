<script setup>
import { computed, ref, onBeforeMount, watchEffect } from 'vue'
import { castArray } from 'lodash'
import { useStore } from 'vuex'

import { useSearchFilter } from '@/composables/search-filter'
import FiltersPanelSectionFilterEntry from '@/components/FiltersPanel/FiltersPanelSectionFilterEntry'
import FilterType from '@/components/Filter/FilterType/FilterType'

const props = defineProps({
  filter: {
    type: Object,
    required: true
  }
})

const { dispatch } = useStore()
const { getTotal, getFilterValues, setFilterValue } = useSearchFilter()

const total = ref(0)
const starredDocumentsCount = computed(() => props.filter.starredDocuments.length)
const notStarredDocumentsCount = computed(() => total.value - starredDocumentsCount.value)

async function fetch() {
  dispatch('starred/fetchIndicesStarredDocuments')
  total.value = await getTotal()
}

const isTruthy = (value) => value === true || value === 'true'

const selected = computed({
  get() {
    return getFilterValues(props.filter).map(isTruthy)
  },
  set(values) {
    const key = castArray(values.length > 1 ? values.pop() : values)
    setFilterValue(props.filter, { key })
  }
})

onBeforeMount(fetch)
watchEffect(fetch)
</script>

<template>
  <filter-type :filter="filter">
    <b-form-checkbox-group v-model="selected">
      <filters-panel-section-filter-entry
        name="starred"
        :label="$t('filter.starred')"
        :count="starredDocumentsCount"
        :value="true"
      />
      <filters-panel-section-filter-entry
        name="starred"
        :label="$t('filter.notStarred')"
        :count="notStarredDocumentsCount"
        :value="false"
      />
    </b-form-checkbox-group>
  </filter-type>
</template>
