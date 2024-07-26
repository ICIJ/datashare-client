<script setup>
import { computed } from 'vue'
import { PhosphorIcon } from '@icij/murmur-next'

import DisplayNumber from '@/components/Display/DisplayNumber'

const props = defineProps({
  value: {
    type: Number,
    required: true
  },
  active: {
    type: Boolean
  }
})

const classList = computed(() => {
  return {
    'path-view-entry-stats-documents--active': props.active
  }
})
</script>

<template>
  <a class="path-view-entry-stats-documents d-inline-flex align-items-center px-2 py-1" :class="classList">
    <phosphor-icon
      name="files"
      aria-hidden="true"
      class="me-2 path-view-entry-stats-documents__icon path-view-entry-stats-documents__icon--default"
    />
    <phosphor-icon
      name="magnifying-glass"
      aria-hidden="true"
      weight="bold"
      class="me-2 path-view-entry-stats-documents__icon path-view-entry-stats-documents__icon--hover"
    />
    <display-number :value="value" />
  </a>
</template>

<style lang="scss" scoped>
.path-view-entry-stats-documents {
  border-radius: var(--bs-border-radius);
  line-height: 1;
  color: inherit;
  cursor: pointer;

  &--active,
  &:hover {
    background: var(--bs-action);
    color: var(--bs-white);

    .path-view-entry-stats-documents__icon {
      color: var(--bs-white);
    }
  }

  &__icon {
    color: var(--bs-secondary-color);
    display: inline-flex;

    &--hover {
      display: none;
    }
  }

  &:hover {
    .path-view-entry-stats-documents__icon--default {
      display: none;
    }

    .path-view-entry-stats-documents__icon--hover {
      display: inline-flex;
    }
  }
}
</style>
