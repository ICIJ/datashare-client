<template>
  <component
    :is="component"
    :size="size"
    :color="color"
    :weight="weight"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  />
</template>

<script setup>
import { computed, ref, defineAsyncComponent } from 'vue'
import camelCase from 'lodash/camelCase'
import upperFirst from 'lodash/upperFirst'

const WEIGHT_THIN = 'thin'
const WEIGHT_LIGHT = 'light'
const WEIGHT_REGULAR = 'regular'
const WEIGHT_BOLD = 'bold'
const WEIGHT_FILL = 'fill'
const WEIGHT_DUOTONE = 'duotone'

const WEIGHTS = Object.freeze({
  [WEIGHT_THIN]: WEIGHT_THIN,
  [WEIGHT_LIGHT]: WEIGHT_LIGHT,
  [WEIGHT_REGULAR]: WEIGHT_REGULAR,
  [WEIGHT_BOLD]: WEIGHT_BOLD,
  [WEIGHT_FILL]: WEIGHT_FILL,
  [WEIGHT_DUOTONE]: WEIGHT_DUOTONE
})

const hover = ref(false)

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
  },
  hoverWeight: {
    type: String,
    required: false,
    default: null
  }
})

function findComponentByName(name) {
  const filename = `Ph${upperFirst(camelCase(name))}`
  return defineAsyncComponent(async () => {
    try {
      return await import(`~node_modules/@phosphor-icons/vue/dist/icons/${filename}.vue.mjs`)
    } catch {
      return import('~node_modules/@phosphor-icons/vue/dist/icons/PhSelection.vue.mjs')
    }
  })
}

const component = findComponentByName(props.name)

const weight = computed(() => {
  if (hover.value && props.hoverWeight) {
    return WEIGHTS[props.hoverWeight]
  }

  if (props.fill) {
    return WEIGHT_FILL
  }

  if (WEIGHTS[props.weight]) {
    return WEIGHTS[props.weight]
  }

  return WEIGHT_REGULAR
})

const color = computed(() => {
  return `var(--bs-${props.variant}, currentColor)`
})
</script>
