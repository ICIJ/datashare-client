<script setup>
import { computed } from 'vue'
import { PhosphorIcon } from '@icij/murmur-next'

import { useSchema } from '@/composables/useSchema'

const props = defineProps({
  value: {
    type: String
  },
  colorize: {
    type: Boolean,
    default: false
  }
})

const { getContentTypeDisplay } = useSchema()

const display = computed(() => getContentTypeDisplay(props.value))
const icon = computed(() => display.value.icon)
const style = computed(() => {
  const color = props.colorize ? display.value.foreground : 'inherit'
  return { color }
})
</script>

<template>
  <phosphor-icon :name="icon" :style="style" />
</template>
