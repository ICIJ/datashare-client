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
  count: {
    type: Number,
    default: 0
  },
  collapse: {
    type: Boolean
  }
})

const emit = defineEmits(['toggle'])

const showCount = computed(() => {
  return props.count > 0 && props.collapse
})

const classList = computed(() => {
  return {
    'filters-panel-section-filter-title--collapsed': props.collapse
  }
})
</script>

<template>
  <h3 class="filters-panel-section-filter-title" :class="classList" @click="emit('toggle', !collapse)">
    <slot>
      <phosphor-icon :name="icon" class="me-2" />
      <span v-ellipsis-tooltip="{ title, placement: 'right' }" class="text-truncate flex-grow-1">
        {{ title }}
      </span>
      <b-badge v-if="showCount" class="filters-panel-section-filter-title__count mx-2" pill variant="primary-subtle">
        {{ count }}
      </b-badge>
      <filters-panel-section-filter-toggler class="ms-auto" :collapse="collapse" />
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

  &__count {
    color: var(--bs-body-bg);
    background: var(--bs-primary-text-emphasis);
  }
}
</style>
