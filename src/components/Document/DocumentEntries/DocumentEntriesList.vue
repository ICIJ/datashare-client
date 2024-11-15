<script setup>
import { useTemplateRef } from 'vue'

import DocumentCard from '@/components/Document/DocumentCard/DocumentCard'
import DocumentFloating from '@/components/Document/DocumentFloating'
import { useSelection } from '@/composables/selection'
import { useDocument } from '@/composables/document'

const selection = defineModel('selection', { type: Array, default: () => [] })
const { isRouteActive, watchDocument } = useDocument()
const { selectionValues } = useSelection(selection)
const elementRef = useTemplateRef('element')

defineProps({
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
  }
})

const scrollDocumentCardIntoView = function ({ id, index } = {}) {
  const selector = `.document-card[data-entry-id="${id}"][data-entry-index="${index}"]`
  const card = elementRef?.value?.querySelector?.(selector)
  if (card) {
    // Use nullish coalescing operator to prevent error when document card is not found
    card?.scrollIntoView({ behavior: 'auto', block: 'center' })
  }
}

watchDocument(scrollDocumentCardIntoView)
</script>

<template>
  <document-floating ref="element" class="document-entries-list">
    <template #start>
      <div class="document-entries-list__start">
        <div class="document-entries-list__start__header">
          <slot name="header" />
        </div>
        <div class="document-entries-list__start__list">
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

  &:deep(.document-floating__start__floating) {
    margin-top: $spacer;
  }

  &__start {
    position: sticky;
    top: 0;
    display: flex;
    max-height: 100vh;
    flex-direction: column;

    &__header {
      min-width: 0;
      max-width: 100%;
      width: 100%;
      padding: $spacer;
      flex-shrink: 1;
    }

    &__list {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      padding-right: $spacer;
      gap: $spacer;
      padding-bottom: $spacer;
      overflow: auto;
      flex-grow: 1;
    }
  }

  &__end {
    width: 100%;
    overflow: auto;
    padding-left: $spacer-xl;
  }
}
</style>
