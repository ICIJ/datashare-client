<script setup>
import { PhosphorIcon, EllipsisTooltip as vEllipsisTooltip } from '@icij/murmur-next'
import { computed } from 'vue'

import FiltersPanelSectionFilterTitleSort from '@/components/FiltersPanel/FiltersPanelSectionFilterTitleSort'
import FiltersPanelSectionFilterTitleToggler from '@/components/FiltersPanel/FiltersPanelSectionFilterTitleToggler'

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
  },
  sort: {
    type: String
  },
  hideSort: {
    type: Boolean
  }
})

const emit = defineEmits(['toggle', 'update:sort'])

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
  <h3 class="filters-panel-section-filter-title" :class="classList">
    <slot>
      <span
        v-ellipsis-tooltip="{ title, placement: 'right' }"
        class="flex-grow-1 text-truncate"
        @click="emit('toggle', !collapse)"
      >
        <phosphor-icon :name="icon" class="me-2" />
        {{ title }}
      </span>
      <filters-panel-section-filter-title-sort
        v-if="!hideSort && !collapse"
        :model-value="sort"
        @update:modelValue="emit('update:sort', $event)"
      />
      <span @click="emit('toggle', !collapse)">
        <b-badge v-if="showCount" class="filters-panel-section-filter-title__count" pill variant="primary-subtle">
          {{ count }}
        </b-badge>
        <filters-panel-section-filter-title-toggler class="ms-auto" :collapse="collapse" />
      </span>
    </slot>
  </h3>
</template>

<style lang="scss" scoped>
.filters-panel-section-filter-title {
  font-size: 1em;
  font-weight: 500;
  min-height: 1.85em;
  color: var(--bs-primary-text-emphasis);
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &--collapsed {
    font-weight: normal;
    color: var(--bs-body-color);

    &:deep(.filters-panel-section-filter-title-toggler) {
      display: none;
    }

    &:hover {
      &:deep(.filters-panel-section-filter-title__count) {
        display: none;
      }

      &:deep(.filters-panel-section-filter-title-toggler) {
        display: inline-flex;
      }
    }
  }

  &__count {
    color: var(--bs-body-bg);
    background: var(--bs-primary-text-emphasis);
  }
}
</style>
