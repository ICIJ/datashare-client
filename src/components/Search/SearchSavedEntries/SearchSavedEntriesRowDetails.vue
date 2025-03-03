<script setup>
import { onUnmounted, computed } from 'vue'

import SearchBreadcrumbFormEntry from '@/components/Search/SearchBreadcrumbForm/SearchBreadcrumbFormEntry'
import SearchBreadcrumbFormList from '@/components/Search/SearchBreadcrumbForm/SearchBreadcrumbFormList'
import { useSearchBreadcrumb } from '@/composables/search-breadcrumb'
import { useSearchStore } from '@/store/modules'

const { event } = defineProps({
  event: {
    type: Object,
    required: true
  }
})

const { parseEntries } = useSearchBreadcrumb()

const eventSearchStore = useSearchStore.instantiate(`event-${event.id}`)

const eventRouteQuery = computed(() => {
  const query = event.uri.split('?').pop()
  const searchParams = new URLSearchParams(query)
  const searchParamsEntries = Array.from(searchParams.entries())

  return searchParamsEntries.reduce((acc, [key, value]) => {
    // If the key already exists, make sure its value is an array and append the new value.
    if (key in acc) {
      acc[key] = Array.isArray(acc[key]) ? acc[key] : [acc[key]]
      acc[key].push(value)
    } else {
      acc[key] = value
    }

    return acc
  }, {})
})

const eventEntries = computed(() => parseEntries(eventSearchStore.toBaseRouteQuery))

eventSearchStore.updateFromRouteQuery(eventRouteQuery.value)

onUnmounted(eventSearchStore.$dispose)
</script>

<template>
  <search-breadcrumb-form-list no-label class="ps-5">
    <search-breadcrumb-form-entry v-for="(entry, i) in eventEntries" :key="i" v-bind="entry" no-x-icon />
  </search-breadcrumb-form-list>
</template>
