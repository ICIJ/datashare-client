<script setup>
import { computed, ref, useTemplateRef } from 'vue'

import DocumentCard from '@/components/Document/DocumentCard/DocumentCard'
import SeparatorLine from '@/components/SeparatorLine/SeparatorLine'
import { useSelection } from '@/composables/selection'
import { useDocument } from '@/composables/document'

const selection = defineModel('selection', { type: Array, default: () => [] })
const { isRouteActive, watchDocument } = useDocument()
const { selectionValues } = useSelection(selection)
const elementRef = useTemplateRef('element')

const props = defineProps({
  entries: {
    type: Array
  },
  minWidth: {
    type: Number,
    default: 400
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

const reachedMinWidth = computed(() => separatorLineLeft.value <= props.minWidth)
const separatorLineLeft = ref(450)

const separatorLineStyle = computed(() => {
  return {
    left: `${separatorLineLeft.value}px`
  }
})

const listStyle = computed(() => {
  return {
    maxWidth: `${separatorLineLeft.value}px`,
    flex: `${separatorLineLeft.value}px 0 0`
  }
})

const scrollDocumentCardIntoView = function ({ id, index } = {}) {
  const selector = `.document-card[data-entry-id="${id}"][data-entry-index="${index}"]`
  const card = elementRef.value.querySelector(selector)
  // Use nullish coalescing operator to prevent error when document card is not found
  card?.scrollIntoView({ behavior: 'auto', block: 'center' })
}

watchDocument(scrollDocumentCardIntoView)
</script>

<template>
  <div ref="element" class="document-entries-list">
    <div class="document-entries-list__start" :style="listStyle">
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
    <separator-line
      :style="separatorLineStyle"
      :reduce-disabled="reachedMinWidth"
      :min="minWidth"
      @drag="separatorLineLeft = $event"
      @reduce="separatorLineLeft = minWidth"
      @expand="separatorLineLeft = $event"
    />
    <div class="document-entries-list__end">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.document-entries-list {
  position: relative;
  display: flex;
  max-width: 100%;
  align-items: flex-start;

  &__separator-line {
    transform: translateX(-50%);
  }

  &__start {
    max-height: 100vh;
    margin: 0;
    padding-bottom: $spacer;
    display: flex;
    flex-direction: column;
    position: sticky;
    top: 0;

    &__header {
      min-width: 0;
      max-width: 100%;
      width: 100%;
      padding: $spacer;
    }

    &__list {
      flex-grow: 1;
      overflow: auto;
      display: flex;
      flex-direction: column;
      padding-right: $spacer;
      gap: $spacer;
    }
  }

  &__end {
    width: 100%;
    padding-left: $spacer-xl;
  }
}
</style>
