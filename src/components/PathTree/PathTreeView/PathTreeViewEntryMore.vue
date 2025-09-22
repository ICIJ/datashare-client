<script setup>
import { computed, inject } from 'vue'
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur-next'

import { LAYOUTS, layoutValidator } from '@/enums/pathTree'

const props = defineProps({
  flat: {
    type: Boolean,
    default: false
  },
  page: {
    type: Number,
    default: 1
  },
  perPage: {
    type: Number,
    default: 25
  },
  total: {
    type: Number,
    default: 0
  },
  compact: {
    type: Boolean,
    default: null
  },
  layout: {
    type: String,
    default: LAYOUTS.TREE,
    validator: layoutValidator
  },
  level: {
    type: Number,
    default: 0
  },
})

const { t } = useI18n()

const classList = computed(() => {
  return {
    'path-tree-view-entry-more--flat': props.flat,
    [`path-tree-view-entry-more--${props.layout}`]: true
  }
})

const style = computed(() => ({
  '--path-tree-view-entry-more-indent-factor': props.level
}))

const nextPageSize = computed(() => {
  return Math.min(props.perPage, props.total - props.page * props.perPage)
})

const directoriesLeft = computed(() => {
  return Math.max(0, props.total - props.page * props.perPage)
})

const compactOrInjected = computed(() => props.compact ?? inject('compact', false))
const size = computed(() => (compactOrInjected.value ? 'sm' : 'md'))
</script>

<template>
  <div
    class="path-tree-view-entry-more"
    :style="style"
    :class="classList"
  >
    <button-icon
      :icon-left="PhCaretDown"
      icon-left-variant="primary"
      class="shadow-lg text-nowrap above-stretched-link"
      variant="outline-tertiary"
      :size="size"
    >
      <slot>
        {{ t('pathViewEntryMore.label', { nextPageSize, directoriesLeft }, directoriesLeft) }}
      </slot>
    </button-icon>
  </div>
</template>

<style lang="scss" scoped>
.path-tree-view-entry-more {
  --path-tree-view-entry-more-indent-width: #{$spacer-xl};
  --path-tree-view-entry-more-indent-factor: 0;
  --path-tree-view-entry-more-padding-x: calc(var(--path-tree-view-entry-more-indent-width) * var(--path-tree-view-entry-more-indent-factor));
  --path-tree-view-entry-more-padding-y: #{$spacer-xs};
  --path-tree-view-entry-more-justify-content: flex-start;

  display: flex;
  justify-content: var(--path-tree-view-entry-more-justify-content);
  padding-inline: var(--path-tree-view-entry-more-padding-x);
  padding-block: var(--path-tree-view-entry-more-padding-y);
  grid-column: 1 / -1;

  &--flat {
    --path-tree-view-entry-more-padding-x: 0;
    --path-tree-view-entry-more-justify-content: center;
  }

  &--grid {
    --path-tree-view-entry-more-padding-x: 0;
    --path-tree-view-entry-more-padding-y: 0;
    --path-tree-view-entry-more-justify-content: center;
  }
}
</style>
