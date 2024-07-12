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
  left: {
    type: Boolean
  },
  right: {
    type: Boolean
  },
  level: {
    type: Number,
    default: 0
  }
})

const isLeft = computed(() => !!props.ast.left)
const isRight = computed(() => !!props.ast.right)
const isFilter = computed(() => props.ast.field !== '<implicit>' && !!props.ast.term)
const isTerm = computed(() => !!props.ast.term && !isFilter.value)
</script>

<template>
  <span class="search-breadcrumb-entry-query-ast">
    <search-breadcrumb-entry-query-ast
      v-if="isLeft"
      :level="level + 1"
      :operator="ast.operator"
      :ast="ast.left"
      left
    />
    <search-breadcrumb-entry-query-term
      v-if="isTerm"
      :level="level"
      :term="ast.term"
      :operator="operator ?? ast.operator"
      :prefix="ast.prefix"
      :left="left"
      :right="right"
    />
    <search-breadcrumb-entry-filter
      v-if="isFilter"
      :level="level"
      :name="ast.field"
      :operator="operator ?? ast.operator"
      :prefix="ast.prefix"
      :value="ast.term"
      :left="left"
      :right="right"
    />
    <search-breadcrumb-entry-query-ast
      v-if="isRight"
      :level="level + 1"
      :operator="ast.operator"
      :ast="ast.right"
      right
    />
  </span>
</template>
