<script setup>
import { computed } from 'vue'

import SearchParameterFilter from './SearchParameterFilter'
import SearchParameterQueryTerm from './SearchParameterQueryTerm'

import { VARIANT, variantValidator } from '@/enums/variants'

defineOptions({
  name: 'SearchParameterQueryAst'
})

const props = defineProps({
  ast: {
    type: Object
  },
  color: {
    type: String,
    default: null
  },
  counter: {
    type: Number,
    default: null
  },
  counterVariant: {
    type: String,
    default: VARIANT.LIGHT,
    validator: variantValidator
  },
  counterStyle: {
    type: [String, Object],
    default: null
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

const emit = defineEmits(['click:x'])

const isLeft = computed(() => !!props.ast.left)
const isRight = computed(() => !!props.ast.right)
const isFilter = computed(() => props.ast.field !== '<implicit>' && !!props.ast.term)
const isTerm = computed(() => !!props.ast.term && !isFilter.value)
</script>

<template>
  <span class="search-parameter-query-ast d-inline-flex flex-wrap flex-wrap column-gap-1 row-gap-2">
    <search-parameter-query-ast
      v-if="isLeft"
      :ast="ast.left"
      :color="color"
      :counter="counter"
      :operator="operator"
      :no-icon="noIcon"
      :no-x-icon="noXIcon"
      :size="size"
      @click:x="emit('click:x', ast.left)"
    >
      <slot />
    </search-parameter-query-ast>
    <search-parameter-query-term
      v-if="isTerm"
      :term="ast.term"
      :color="color"
      :counter="counter"
      :operator="operator"
      :prefix="ast.prefix"
      :no-icon="noIcon"
      :no-x-icon="noXIcon"
      :size="size"
      @click:x="emit('click:x', ast)"
    >
      <slot />
    </search-parameter-query-term>
    <search-parameter-filter
      v-if="isFilter"
      v-bind="$attrs"
      :name="ast.field"
      :color="color"
      :counter="counter"
      :operator="operator"
      :prefix="ast.prefix"
      :value="ast.term"
      :no-icon="noIcon"
      :no-x-icon="noXIcon"
      :size="size"
      @click:x="emit('click:x', ast)"
    >
      <slot />
    </search-parameter-filter>
    <search-parameter-query-ast
      v-if="isRight"
      v-bind="$attrs"
      :ast="ast.right"
      :counter="counter"
      :operator="ast.operator"
      :no-icon="noIcon"
      :no-x-icon="noXIcon"
      :size="size"
      @click:x="emit('click:x', $event)"
    >
      <slot />
    </search-parameter-query-ast>
  </span>
</template>
