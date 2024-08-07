<script setup>
import { computed } from 'vue'
import lucene from 'lucene'

import SearchParameterQueryAst from './SearchParameterQueryAst'
import SearchParameterQueryTerm from './SearchParameterQueryTerm'

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
  <search-parameter-query-ast v-if="ast" :ast="ast" :no-icon="noIcon" :size="size" />
  <search-parameter-query-term
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
