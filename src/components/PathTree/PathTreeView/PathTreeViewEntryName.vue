<script setup>
import { computed, inject } from 'vue'
import { PhosphorIcon } from '@icij/murmur-next'

import PathTreeViewEntryNameCaret from './PathTreeViewEntryNameCaret'
import PathTreeViewEntryNameCheckbox from './PathTreeViewEntryNameCheckbox'
import { LAYOUTS, layoutValidator } from '@/enums/pathTree'

const collapse = defineModel('collapse', { type: Boolean })
const selected = defineModel('selected', { type: Boolean })
const indeterminate = defineModel('indeterminate', { type: Boolean })

const props = defineProps({
  /**
   * Whether to render in compact mode (no gaps between entries). If null, will
   * inherit from the parent PathTreeView component.
   */
  compact: {
    type: Boolean,
    default: null
  },
  /**
   * Name of the entry to display
   */
  name: {
    type: String
  },
  /**
   * Whether the entry is in select mode (checkbox next to entry). If null, will
   * inherit from the parent PathTreeView component.
   */
  selectMode: {
    type: Boolean
  },
  /**
   * Whether the entry is currently loading (replace the caret with a spinner)
   */
  loading: {
    type: Boolean
  },
  /**
   * Whether to disable the link (always render as plain text)
   */
  noLink: {
    type: Boolean,
    default: false
  },
  /**
   * Whether to disable the search link (always render as plain text)
   */
  noSearchLink: {
    type: Boolean,
    default: false
  },
  /**
   * Whether to hide the caret (for entries that cannot be expanded/collapsed)
   */
  noCaret: {
    type: Boolean,
    default: false
  },
  /**
   * Layout to use for rendering the entry
   */
  layout: {
    type: String,
    default: LAYOUTS.TREE,
    validator: layoutValidator
  },
  /**
   * Current nesting level (0 = root)
   */
  level: {
    type: Number,
    default: 0
  },
  /**
   * Type of entry (document or directory)
   */
  type: {
    type: String,
    default: 'directory'
  }
})

const icon = computed(() => {
  if (props.type === 'document') {
    return PhFile
  }
  return [collapse.value ? PhFolder : PhFolderOpen, 'fill']
})

const classList = computed(() => ({
  'path-tree-view-entry-name--collapse': collapse.value,
  'path-tree-view-entry-name--compact': compactOrInjected.value,
  'path-tree-view-entry-name--selected': selected.value,
  'path-tree-view-entry-name--no-link': props.noLink,
  'path-tree-view-entry-name--no-search-link': props.noSearchLink,
  'path-tree-view-entry-name--no-caret': props.noCaret,
  [`path-tree-view-entry-name--${props.type}`]: true,
  [`path-tree-view-entry-name--${props.layout}`]: true
}))

const style = computed(() => ({
  '--path-tree-view-entry-name-indent-factor': props.level
}))

const selectModeOrInjected = computed(() => props.selectMode ?? inject('selectMode', false))
const compactOrInjected = computed(() => props.compact ?? inject('compact', false))
const hasIcon = computed(() => !selectModeOrInjected.value || (selectModeOrInjected.value && !compactOrInjected.value))

const toggle = () => {
  collapse.value = !collapse.value
}
</script>

<template>
  <div
    class="path-tree-view-entry-name d-flex gap-1 align-items-center flex-truncate w-100"
    :class="classList"
    :style="style"
  >
    <path-tree-view-entry-name-caret
      v-if="props.layout === LAYOUTS.TREE"
      :collapse="collapse"
      :loading="loading"
      class="path-tree-view-entry-name__caret flex-shrink-0"
      @click="toggle"
    />
    <path-tree-view-entry-name-checkbox
      v-if="selectModeOrInjected"
      v-model="selected"
      v-model:indeterminate="indeterminate"
      class="flex-shrink-0 above-stretched-link"
    />
    <slot v-bind="{ toggle, icon, name, compactOrInjected }">
      <div
        class="path-tree-view-entry-name__value text-truncate stretched-link"
        @click="toggle"
      >
        <slot
          name="icon"
          v-bind="{ icon }"
        >
          <phosphor-icon
            v-if="hasIcon"
            class="path-tree-view-entry-name__value__icon"
            :name="icon"
          />
        </slot>
        {{ name }}
      </div>
    </slot>
  </div>
</template>

<style lang="scss" scoped>
.path-tree-view-entry-name {
  --path-tree-view-entry-name-font-weight: normal;
  --path-tree-view-entry-name-color: inherit;
  --path-tree-view-entry-name-icon-color: inherit;
  --path-tree-view-entry-name-cursor: default;

  --path-tree-view-entry-name-indent-width: 0px;
  --path-tree-view-entry-name-indent-factor: 0;
  --path-tree-view-entry-name-margin: 0;
  --path-tree-view-entry-name-caret-visibility: visible;
  --path-tree-view-entry-name-margin: calc(var(--path-tree-view-entry-name-indent-width) * var(--path-tree-view-entry-name-indent-factor));

  font-weight: var(--path-tree-view-entry-name-font-weight);
  color: var(--path-tree-view-entry-name-color);
  cursor: var(--path-tree-view-entry-name-cursor);
  margin-left: var(--path-tree-view-entry-name-margin);

  &--compact {
    --path-tree-view-entry-name-indent-width: #{$spacer-xs};
  }

  &:not(&--grid) {
    --path-tree-view-entry-name-indent-width: #{$spacer};
  }

  &--no-caret {
    --path-tree-view-entry-name-caret-visibility: hidden;
  }

  &__caret {
    visibility: var(--path-tree-view-entry-name-caret-visibility);
  }

  &__icon {
    color: var(--path-tree-view-entry-name-icon-color);
  }

  &--compact.path-tree-view-entry-name--selected {
    --path-tree-view-entry-name-font-weight: 500;
    --path-tree-view-entry-name-color: var(--bs-action-text-emphasis);
  }

  &--grid:not(&--selected) {
    --path-tree-view-entry-name-font-weight: 500;
    --path-tree-view-entry-name-color: var(--bs-body-color);
    --path-tree-view-entry-name-icon-color: var(--bs-secondary);
  }

  &--list:not(&--selected):not(&--no-link),
  &--grid:not(&--selected):not(&--no-link) {
    --path-tree-view-entry-name-cursor: pointer;
    --path-tree-view-entry-name-color: var(--bs-link-color);

    &:hover {
      --path-tree-view-entry-name-color: var(--bs-link-hover-color);
    }
  }
}
</style>
