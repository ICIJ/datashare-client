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
  return castArray(props.value).map(toHashtag).join(' ')
})
</script>

<template>
  <span class="text-action-emphasis">{{ tags }}</span>
</template>
