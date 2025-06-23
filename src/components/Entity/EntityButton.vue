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
  },
  clickable: {
    type: Boolean
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
  return {
    [`entity-button--category-${category.value}`]: true,
    'entity-button--clickable': props.clickable
  }
})

const style = computed(() => {
  return {
    '--entity-button-border-color': color.value
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

<style lang="scss" scoped>
.entity-button {
  --bs-btn-color: var(--bs-body-color);
  --bs-btn-bg: var(--bs-body-bg);
  --bs-btn-padding-y: #{math.div(10, 16) * 1em};
  --bs-btn-border-color: var(--entity-button-border-color);

  border-style: dashed;
  cursor: default;

  &:not(&--clickable) {
    --bs-btn-hover-bg: var(--bs-btn-bg);
    --bs-btn-hover-color: var(--bs-btn-color);
    --bs-btn-hover-border-color: var(--bs-btn-border-color);
    --bs-btn-active-color: var(--bs-btn-color);
    --bs-btn-active-shadow: none;
    --bs-btn-active-bg: var(--bs-btn-bg);
    --bs-btn-active-border-color: var(--entity-button-border-color);
  }

  &--clickable {
    --bs-btn-hover-bg: var(--bs-btn-bg);
    --bs-btn-hover-color: --bs-btn-color;
    --bs-btn-hover-border-color: var(--bs-btn-border-color);

    cursor: pointer;

    &:hover {
      border-style: solid;
    }
  }
}
</style>
