<script setup>
import { computed, onBeforeMount, ref } from 'vue'
import { castArray } from 'lodash'
import { useI18n } from 'vue-i18n'

import { useSearchFilter } from '@/composables/useSearchFilter'
import { useWait } from '@/composables/useWait'
import { useStarredStore } from '@/store/modules'
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
const { getTotal, getFilterValues, setFilterValue, watchIndices, indices } = useSearchFilter()

const { waitFor } = useWait()
const total = ref(0)
const starredDocumentsCount = computed(() => props.filter.starredDocuments.length)
const notStarredDocumentsCount = computed(() => Math.max(0, total.value - starredDocumentsCount.value))

const fetch = waitFor(async () => {
  await starredStore.fetchIndicesStarredDocuments(indices.value)
  total.value = await getTotal()
})

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
defineExpose({ fetch })
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
        name="not-starred"
        :label="t('filter.notStarred')"
        :count="notStarredDocumentsCount"
        :hide-count="hideCount"
        :value="false"
      />
    </b-form-checkbox-group>
  </filter-type>
</template>
