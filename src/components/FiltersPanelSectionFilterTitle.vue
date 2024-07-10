<script setup>
import { PhosphorIcon, EllipsisTooltip as vEllipsisTooltip } from '@icij/murmur-next'
import { computed } from 'vue'

import FiltersPanelSectionFilterToggler from '@/components/FiltersPanelSectionFilterToggler'

const props = defineProps({
  title: {
    type: String
  },
  icon: {
    type: String
  },
  collapse: {
    type: Boolean
  }
})

const emit = defineEmits(['toggle'])

const classList = computed(() => {
  return {
    'filters-panel-section-filter-title--collapsed': props.collapse
  }
})
</script>

<template>
  <h3 class="filters-panel-section-filter-title" :class="classList">
    <slot>
      <phosphor-icon :name="icon" class="me-2" />
      <span v-ellipsis-tooltip="{ title, placement: 'right' }" class="text-truncate">
        {{ title }}
      </span>
      <filters-panel-section-filter-toggler class="ms-auto" :collapse="collapse" @toggle="emit('toggle', $event)" />
    </slot>
  </h3>
</template>

<style lang="scss" scoped>
.filters-panel-section-filter-title {
  font-size: 1em;
  font-weight: 400;
  color: var(--bs-primary-text-emphasis);
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  cursor: pointer;

  &--collapsed {
    font-weight: normal;
    color: var(--bs-body-color);

    &:deep(.filters-panel-section-filter-toggler) {
      visibility: hidden;
    }

    &:hover {
      &:deep(.filters-panel-section-filter-toggler) {
        visibility: visible;
      }
    }
  }
}
</style>
