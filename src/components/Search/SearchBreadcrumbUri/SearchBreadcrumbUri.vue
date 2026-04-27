<script setup>
import { computed } from 'vue'
import { parseQuery } from 'vue-router'

import SearchBreadcrumbFormList from '@/components/Search/SearchBreadcrumbForm/SearchBreadcrumbFormList'
import { useSearchBreadcrumb } from '@/composables/useSearchBreadcrumb'
import { useSearchStore } from '@/store/modules'

const props = defineProps({
  uri: {
    type: String,
    required: true
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
  <search-breadcrumb-form-list
    :entries="entries"
    no-x-icon
  >
    <template #label>
      <slot name="label" />
    </template>
  </search-breadcrumb-form-list>
</template>
