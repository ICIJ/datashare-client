<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { AppIcon } from '@icij/murmur'

import IPhCaretDown from '~icons/ph/caret-down'

import FiltersPanelSectionFilterEntry from '@/components/FiltersPanel/FiltersPanelSectionFilterEntry'
import { useContentTypeCategoryLabel } from '@/composables/useContentTypeCategoryLabel'

const modelValue = defineModel({ type: Boolean, default: false })
const collapse = defineModel('collapse', { type: Boolean, default: true })

const props = defineProps({
  category: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: 0
  },
  indeterminate: {
    type: Boolean
  }
})

const { t } = useI18n()
const categoryLabel = useContentTypeCategoryLabel()
const resolvedLabel = computed(() => categoryLabel(props.category))
// Category-specific so each caret has a distinct accessible name (a screen
// reader otherwise hears the same generic "Toggle" label on every row).
const collapseLabel = computed(() => t('contentTypesCategoryName.toggle', { category: resolvedLabel.value }))
</script>

<template>
  <div class="content-types-category-name d-flex align-items-center">
    <!-- Bare caret mirroring PathTreeViewEntryNameCaret so the file-types tree
         reads like the path filter: a light icon in a flush-left gutter that
         rotates from down (expanded) to right (collapsed). -->
    <button
      type="button"
      class="content-types-category-name__toggler"
      :class="{ 'content-types-category-name__toggler--collapse': collapse }"
      :aria-label="collapseLabel"
      :aria-expanded="!collapse"
      @click="collapse = !collapse"
    >
      <app-icon
        :name="IPhCaretDown"
        aria-hidden="true"
        class="content-types-category-name__toggler__icon"
      />
    </button>
    <filters-panel-section-filter-entry
      v-model="modelValue"
      class="content-types-category-name__entry flex-grow-1"
      :label="resolvedLabel"
      :count="count"
      :indeterminate="indeterminate"
    />
  </div>
</template>

<style lang="scss" scoped>
.content-types-category-name {
  &__toggler {
    // Flush-left gutter that lines up with the path filter's caret column: the
    // glyph starts at the row's edge (no indent before the caret) and the
    // category checkbox lands at $spacer-lg. ContentTypesCategory indents the
    // entries one step further ($spacer-lg + $spacer) so they nest visually
    // inside the category row rather than aligning with its checkbox.
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
    width: $spacer-lg;
    min-height: $spacer-lg;
    padding: 0;
    border: 0;
    background: none;
    color: var(--bs-primary);
    cursor: pointer;

    &:focus-visible {
      outline: 2px solid var(--bs-primary);
      outline-offset: 2px;
    }

    &__icon {
      transition: $transition-base;
    }

    &--collapse {
      color: var(--bs-tertiary);

      .content-types-category-name__toggler__icon {
        transform: rotate(-90deg);
      }
    }
  }

  &__entry {
    min-width: 0;
  }
}
</style>
