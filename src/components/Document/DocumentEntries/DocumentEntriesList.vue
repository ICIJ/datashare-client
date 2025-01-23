<script setup>
import { computed, toValue, useTemplateRef, ref, watch } from 'vue'

import AppModal from '@/components/AppModal/AppModal'
import DocumentCard from '@/components/Document/DocumentCard/DocumentCard'
import DocumentFloating from '@/components/Document/DocumentFloating'
import { useSelection } from '@/composables/selection'
import { useDocument } from '@/composables/document'
import { useSearchFilter } from '@/composables/search-filter'

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

const selection = defineModel('selection', { type: Array, default: () => [] })

const { isRouteActive, watchDocument, documentRoute } = useDocument()
const { selectionValues } = useSelection(selection)
const { refreshRoute: refreshSearchRoute } = useSearchFilter()
const elementRef = useTemplateRef('element')

const scrollDocumentCardIntoView = function ({ id, index } = {}) {
  const selector = `.document-card[data-entry-id="${id}"][data-entry-index="${index}"]`
  const card = toValue(elementRef)?.querySelector?.(selector)
  if (card) {
    // Use nullish coalescing operator to prevent error when document card is not found
    card?.scrollIntoView({ behavior: 'auto', block: 'center' })
  }
}

const showDocument = computed(() => !!documentRoute.value)

watchDocument(scrollDocumentCardIntoView)

const fullWidth = ref(null)

watch(fullWidth, () => {
  // Refresh the search route when the full width mode is enabled and a document is active.
  // This is necessary to avoid the document's modal being displayed above the list view while
  // the user is rezising the search list.
  if (fullWidth.value && documentRoute.value) {
    refreshSearchRoute()
  }
})

defineExpose({
  resetSize() {
    return toValue(elementRef)?.resetSize?.()
  },
  resetListSize() {
    return toValue(elementRef)?.resetStartSize?.()
  },
  resetDocumentSize() {
    return toValue(elementRef)?.resetEndSize?.()
  }
})
</script>

<template>
  <document-floating ref="element" class="document-entries-list" @update:fullWidth="fullWidth = $event">
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
    <div v-if="!fullWidth" class="document-entries-list__end py-3">
      <slot />
    </div>
  </document-floating>
  <app-modal
    v-if="fullWidth"
    :model-value="showDocument"
    hide-footer
    body-class="py-0 px-5"
    hide-header
    fullscreen
    lazy
    @hide="refreshSearchRoute"
  >
    <document-floating class="my-3">
      <slot name="carousel" />
      <slot />
    </document-floating>
  </app-modal>
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
      flex-shrink: 1;
      padding-right: $spacer;
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
    padding-left: $spacer-xl;
  }
}
</style>
