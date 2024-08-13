<script setup>
import { computed, ref } from 'vue'

import { useColorMode } from '@/utils/color-mode'
import { useQueryObserver } from '@/utils/query-observer'

const props = defineProps({
  defaultColorMode: {
    type: String,
    default: 'light'
  },
  src: {
    type: String
  },
  alt: {
    type: String
  },
  imageClass: {
    type: [String, Array, Object]
  }
})

const element = ref(null)

const { colorMode } = useColorMode(element, props.defaultColorMode)
const { querySelectorAll } = useQueryObserver(element)

const classList = computed(() => {
  return [`image-mode--${colorMode.value}`]
})

const sources = computed(() => {
  return querySelectorAll('.image-mode-source').map((source) => source.__exposed__)
})

const source = computed(() => {
  return sources.value.find((source) => source.colorMode === colorMode.value)
})

const defaultSource = computed(() => {
  return sources.value.find((source) => source.colorMode === props.defaultColorMode || !source.colorMode)
})

const src = computed(() => {
  return source.value?.src ?? defaultSource ?? props.src
})
</script>

<template>
  <picture ref="element" :class="classList">
    <slot />
    <img :src="src" :alt="alt" :class="imageClass" />
  </picture>
</template>
