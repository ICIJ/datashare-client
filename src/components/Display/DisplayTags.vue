<script setup>
import { computed } from 'vue'
import { castArray } from 'lodash'

const props = defineProps({
  value: {
    type: [Array, String]
  }
})

const tags = computed(() => {
  return castArray(props.value)
})

const tagWithSeparator = (tag, index) => {
  const separator = index < tags.value.length - 1 ? ', ' : ' '
  return `${tag}${separator}`
}
</script>

<template>
  <span class="display-tags d-inline-flex flex-wrap gap-1">
    <template
      v-for="(tag, index) in tags"
      :key="tag"
    >
      <slot
        name="tag"
        v-bind="{ tag, index }"
      >
        {{ tagWithSeparator(tag, index) }}
      </slot>
    </template>
  </span>
</template>
