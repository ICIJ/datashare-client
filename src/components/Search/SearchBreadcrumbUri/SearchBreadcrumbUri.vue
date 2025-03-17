<script setup>
import { computed } from 'vue'
import { parseQuery } from 'vue-router'

import SearchBreadcrumbFormEntry from '@/components/Search/SearchBreadcrumbForm/SearchBreadcrumbFormEntry'
import SearchBreadcrumbFormList from '@/components/Search/SearchBreadcrumbForm/SearchBreadcrumbFormList'
import { useSearchBreadcrumb } from '@/composables/search-breadcrumb'
import { useSearchStore } from '@/store/modules'

const props = defineProps({
  uri: {
    type: String,
    required: true
  },
  noLabel: {
    type: Boolean,
    default: false
  }
})

const { parseEntries } = useSearchBreadcrumb()

const searchStore = useSearchStore.disposable()

const breadcrumbRouteQuery = computed(() => {
  const query = props.uri.split('?', 2).pop()
  const searchParams = new URLSearchParams(query)
  return parseQuery(searchParams.toString())
})

const entries = computed(() => parseEntries(searchStore.toBaseRouteQuery))

searchStore.updateFromRouteQuery(breadcrumbRouteQuery.value)
</script>

<template>
  <search-breadcrumb-form-list :no-label="noLabel">
    <search-breadcrumb-form-entry v-for="(entry, i) in entries" :key="i" v-bind="entry" no-x-icon />
  </search-breadcrumb-form-list>
</template>
