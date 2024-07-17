<script setup>
import { computed } from 'vue'

import NamedEntityButtonOccurrences from './NamedEntityButtonOccurrences'

import { getCategoryIcon, getCategoryColor } from '@/utils/namedEntity'

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
  <icon-button variant="outline-light" class="named-entity-button" :class="classList" :style="style" :icon-left="icon">
    {{ namedEntity.mention }}
    <named-entity-button-occurrences class="ms-2" v-if="occurrences" :occurrences="occurrences" />
  </icon-button>
</template>

<style lang="scss" scoped>
.named-entity-button {
  --bs-btn-border-color: var(--color, currentColor);
  --bs-btn-color: var(--bs-body-color);
  --bs-btn-bg: var(--bs-body-bg);
  --bs-btn-hover-color: --bs-btn-color;
  --bs-btn-hover-bg: --bs-btn-bg;
  --bs-btn-hover-border-color: var(--bs-btn-border-color);

  border-style: dashed;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:deep(.icon-button__icon-left) {
    transition: $btn-transition;
  }

  &:hover {
    border-style: solid;
  }

  &:active:deep(.icon-button__icon-left) {
    color: inherit;
  }

  &:deep(.icon-button__icon-left) {
    color: var(--color, currentColor);
  }
}
</style>
