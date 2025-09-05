<script setup>
import { computed, onBeforeMount, ref } from 'vue'
import { castArray } from 'lodash'
import { useI18n } from 'vue-i18n'

import { useSearchFilter } from '@/composables/useSearchFilter'
import { useSearchStore, useStarredStore } from '@/store/modules'
import FiltersPanelSectionFilterEntry from '@/components/FiltersPanel/FiltersPanelSectionFilterEntry'
import FilterType from '@/components/Filter/FilterType/FilterType'

const props = defineProps({
  filter: {
    type: Object,
    required: true
  },
  hideCount: {
    type: Boolean
  }
})

const { t } = useI18n()
const starredStore = useStarredStore()
const searchStore = useSearchStore.inject()
const { getTotal, getFilterValues, setFilterValue, watchIndices } = useSearchFilter()

const total = ref(0)
const starredDocumentsCount = computed(() => props.filter.starredDocuments.length)
const notStarredDocumentsCount = computed(() => Math.max(0, total.value - starredDocumentsCount.value))

async function fetch() {
  await starredStore.fetchIndicesStarredDocuments(searchStore.indices)
  total.value = await getTotal()
}

const isTruthy = value => value === true || value === 'true'

const selected = computed({
  get() {
    return getFilterValues(props.filter).map(isTruthy)
  },
  set(values) {
    const key = castArray(values).map(bool => isTruthy(bool).toString())
    setFilterValue(props.filter, { key })
  }
})

onBeforeMount(fetch)
watchIndices(fetch)
</script>

<template>
  <filter-type :filter="filter">
    <b-form-checkbox-group v-model="selected">
      <filters-panel-section-filter-entry
        name="starred"
        :label="t('filter.starred')"
        :count="starredDocumentsCount"
        :hide-count="hideCount"
        :value="true"
      />
      <filters-panel-section-filter-entry
        name="starred"
        :label="t('filter.notStarred')"
        :count="notStarredDocumentsCount"
        :hide-count="hideCount"
        :value="false"
      />
    </b-form-checkbox-group>
  </filter-type>
</template>
