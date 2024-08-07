<script setup>
import { computed } from 'vue'

import ButtonIcon from '@/components/Button/ButtonIcon'

defineOptions({
  name: 'SearchParameterQueryTerm'
})

const props = defineProps({
  term: {
    type: String
  },
  prefix: {
    type: String,
    default: null
  },
  icon: {
    type: String,
    default: 'magnifying-glass'
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
    variant="outline-danger"
    class="search-parameter-query-term"
    :class="classList"
    :size="size"
    :style="style"
    :icon-left="noIcon ? null : icon"
    :icon-right="noXIcon ? null : 'x'"
    icon-right-hover-weight="bold"
    @click:icon-right="$emit('click:x')"
  >
    <template v-if="showOperator" #start>
      <span class="search-parameter-query-term__operator">
        {{ operator }}
      </span>
    </template>
    <span class="search-parameter-query-term__value">
      {{ term }}
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
    border-style: solid;

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

  &--negative &__value {
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
