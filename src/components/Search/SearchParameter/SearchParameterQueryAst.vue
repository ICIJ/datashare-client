<script setup>
import { computed } from 'vue'

import SearchParameterFilter from './SearchParameterFilter'
import SearchParameterQueryTerm from './SearchParameterQueryTerm'

defineOptions({
  name: 'SearchParameterQueryAst'
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
  },
  noXIcon: {
    type: Boolean
  },
  size: {
    type: String
  }
})

const isLeft = computed(() => !!props.ast.left)
const isRight = computed(() => !!props.ast.right)
const isFilter = computed(() => props.ast.field !== '<implicit>' && !!props.ast.term)
const isTerm = computed(() => !!props.ast.term && !isFilter.value)
</script>

<template>
  <span class="search-parameter-query-ast d-inline-flex flex-wrap flex-wrap column-gap-1 row-gap-2">
    <search-parameter-query-ast v-if="isLeft" :ast="ast.left" :operator="operator" :no-icon="noIcon" :size="size" />
    <search-parameter-query-term
      v-if="isTerm"
      :term="ast.term"
      :operator="operator"
      :prefix="ast.prefix"
      :no-icon="noIcon"
      :size="size"
    />
    <search-parameter-filter
      v-if="isFilter"
      :name="ast.field"
      :operator="operator"
      :prefix="ast.prefix"
      :value="ast.term"
      :no-icon="noIcon"
      :size="size"
    />
    <search-parameter-query-ast
      v-if="isRight"
      :ast="ast.right"
      :operator="ast.operator"
      :no-icon="noIcon"
      :size="size"
    />
  </span>
</template>
