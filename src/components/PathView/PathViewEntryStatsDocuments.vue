<script setup>
import { computed, inject } from 'vue'
import { PhosphorIcon } from '@icij/murmur-next'

import DisplayNumber from '@/components/Display/DisplayNumber'

const props = defineProps({
  value: {
    type: Number,
    required: true
  },
  active: {
    type: Boolean
  },
  compact: {
    type: Boolean,
    default: null
  }
})

const compactOrInjected = computed(() => props.compact ?? inject('compact', false))

const classList = computed(() => {
  return {
    'path-view-entry-stats-documents--active': props.active,
    'path-view-entry-stats-documents--compact': compactOrInjected.value
  }
})
</script>

<template>
  <div class="path-view-entry-stats-documents d-inline-flex align-items-center">
    <a class="path-view-entry-stats-documents__link d-inline-flex align-items-center" :class="classList">
      <phosphor-icon
        name="files"
        aria-hidden="true"
        class="me-2 path-view-entry-stats-documents__link__icon path-view-entry-stats-documents__link__icon--default"
      />
      <phosphor-icon
        name="magnifying-glass"
        aria-hidden="true"
        weight="bold"
        class="me-2 path-view-entry-stats-documents__link__icon path-view-entry-stats-documents__link__icon--hover"
      />
      <display-number :value="value" />
    </a>
  </div>
</template>

<style lang="scss" scoped>
.path-view-entry-stats-documents {
  min-width: 115px;
  flex: 0 0 115px;

  @include media-breakpoint-down(sm) {
    min-width: 0;
    flex: 1;
  }

  &__link {
    border-radius: var(--bs-border-radius);
    line-height: 1;
    color: inherit;
    justify-content: space-between;
    cursor: pointer;
    padding: $spacer-xxs $spacer-xs;

    &--compact {
      border-radius: var(--bs-border-radius-pill);
      background: var(--bs-secondary);
      color: var(--bs-body-bg);
      padding: $badge-padding-y $badge-padding-x;
      font-size: $badge-font-size;
      font-weight: $badge-font-weight;
      line-height: 1;
      text-align: center;
      white-space: nowrap;

      .path-view-entry-stats-documents__icon {
        display: none;
      }
    }

    &--active,
    &:hover:not(&--compact) {
      background: var(--bs-action-text-emphasis);
      color: var(--bs-body-bg);

      .path-view-entry-stats-documents__icon {
        color: var(--bs-body-bg);
      }
    }

    &__icon {
      color: var(--bs-secondary-color);
      display: inline-flex;

      &--hover {
        display: none;
      }
    }

    &:hover:not(&--compact) {
      .path-view-entry-stats-documents__icon--default {
        display: none;
      }

      .path-view-entry-stats-documents__icon--hover {
        display: inline-flex;
      }
    }
  }
}
</style>
