<script setup>
import { computed } from 'vue'
import { ButtonIcon } from '@icij/murmur-next'
import IPhMagnifyingGlass from '~icons/ph/magnifying-glass'
import IPhX from '~icons/ph/x'

import { VARIANT, variantValidator } from '@/enums/variants'

defineOptions({
  name: 'SearchParameterQueryTerm'
})

const props = defineProps({
  term: {
    type: String
  },
  counter: {
    type: Number,
    default: null
  },
  counterVariant: {
    type: String,
    default: VARIANT.LIGHT,
    validator: variantValidator
  },
  counterStyle: {
    type: [String, Object],
    default: null
  },
  prefix: {
    type: String,
    default: null
  },
  icon: {
    type: [String, Object, Array],
    default: () => IPhMagnifyingGlass
  },
  iconLabel: {
    type: String,
    default: null
  },
  color: {
    type: String,
    default: null
  },
  operator: {
    type: String
  },
  noIcon: {
    type: Boolean
  },
  noXIcon: {
    type: Boolean
  },
  size: {
    type: String
  }
})

const emit = defineEmits(['click:x'])

const classList = computed(() => {
  return {
    'search-parameter-query-term--negative': props.prefix === '-'
  }
})

const style = computed(() => {
  return {
    '--color': props.color
  }
})

const showOperator = computed(() => {
  return props.operator === 'AND'
})
</script>

<template>
  <button-icon
    variant="outline-secondary"
    class="search-parameter-query-term"
    :counter="counter"
    :counter-variant="counterVariant"
    :class="classList"
    :size="size"
    :style="style"
    :icon-left="noIcon ? null : icon"
    :icon-left-label="iconLabel"
    :icon-right="noXIcon ? null : IPhX"
    icon-right-hover-weight="bold"
    @click:icon-right="emit('click:x')"
  >
    <template
      v-if="showOperator"
      #start
    >
      <span class="search-parameter-query-term__operator">
        {{ operator }}
      </span>
    </template>
    <span class="search-parameter-query-term__value">
      <slot>{{ term }}</slot>
    </span>
  </button-icon>
</template>

<style lang="scss" scoped>
.search-parameter-query-term {
  border-style: dashed;
  border-color: var(--color, currentColor);
  color: var(--bs-body-color);
  background: var(--bs-body-bg);

  &:hover {
    cursor: default;
  }

  &:has(.button-icon__icon-right.app-icon--hover) {
    border-style: solid;
    cursor: pointer;

    &:deep(.button-icon__icon-right) {
      color: var(--bs-body-color);
    }
  }

  &:active &__operator {
    background: rgba(var(--bs-body-bg-rgb), 0.2);
  }

  &:active:deep(.button-icon__icon-left),
  &:active:deep(.button-icon__icon-right) {
    color: inherit;
  }

  &__operator {
    background: var(--bs-tertiary-bg-subtle);
    padding: 0 $spacer-xs;
    margin-right: $spacer-xs;
    border-radius: $border-radius;
    text-transform: uppercase;
  }

  &--negative &__value,
  &--negative &__value > * {
    text-decoration: line-through;
  }

  &:deep(.button-icon__icon-left) {
    color: var(--color, currentColor);
  }

  &:deep(.button-icon__icon-right) {
    color: var(--bs-tertiary);
  }
}
</style>
