<script setup>
import { computed, inject } from 'vue'
import { AppIcon } from '@icij/murmur-next'

import DisplayNumber from '@/components/Display/DisplayNumber'

const props = defineProps({
  /**
   * Number of documents in the entry
   */
  value: {
    type: Number,
    required: true
  },
  /**
   * List of projects to use with the search link
   */
  projects: {
    type: Array,
    default: () => []
  },
  /**
   * Current path (used for the search link)
   */
  path: {
    type: String
  },
  /**
   * Whether the entry is active (affects styling)
   */
  active: {
    type: Boolean
  },
  /**
   * Whether to render in compact mode (no gaps between entries). If null, will
   * inherit from the parent PathTreeView component.
   */
  compact: {
    type: Boolean,
    default: null
  },
  /**
   * Whether to hide the search link
   */
  noSearchLink: {
    type: Boolean
  }
})

const compactOrInjected = computed(() => props.compact ?? inject('compact', false))

const is = computed(() => (props.noSearchLink || props.compact ? 'span' : 'router-link'))

const to = computed(() => {
  if (is.value === 'span') {
    return undefined
  }

  const indices = props.projects.join(',')
  const query = { 'f[path]': props.path, indices }
  return { name: 'search', query }
})

const classList = computed(() => {
  return {
    'path-tree-view-entry-stats-documents--active': props.active,
    'path-tree-view-entry-stats-documents--no-search-link': props.noSearchLink,
    'path-tree-view-entry-stats-documents--compact': compactOrInjected.value
  }
})
</script>

<template>
  <div
    class="path-tree-view-entry-stats-documents d-inline-flex align-items-center"
    :class="classList"
  >
    <component
      :is="is"
      :to="to"
      class="path-tree-view-entry-stats-documents__link above-stretched-link d-inline-flex align-items-center flex-truncate"
    >
      <app-icon
        aria-hidden="true"
        class="me-2 flex-shrink-0 path-tree-view-entry-stats-documents__link__icon path-tree-view-entry-stats-documents__link__icon--default"
      >
        <i-ph-files />
      </app-icon>
      <app-icon
        aria-hidden="true"
        class="me-2 flex-shrink-0 path-tree-view-entry-stats-documents__link__icon path-tree-view-entry-stats-documents__link__icon--hover"
      >
        <i-ph-magnifying-glass-bold />
      </app-icon>
      <span class="text-truncate">
        <display-number :value="value" />
      </span>
    </component>
  </div>
</template>

<style lang="scss" scoped>
.path-tree-view-entry-stats-documents {
  min-width: 115px;
  flex: 0 0 115px;

  @include media-breakpoint-down(sm) {
    min-width: 0;
    flex: 1;
  }

  &--compact {
    min-width: 0;
    flex: 1;

    .path-tree-view-entry-stats-documents__link {
      border-radius: var(--bs-border-radius-pill);
      background: var(--bs-secondary);
      color: var(--bs-body-bg);
      padding: $badge-padding-y $badge-padding-x;
      font-size: $badge-font-size;
      font-weight: $badge-font-weight;
      line-height: 1;
      text-align: center;
      white-space: nowrap;

      &__icon {
        display: none;
      }
    }
  }

  &--active:not(&--no-search-link) &__link {
    background: var(--bs-action);
    color: var(--bs-white);
  }

  &--active:not(&--compact):not(&--no-search-link) &__link,
  &:not(&--compact):not(&--no-search-link) &__link:hover {
    background: var(--bs-body-bg);
    color: var(--bs-body-color);

    .path-tree-view-entry-stats-documents__link__icon {
      color: var(--bs-body-color);
    }
  }

  &:not(&--compact):not(&--no-search-link) &__link:hover {
    .path-tree-view-entry-stats-documents__link__icon--default {
      display: none;
    }

    .path-tree-view-entry-stats-documents__link__icon--hover {
      display: inline-flex;
    }
  }

  &__link {
    border-radius: var(--bs-border-radius);
    line-height: 1;
    color: inherit;
    justify-content: space-between;
    padding: $spacer-xxs $spacer-xs;

    &__icon {
      color: inherit;
      display: inline-flex;

      &--hover {
        display: none;
      }
    }
  }
}
</style>
