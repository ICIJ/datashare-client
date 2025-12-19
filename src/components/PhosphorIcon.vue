<template>
  <span
    class="phosphor-icon"
    :class="classList"
    :style="style"
    @mouseenter="currentHover = true"
    @mouseleave="currentHover = hover ?? false"
  >
    <Icon
      :icon="iconName"
      :width="rawSize"
      :height="rawSize"
      :style="iconStyle"
    />
  </span>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import isArray from 'lodash/isArray'
import camelCase from 'lodash/camelCase'
import kebabCase from 'lodash/kebabCase'

const props = defineProps({
  name: {
    type: [String, Array, Object],
    required: true
  },
  size: {
    type: [String, Number],
    default: undefined
  },
  scale: {
    type: Number,
    default: 1
  },
  variant: {
    type: String,
    default: undefined
  },
  hoverVariant: {
    type: String,
    default: undefined
  },
  fill: {
    type: Boolean,
    default: false
  },
  weight: {
    type: String,
    default: 'regular',
    validator: (value) => ['bold', 'fill', 'thin', 'light', 'regular', 'duotone'].includes(value)
  },
  hoverWeight: {
    type: String,
    default: undefined,
    validator: (value) => !value || ['bold', 'fill', 'thin', 'light', 'regular', 'duotone'].includes(value)
  },
  beat: {
    type: Boolean,
    default: false
  },
  beatDuration: {
    type: String,
    default: '1s'
  },
  fade: {
    type: Boolean,
    default: false
  },
  fadeDuration: {
    type: String,
    default: '1s'
  },
  spin: {
    type: Boolean,
    default: false
  },
  spinReverse: {
    type: Boolean,
    default: false
  },
  spinDuration: {
    type: String,
    default: '1s'
  },
  hover: {
    type: Boolean,
    default: false
  }
})

const currentHover = ref(false)
watch(() => props.hover, () => (currentHover.value = props.hover), { immediate: true })

// Convert name to Iconify icon name
const iconName = computed(() => {
  let name = props.name

  // Handle array format [name, weight]
  if (isArray(name)) {
    name = name[0]
  }

  // Handle component object - extract name if possible
  if (typeof name === 'object' && name?.name) {
    name = name.name
  } else if (typeof name === 'object') {
    // If it's a component object without name, try to use as is
    return 'ph:question'
  }

  // Convert from phosphor-vue component name (e.g., "PhCircleNotch" or "circle-notch")
  let iconBaseName = name
  if (iconBaseName.startsWith('Ph')) {
    iconBaseName = iconBaseName.substring(2)
  }

  // Convert to kebab-case for Iconify
  iconBaseName = kebabCase(camelCase(iconBaseName))

  // Get the weight suffix for Iconify
  const weightSuffix = getWeightSuffix()

  return `ph:${iconBaseName}${weightSuffix}`
})

const getWeightSuffix = () => {
  let weight = props.weight

  // Handle array format with weight
  if (isArray(props.name) && props.name.length > 1) {
    weight = props.name[1]
  }

  // Use hover weight if hovering
  if (currentHover.value && props.hoverWeight) {
    weight = props.hoverWeight
  }

  // Use fill weight if fill prop is true
  if (props.fill) {
    weight = 'fill'
  }

  // Map weight to Iconify suffix
  switch (weight) {
    case 'bold':
      return '-bold'
    case 'fill':
      return '-fill'
    case 'thin':
      return '-thin'
    case 'light':
      return '-light'
    case 'duotone':
      return '-duotone'
    case 'regular':
    default:
      return ''
  }
}

const color = computed(() => {
  let colorVariant = 'currentColor'

  if (props.variant) {
    colorVariant = `var(--bs-${props.variant}, currentColor)`
  }

  if (currentHover.value && props.hoverVariant) {
    colorVariant = `var(--bs-${props.hoverVariant}, ${colorVariant})`
  }

  return colorVariant
})

const isRawSize = computed(() => {
  return !['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', undefined].includes(props.size)
})

const hasSize = computed(() => {
  return ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'].includes(props.size ?? '')
})

const rawSize = computed(() => {
  if (isRawSize.value) {
    return props.size
  }
  return '1.25em'
})

const style = computed(() => {
  return {
    '--phosphor-icon-color': color.value,
    '--phosphor-icon-raw-size': isRawSize.value ? props.size : undefined,
    '--phosphor-icon-size': hasSize.value ? props.size : undefined,
    '--phosphor-icon-scale': props.scale ?? 1,
  }
})

const iconStyle = computed(() => {
  const styles = {
    color: color.value
  }

  // Add animations
  if (props.spin || props.spinReverse) {
    styles.animation = `phosphor-spin ${props.spinDuration} linear infinite`
    if (props.spinReverse) {
      styles.animationDirection = 'reverse'
    }
  }

  if (props.beat) {
    styles.animation = `phosphor-beat ${props.beatDuration} ease-in-out infinite`
  }

  if (props.fade) {
    styles.animation = `phosphor-fade ${props.fadeDuration} ease-in-out infinite`
  }

  return styles
})

const classList = computed(() => {
  return {
    [`phosphor-icon--size-${props.size}`]: hasSize.value,
    [`phosphor-icon--has-size`]: hasSize.value,
    [`phosphor-icon--hover`]: currentHover.value,
  }
})
</script>

<style lang="scss" scoped>
.phosphor-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  // Size classes matching murmur's sizing
  &--size-2xs {
    width: 0.75rem;
    height: 0.75rem;
    font-size: 0.75rem;
  }

  &--size-xs {
    width: 0.875rem;
    height: 0.875rem;
    font-size: 0.875rem;
  }

  &--size-sm {
    width: 1rem;
    height: 1rem;
    font-size: 1rem;
  }

  &--size-md {
    width: 1.25rem;
    height: 1.25rem;
    font-size: 1.25rem;
  }

  &--size-lg {
    width: 1.5rem;
    height: 1.5rem;
    font-size: 1.5rem;
  }

  &--size-xl {
    width: 2rem;
    height: 2rem;
    font-size: 2rem;
  }

  &--size-2xl {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 2.5rem;
  }
}

// Animations
@keyframes phosphor-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes phosphor-beat {
  0%, 100% {
    transform: scale(0.8);
  }
  50% {
    transform: scale(1.2);
  }
}

@keyframes phosphor-fade {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
</style>
