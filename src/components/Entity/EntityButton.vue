<script setup>
import { computed } from 'vue'

import EntityOccurrences from './EntityOccurrences'

import { getCategoryIcon, getCategoryColor } from '@/utils/entity'
import ButtonIcon from '@/components/Button/ButtonIcon'

defineOptions({
  name: 'EntityButton'
})

const props = defineProps({
  entity: {
    type: Object
  }
})

const category = computed(() => {
  return props.entity.category?.toLowerCase()
})

const color = computed(() => {
  return getCategoryColor(category.value)
})

const icon = computed(() => {
  return getCategoryIcon(category.value)
})

const classList = computed(() => {
  return [`entity-button--category-${category.value}`]
})

const style = computed(() => {
  return {
    '--bs-btn-border-color': color.value
  }
})

const occurrences = computed(() => {
  return props.entity?.offsets?.length ?? 0
})
</script>

<template>
  <button-icon
    variant="outline-tertiary"
    class="entity-button text-nowrap"
    :class="classList"
    :style="style"
    :icon-left="icon"
    :to="entity.to"
  >
    {{ entity.mention }}
    <entity-occurrences v-if="occurrences" class="ms-2" :occurrences="occurrences" />
  </button-icon>
</template>

<style lang="scss">
.entity-button {
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
