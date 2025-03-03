<script setup>
import { castArray } from 'lodash'
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
  // Convert the search params entries into an object. We cannot use Object.fromEntries directly
  // because we need to handle the case where a key is repeated. For instance, multiple values
  // for a given filter (e.g. "f[contentType]=application/pdf&f[contentType]=image/png").
  return searchParamsEntries.reduce((params, [key, value]) => {
    // If the key already exists, make sure its value is an array and append the new value.
    return Object.assign(params, { [key]: key in params ? castArray(params[key]).concat([value]) : value })
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
