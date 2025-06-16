<script setup>
import { computed } from 'vue'
import lucene from 'lucene'
import { useI18n } from 'vue-i18n'

import SearchParameterQueryAst from './SearchParameterQueryAst'
import SearchParameterQueryTerm from './SearchParameterQueryTerm'

import { VARIANT, variantValidator } from '@/enums/variants'

const props = defineProps({
  query: {
    type: String
  },
  size: {
    type: String
  },
  noIcon: {
    type: Boolean
  },
  noXIcon: {
    type: Boolean
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
  }
})

const { t } = useI18n()

const emit = defineEmits(['click:x'])

const ast = computed(() => {
  try {
    return lucene.parse(props.query.replace('\\@', '@'))
  } catch {
    return null
  }
})
</script>

<template>
  <search-parameter-query-ast
    v-if="ast"
    :ast="ast"
    :color="color"
    :counter="counter"
    :no-icon="noIcon"
    :no-x-icon="noXIcon"
    :size="size"
    @click:x="emit('click:x', $event)"
  >
    <slot />
  </search-parameter-query-ast>
  <search-parameter-query-term
    v-else
    :term="query"
    :counter="counter"
    :no-icon="noIcon"
    :no-x-icon="noXIcon"
    :size="size"
    :title="t('searchParameterQuery.title')"
    color="var(--bs-danger)"
    prefix="-"
    icon="warning"
    @click:x="emit('click:x', $event)"
  >
    <slot />
  </search-parameter-query-term>
</template>
