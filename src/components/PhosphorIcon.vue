<template>
  <component :is="component" :size="size" :color="color" :weight="weight" />
</template>

<script setup>
import { computed, defineAsyncComponent } from 'vue'
import camelCase from 'lodash/camelCase'
import upperFirst from 'lodash/upperFirst'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: String,
    required: false,
    default: '1.25rem'
  },
  variant: {
    type: String,
    required: false,
    default: null
  },
  fill: {
    type: Boolean,
    required: false,
    default: false
  },
  weight: {
    type: String,
    required: false,
    default: 'regular'
  }
})

const weights = {
  thin: 'thin',
  light: 'light',
  regular: 'regular',
  bold: 'bold',
  fill: 'fill',
  duotone: 'duotone'
}

function relativePathForIcon(name) {
  const filename = `Ph${upperFirst(camelCase(name))}`
  return defineAsyncComponent(() => import(`../../node_modules/@phosphor-icons/vue/dist/icons/${filename}.vue.mjs`))
}
const component = relativePathForIcon(props.name)
const weight = computed(() => {
  if (props.fill) return weights.fill
  if (weights[props.weight]) return props.weight
  return weights.regular
})

const color = computed(() => {
  return `var(--bs-${props.variant}, currentColor)`
})
</script>
