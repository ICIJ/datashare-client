<script setup>
import { computed } from 'vue'

import SearchBreadcrumbEntryFilter from './SearchBreadcrumbEntryFilter'
import SearchBreadcrumbEntryQueryTerm from './SearchBreadcrumbEntryQueryTerm'

defineOptions({
  name: 'SearchBreadcrumbEntryQueryAst'
})

const props = defineProps({
  ast: {
    type: Object
  },
  operator: {
    type: String
  },
  noIcon: {
    type: Boolean
  }
})

const isLeft = computed(() => !!props.ast.left)
const isRight = computed(() => !!props.ast.right)
const isFilter = computed(() => props.ast.field !== '<implicit>' && !!props.ast.term)
const isTerm = computed(() => !!props.ast.term && !isFilter.value)
</script>

<template>
  <span class="search-breadcrumb-entry-query-ast d-inline-flex flex-wrap flex-wrap column-gap-1 row-gap-2">
    <search-breadcrumb-entry-query-ast v-if="isLeft" :ast="ast.left" :operator="operator" :no-icon="noIcon" />
    <search-breadcrumb-entry-query-term
      v-if="isTerm"
      :term="ast.term"
      :operator="operator"
      :prefix="ast.prefix"
      :no-icon="noIcon"
    />
    <search-breadcrumb-entry-filter
      v-if="isFilter"
      :name="ast.field"
      :operator="operator"
      :prefix="ast.prefix"
      :value="ast.term"
      :no-icon="noIcon"
    />
    <search-breadcrumb-entry-query-ast v-if="isRight" :ast="ast.right" :operator="ast.operator" :no-icon="noIcon" />
  </span>
</template>
