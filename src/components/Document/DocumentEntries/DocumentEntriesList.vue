<script setup>
import { computed, toValue, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import VueScrollTo from 'vue-scrollto'

import DocumentCard from '@/components/Document/DocumentCard/DocumentCard'
import DocumentCardPlaceholder from '@/components/Document/DocumentCard/DocumentCardPlaceholder'
import DocumentFloating from '@/components/Document/DocumentFloating'
import { useDocument } from '@/composables/useDocument'
import { useSelection } from '@/composables/useSelection'
import { DISPLAY, displayValidator } from '@/enums/documentFloating'

const props = defineProps({
  entries: {
    type: Array
  },
  selectMode: {
    type: Boolean,
    default: false
  },
  properties: {
    type: Array,
    default: () => ['title', 'thumbnail']
  },
  loading: {
    type: Boolean
  },
  display: {
    type: String,
    default: DISPLAY.BOTH,
    validator: displayValidator
  }
})
const { t } = useI18n()

const selection = defineModel('selection', { type: Array, default: () => [] })

const { isRouteActive, watchDocument } = useDocument()
const { selectionValues } = useSelection(selection)
const elementRef = useTemplateRef('element')

const scrollDocumentCardIntoView = function ({ id, index } = {}) {
  const selector = `.document-card[data-entry-id="${id}"][data-entry-index="${index}"]`
  const target = toValue(elementRef)?.$el?.querySelector?.(selector)
  const container = target?.closest('.document-entries-list__start__list')
  if (target && container) {
    const offset = -200
    const reducedMotion = !!window.matchMedia('(prefers-reduced-motion: reduce)')?.matches
    const duration = reducedMotion ? 0 : 500
    VueScrollTo.scrollTo(target, duration, { container, offset })
  }
}

const startClassList = computed(() => {
  return {
    'document-entries-list__start--display-start': props.display === DISPLAY.START
  }
})

watchDocument(scrollDocumentCardIntoView)
</script>

<template>
  <document-floating
    ref="element"
    class="document-entries-list"
    :display="display"
    no-reduce
    no-expand
    fill
  >
    <template #start>
      <div
        class="document-entries-list__start"
        :class="startClassList"
      >
        <div class="document-entries-list__start__header">
          <slot name="header" />
        </div>
        <div class="document-entries-list__start__list">
          <template v-if="loading">
            <document-card-placeholder
              :properties="properties"
              :repeat="5"
              vertical-actions
            />
          </template>
          <template v-else-if="entries.length">
            <document-card
              v-for="entry in entries"
              :key="entry.id"
              v-model:selected="selectionValues[entry.id]"
              :active="isRouteActive(entry)"
              :document="entry"
              :select-mode="selectMode"
              :properties="properties"
              :data-entry-id="entry.id"
              :data-entry-index="entry.index"
            />
          </template>
          <template v-else>
            <p class="p-3 text-secondary text-center">
              {{ t('documentEntries.noMatches') }}
            </p>
          </template>
        </div>
      </div>
    </template>
    <div class="document-entries-list__end py-3">
      <slot />
    </div>
  </document-floating>
</template>

<style lang="scss" scoped>
.document-entries-list {
  &:deep(.document-floating__separator-line) {
    top: $spacer;
    height: calc(100% - #{$spacer * 2});
  }

  &:deep(.document-floating--reached-min-width .document-floating__separator-line),
  &:deep(.document-floating--reached-full-width .document-floating__separator-line) {
    display: none;
  }

  &:deep(.document-floating__start__floating) {
    margin-top: $spacer;
  }

  &__start {
    --document-entries-list-start-max-height: 100vh;
    --document-entries-list-start-position: sticky;
    --document-entries-list-start-display: flex;

    --document-entries-list-start-header-position: static;
    --document-entries-list-start-header-padding-right: #{$spacer};
    --document-entries-list-start-list-padding-right: #{$spacer};

    top: 0;
    position: var(--document-entries-list-start-position);
    max-height: var(--document-entries-list-start-max-height);
    display: var(--document-entries-list-start-display);
    flex-direction: column;

    &__header {
      top: 0;
      min-width: 0;
      max-width: 100%;
      width: 100%;
      flex-shrink: 1;
      position: var(--document-entries-list-start-header-position);
      padding-right: var(--document-entries-list-start-header-padding-right);
      background: var(--bs-body-bg);
      z-index: $zindex-sticky;
    }

    &__list {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      padding-right: var(--document-entries-list-start-list-padding-right);
      gap: $spacer;
      padding-bottom: $spacer;
      overflow: auto;
    }

    &--display-start {
      --document-entries-list-start-position: static;
      --document-entries-list-start-max-height: none;
      --document-entries-list-start-display: block;
      --document-entries-list-start-header-position: sticky;
      --document-entries-list-start-header-padding-right: 0;
      --document-entries-list-start-list-padding-right: 0;
    }
  }

  &__end {
    width: 100%;
  }
}
</style>
