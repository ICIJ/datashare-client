<script setup>
import { computed } from 'vue'
import { random } from 'lodash'
import { AppIcon } from '@icij/murmur-next'
import IPhCaretDown from '~icons/ph/caret-down'
import IPhCaretRight from '~icons/ph/caret-right'

import AppPlaceholder from '@/components/AppPlaceholder/AppPlaceholder'

const { compact, flat, flush, level, open } = defineProps({
  /**
   * Whether to render in compact mode (no gaps between entries)
   */
  compact: {
    type: Boolean,
    default: false
  },
  /**
   * Whether to render as a flat list (no indentation)
   */
  flat: {
    type: Boolean,
    default: false
  },
  /**
   * Whether to render entries without a padding
   */
  flush: {
    type: Boolean,
    default: false
  },
  /**
   * Current nesting level (0 = root)
   */
  level: {
    type: Number,
    default: 0
  },
  /**
   * Whether the entry is nested inside another list (adds a left border)
   */
  nested: {
    type: Boolean,
    default: false
  },
  /**
   * Whether to hide the stats (size, date) on each entry
   */
  noStats: {
    type: Boolean,
    default: false
  },
  /**
   * Whether the entry is "open" (shows down caret instead of right caret)
   */
  open: {
    type: Boolean,
    default: false
  }
})

const style = computed(() => ({
  '--path-tree-placeholder-list-entry-indent-factor': level
}))

const classList = computed(() => {
  return {
    'path-tree-placeholder-list-entry--compact': compact,
    'path-tree-placeholder-list-entry--flush': flush,
    'path-tree-placeholder-list-entry--flat': flat
  }
})

const caretIcon = computed(() => {
  return open ? IPhCaretDown : IPhCaretRight
})
</script>

<template>
  <div
    class="path-tree-placeholder-list-entry"
    :class="classList"
    :style="style"
  >
    <div class="path-tree-placeholder-list-entry__name">
      <app-icon
        v-if="nested"
        :name="caretIcon"
        width="1em"
      />
      <app-placeholder width="1em" />
      <app-placeholder :width="random(40, 70)" />
    </div>
    <div
      v-if="!noStats"
      class="path-tree-placeholder-list-entry__stats"
    >
      <app-placeholder width="100%" />
      <template v-if="!compact">
        <app-placeholder width="100%" />
        <app-placeholder width="100%" />
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.path-tree-placeholder-list-entry {
  --path-tree-placeholder-list-entry-background: transparent;
  --path-tree-placeholder-list-entry-border-radius: var(--bs-border-radius);
  --path-tree-placeholder-list-entry-border: 0;
  --path-tree-placeholder-list-entry-height: 3.5rem;
  --path-tree-placeholder-list-entry-line-height: 1;
  --path-tree-placeholder-list-entry-padding: #{$spacer-sm} #{$spacer};
  --path-tree-placeholder-list-entry-stats-width: 1rem;
  --path-tree-placeholder-list-entry-stats-flex: 0 0 var(--path-tree-placeholder-list-entry-stats-width);

  --path-tree-placeholder-list-entry-indent-width: #{$spacer};
  --path-tree-placeholder-list-entry-indent-factor: 0;
  --path-tree-placeholder-list-entry-margin-left: calc(var(--path-tree-placeholder-list-entry-indent-width) * var(--path-tree-placeholder-list-entry-indent-factor));

  &--flush {
    --path-tree-placeholder-list-entry-padding: #{$spacer-sm} 0;
  }

  &--flat {
    --path-tree-placeholder-list-entry-margin-left: 0;
  }

  &--compact {
    --path-tree-placeholder-list-entry-padding: 2px 0;
    --path-tree-placeholder-list-entry-height: 1.75rem;
    --path-tree-placeholder-list-entry-stats-width: 30px;
  }

  display: flex;
  align-items: center;
  gap: $spacer;
  background: var(--path-tree-placeholder-list-entry-background);
  height: var(--path-tree-placeholder-list-entry-height);
  line-height: var(--path-tree-placeholder-list-entry-line-height);
  padding: var(--path-tree-placeholder-list-entry-padding);
  border: var(--path-tree-placeholder-list-entry-border);
  border-radius: var(--path-tree-placeholder-list-entry-border-radius);
  margin-left: var(--path-tree-placeholder-list-entry-margin-left);

  &__name {
    flex: 1 0 auto;
    display: flex;
    gap: $spacer-xs;
    align-items: center;
    color: var(--bs-tertiary-bg-subtle);
  }

  &__stats {
    max-width: var(--path-tree-placeholder-list-entry-stats-width);
    flex: var(--path-tree-placeholder-list-entry-stats-flex);
    width: 100%;
    display: flex;
    gap: $spacer;
    align-items: center;
    margin-left: auto;
  }

  &:not(.path-tree-placeholder-list-entry--compact) &__stats {
    --path-tree-placeholder-list-entry-stats-width: 300px;

    @include media-breakpoint-down(md) {
      --path-tree-placeholder-list-entry-stats-width: 260px;
      --path-tree-placeholder-list-entry-stats-flex: 1 0 0;
    }
  }
}
</style>
