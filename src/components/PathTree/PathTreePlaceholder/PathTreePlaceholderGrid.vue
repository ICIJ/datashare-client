<script setup>
import { computed } from 'vue'
import { random } from 'lodash'

import AppPlaceholder from '@/components/AppPlaceholder/AppPlaceholder'
import PathTreePlaceholderListEntry from './PathTreePlaceholderListEntry'

const { compact } = defineProps({
  compact: {
    type: Boolean,
    default: false
  },
  entries: {
    type: Number,
    default: 1
  },
  flat: {
    type: Boolean,
    default: false
  },
  noStats: {
    type: Boolean,
    default: false
  }
})

const classList = computed(() => {
  return {
    'path-tree-placeholder-grid--compact': compact
  }
})
</script>

<template>
  <div
    class="path-tree-placeholder-grid"
    :class="classList"
  >
    <path-tree-placeholder-list-entry
      class="path-tree-placeholder-grid__breadcrumb"
      :compact="compact"
      :flat="flat"
      :level="0"
      no-stats
      flush
    />
    <div class="path-tree-placeholder-grid__grid">
      <div
        v-for="i in entries"
        :key="i"
        class="path-tree-placeholder-grid__grid__entry"
      >
        <div class="path-tree-placeholder-grid__grid__entry__name">
          <app-placeholder
            :width="random(40, 70)"
          />
        </div>
        <div class="path-tree-placeholder-grid__grid__entry__preview">
          <app-placeholder
            width="100%"
            height="100%"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.path-tree-placeholder-grid {
  --path-tree-placeholder-grid-gap: #{$spacer-xl};
  --path-tree-placeholder-grid-entry-border: 1px solid var(--bs-border-color);
  --path-tree-placeholder-grid-entry-border-radius: var(--bs-border-radius);
  --path-tree-placeholder-grid-entry-name-padding: #{$spacer-sm} #{$spacer};

  &--compact {
    --path-tree-placeholder-grid-gap: #{$spacer};
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
    gap: var(--path-tree-placeholder-grid-gap);

    &__entry {
      border: var(--path-tree-placeholder-grid-entry-border);
      border-radius: var(--path-tree-placeholder-grid-entry-border-radius);

      &__name {
        padding: var(--path-tree-placeholder-grid-entry-name-padding);
      }

      &__preview {
        border-top: 1px solid var(--bs-border-color);
        aspect-ratio: 1 / 1;
        overflow: auto;
        padding: $spacer;
      }
    }
  }
}
</style>
