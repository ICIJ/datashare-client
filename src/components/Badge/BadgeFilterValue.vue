<script setup>
import { computed } from 'vue'
import { castArray } from 'lodash'

import filters from '@/store/filters'
import * as filterTypes from '@/store/filters'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  value: {
    type: [String, Array, Number, Date, Boolean],
    required: true
  }
})

const filter = computed(() => {
  return filters.find(filter => filter.options.name === props.name)
})

const display = computed(() => {
  return filterTypes[filter.value.type]?.display
})

const values = computed(() => {
  return castArray(props.value)
})
</script>

<template>
  <span class="badge-filter-value">
    <span
      v-for="(item, i) in values"
      :key="i"
      class="badge-filter-value__item"
    >
      <template v-if="display">
        <component
          :is="display"
          :value="item"
        />
      </template>
      <template v-else>
        {{ item }}
      </template>
    </span>
  </span>
</template>

<style lang="scss" scoped>
.badge-filter-value {
  &__item {
    &:not(:last-child):after {
      content: ', ';
    }
  }
}
</style>
