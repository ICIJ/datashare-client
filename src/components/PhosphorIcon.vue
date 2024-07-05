<template>
  <span class="phosphor-icon" :style="style">
    <component
      :is="component"
      :size="size"
      :color="color"
      :weight="weight"
      :spin="spin"
      @mouseenter="hover = true"
      @mouseleave="hover = false"
    >
      <animateTransform
        v-if="spin"
        attributeName="transform"
        attributeType="XML"
        type="rotate"
        :dur="spinDuration"
        from="0 0 0"
        to="360 0 0"
        repeatCount="indefinite"
      />
    </component>
  </span>
</template>

<script setup>
import { computed, ref, shallowRef, defineAsyncComponent, watch } from 'vue'
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
    default: '1.25em'
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
  },
  spin: {
    type: Boolean
  },
  spinDuration: {
    type: String,
    default: '1s'
  }
})

function findComponentByName(name) {
  const filename = `Ph${upperFirst(camelCase(name))}`
  return defineAsyncComponent(async () => {
    try {
      return await import(`~node_modules/@phosphor-icons/vue/dist/icons/${filename}.vue.mjs`)
    } catch {
      // eslint-disable-next-line import/extensions
      return import('~node_modules/@phosphor-icons/vue/dist/icons/PhSelection.vue.mjs')
    }
  })
}

const component = shallowRef(findComponentByName(props.name))

watch(
  () => props.name,
  () => {
    component.value = findComponentByName(props.name)
  }
)

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

const style = computed(() => {
  return {
    '--phosphor-icon-color': color.value,
    '--phosphor-icon-weight': weight.value,
    '--phosphor-icon-size': props.size
  }
})
</script>

<style scoped>
.phosphor-icon {
  display: inline-block;
  height: var(--phosphor-icon-size, 1em);
  line-height: var(--phosphor-icon-size, 1em);
  width: var(--phosphor-icon-size, 1em);
}
</style>
