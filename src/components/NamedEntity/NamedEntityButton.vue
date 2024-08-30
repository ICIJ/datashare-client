<script setup>
import { computed } from 'vue'

import NamedEntityOccurrences from './NamedEntityOccurrences'

import { getCategoryIcon, getCategoryColor } from '@/utils/namedEntity'
import ButtonIcon from '@/components/Button/ButtonIcon'

defineOptions({
  name: 'NamedEntityButton'
})

const props = defineProps({
  namedEntity: {
    type: Object
  }
})

const category = computed(() => {
  return props.namedEntity.category.toLowerCase()
})

const color = computed(() => {
  return getCategoryColor(category.value)
})

const icon = computed(() => {
  return getCategoryIcon(category.value)
})

const classList = computed(() => {
  return [`named-entity-button--category-${category.value}`]
})

const style = computed(() => {
  return {
    '--color': color.value
  }
})

const occurrences = computed(() => {
  return props.namedEntity?.offsets?.length ?? 0
})
</script>

<template>
  <button-icon
    variant="outline-tertiary"
    class="named-entity-button text-nowrap"
    :class="classList"
    :style="style"
    :icon-left="icon"
  >
    {{ namedEntity.mention }}
    <named-entity-occurrences v-if="occurrences" class="ms-2" :occurrences="occurrences" />
  </button-icon>
</template>

<style lang="scss" scoped>
.named-entity-button {
  --bs-btn-border-color: var(--color, currentColor);
  --bs-btn-color: var(--bs-body-color);
  --bs-btn-bg: var(--bs-body-bg);
  --bs-btn-hover-color: --bs-btn-color;
  --bs-btn-hover-bg: --bs-btn-bg;
  --bs-btn-hover-border-color: var(--bs-btn-border-color);
  --bs-btn-padding-y: #{math.div(10, 16) * 1em};

  border-style: dashed;

  &:deep(.button-icon__icon-left) {
    transition: $btn-transition;
  }

  &:hover {
    border-style: solid;
  }
}
</style>
