<script setup>
import Fuse from 'fuse.js'
import { computed, ref, watch } from 'vue'
import { get, identity, isFunction } from 'lodash'
import { autoUpdate, autoPlacement, size, useFloating } from '@floating-ui/vue'

import FormControlTagDropdownItem from './FormControlTagDropdownItem'

const props = defineProps({
  options: {
    type: Array,
    default: () => []
  },
  modelValue: {
    type: Array
  },
  inputValue: {
    type: String
  },
  show: {
    type: Boolean
  },
  searchKeys: {
    type: Array,
    default: () => []
  },
  trackBy: {
    type: [String, Function],
    default: identity
  },
  limit: {
    type: Number,
    default: 100
  },
  target: {
    type: Object
  },
  noDuplicates: {
    type: Boolean
  },
  focusIndex: {
    type: Number,
    default: -1
  }
})

const previousFocusIndex = computed(() => {
  return Math.max(-1, props.focusIndex - 1)
})

const nextFocusIndex = computed(() => {
  return Math.min(filteredOptions.value.length - 1, props.focusIndex + 1)
})

const hasOption = (option) => {
  return props.modelValue.includes(getOptionValue(option))
}

const getOptionValue = ({ item }) => {
  return getValue(item)
}

const getValue = (value) => {
  if (isFunction(props.trackBy)) {
    return props.trackBy(value)
  }
  return get(value, props.trackBy)
}

const filteredOptions = computed(() => {
  return fuse.value.search(props.inputValue).slice(0, props.limit)
})

const availableOptions = computed(() => {
  if (props.noDuplicates) {
    return props.options.filter(option => !hasOption(option))
  }
  return props.options
})

const fuse = computed(() => {
  return new Fuse(availableOptions.value, {
    distance: 100,
    shouldSort: true,
    keys: props.searchKeys
  })
})

const emit = defineEmits(['addTag', 'update:show', 'update:tag', 'update:modelValue'])

const addOption = (option) => {
  addTag(getOptionValue(option))
}

const addFocusOption = () => {
  if (props.focusIndex > -1) {
    addOption(filteredOptions.value[props.focusIndex])
  }
}

const addTag = (tag) => {
  emit('addTag', tag)
}

watch(filteredOptions, (filteredOptions) => {
  emit('update:show', !!filteredOptions.length)
})

watch(
  () => props.focusIndex,
  () => {
    const dropdownItems = element.value.querySelectorAll('.dropdown-item')
    dropdownItems[props.focusIndex]?.focus()
  }
)

const classList = computed(() => {
  return {
    'form-control-tag-dropdown--show': props.show,
    [`form-control-tag-dropdown--${placement.value}`]: true
  }
})

const element = ref(null)
const targetTrigger = ref(null)
const { placement, floatingStyles } = useFloating(targetTrigger, element, {
  strategy: 'fixed',
  whileElementsMounted: autoUpdate,
  middleware: [
    autoPlacement({
      alignment: 'bottom-start',
      allowedPlacements: ['top', 'top-start', 'bottom', 'bottom-start']
    }),
    size({
      apply({ rects, elements }) {
        Object.assign(elements.floating.style, {
          width: `${rects.reference.width}px`
        })
      }
    })
  ]
})

watch(
  () => props.target,
  () => {
    targetTrigger.value = props.target
  }
)
</script>

<template>
  <div
    ref="element"
    class="form-control-tag-dropdown dropdown-menu"
    :class="classList"
    :style="floatingStyles"
    @keydown.up.prevent="$emit('update:focusIndex', previousFocusIndex)"
    @keydown.down.prevent="$emit('update:focusIndex', nextFocusIndex)"
    @keydown.enter.prevent="addFocusOption()"
  >
    <form-control-tag-dropdown-item
      v-for="(option, i) in filteredOptions"
      :key="i"
      :item="option.item"
      :value="getOptionValue(option)"
      :active="hasOption(option)"
      @click="addOption(option)"
    >
      <!-- eslint-disable-next-line vue/no-template-shadow -->
      <template #default="{ active, item, value }">
        <slot
          name="dropdown-item"
          v-bind="{ active, item, value }"
        />
      </template>
    </form-control-tag-dropdown-item>
  </div>
</template>

<style lang="scss" scoped>
.form-control-tag-dropdown {
  border: var(--bs-border-width) solid var(--bs-border-color);
  position: fixed;
  width: max-content;
  top: 0;
  left: 0;
  max-height: 60vh;
  overflow: auto;

  &--bottom,
  &--bottom-start,
  &--bottom-end {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    border-top: 0;
  }

  &--top,
  &--top-start,
  &--top-end {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    border-bottom: 0;
  }

  &--show {
    display: block;
  }
}
</style>
