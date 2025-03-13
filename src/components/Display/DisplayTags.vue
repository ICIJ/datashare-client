<script setup>
import { computed } from 'vue'
import { castArray } from 'lodash'

const props = defineProps({
  value: {
    type: [Array, String]
  }
})

const toHashtag = (tag) => `#${tag}`

const tags = computed(() => {
  return castArray(props.value)
})
</script>

<template>
  <span class="display-tags d-inline-flex flex-wrap gap-1">
    <template v-for="(tag, index) in tags" :key="tag">
      <slot name="tag" v-bind="{ tag, index }">
        <span class="display-tags__item">
          {{ tag }}<span v-if="index < tags.length - 1">, </span>
        </span>
      </slot>
    </template>
  </span>
</template>