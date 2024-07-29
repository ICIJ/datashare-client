<script setup>
import { computed } from 'vue'
import lucene from 'lucene'

import SearchBreadcrumbEntryQueryAst from './SearchBreadcrumbEntryQueryAst'
import SearchBreadcrumbEntryQueryTerm from './SearchBreadcrumbEntryQueryTerm'

const props = defineProps({
  query: {
    type: String
  },
  noIcon: {
    type: Boolean
  },
  size: {
    type: String
  }
})

const ast = computed(() => {
  try {
    return lucene.parse(props.query.replace('\\@', '@'))
  } catch {
    return null
  }
})
</script>

<template>
  <search-breadcrumb-entry-query-ast v-if="ast" :ast="ast" :no-icon="noIcon" :size="size" />
  <search-breadcrumb-entry-query-term
    v-else
    :term="query"
    :no-icon="noIcon"
    :size="size"
    title="Unable to parse the query"
    color="var(--bs-danger)"
    prefix="-"
    icon="warning"
  />
</template>
