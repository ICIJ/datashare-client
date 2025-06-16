<script setup>
import { computed } from 'vue'
import { pick } from 'lodash'

import SearchParameterQuery from '@/components/Search/SearchParameter/SearchParameterQuery'
import SearchParameterFilter from '@/components/Search/SearchParameter/SearchParameterFilter'

const props = defineProps({
  filter: {
    type: String
  },
  query: {
    type: String
  },
  value: {
    type: String
  },
  color: {
    type: String,
    default: null
  },
  icon: {
    type: [String, Object, Array],
    default: null
  },
  size: {
    type: String
  },
  noIcon: {
    type: Boolean
  },
  noXIcon: {
    type: Boolean
  }
})

const component = computed(() => {
  return props.filter ? SearchParameterFilter : SearchParameterQuery
})

const componentProps = computed(() => {
  return props.filter ? filterComponentProps.value : queryComponentProps.value
})

const filterComponentProps = computed(() => {
  return { name: props.filter, ...pick(props, ['value', 'icon', 'color', 'noIcon', 'noXIcon', 'size']) }
})

const queryComponentProps = computed(() => {
  return pick(props, ['query', 'noIcon', 'noXIcon', 'size'])
})
</script>

<template>
  <component :is="component" v-bind="componentProps">
    <slot />
  </component>
</template>
