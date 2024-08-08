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
  <span class="display-tags text-action-emphasis d-inline-flex gap-2">
    <template v-for="(content, index) in tags" :key="content">
      <slot name="content" v-bind="{ content, index }">
        <span>{{ toHashtag(content) }}</span>
      </slot>
    </template>
  </span>
</template>
