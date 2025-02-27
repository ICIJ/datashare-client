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
const eventRouteQuery = computed(() => Object.fromEntries(new URLSearchParams(event.uri.split('?').pop())))
const eventEntries = computed(() => parseEntries(eventSearchStore.toBaseRouteQuery))

eventSearchStore.updateFromRouteQuery(eventRouteQuery.value)

onUnmounted(eventSearchStore.$dispose)
</script>

<template>
  <search-breadcrumb-form-list>
    <search-breadcrumb-form-entry v-for="(entry, i) in eventEntries" :key="i" v-bind="entry" no-x-icon />
  </search-breadcrumb-form-list>
</template>
