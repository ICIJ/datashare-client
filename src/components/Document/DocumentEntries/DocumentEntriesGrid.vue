<script setup>
import { computed } from 'vue'

import AppModal from '@/components/AppModal/AppModal'
import DocumentFloating from '@/components/Document/DocumentFloating'
import DocumentCardGrid from '@/components/Document/DocumentCard/DocumentCardGrid'
import { useDocument } from '@/composables/document'
import { useSearchFilter } from '@/composables/search-filter'
import { useSelection } from '@/composables/selection'

const selection = defineModel('selection', { type: Array, default: () => [] })
const { selectionValues } = useSelection(selection)

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

const { documentRoute } = useDocument()
const { refreshRoute: refreshSearchRoute } = useSearchFilter()
const showDocument = computed(() => !!documentRoute.value)
</script>

<template>
  <div class="document-entries-grid">
    <div class="document-entries-grid__header">
      <slot name="header" />
    </div>
    <div class="document-entries-grid__list">
      <div v-for="entry in entries" :key="entry.id" class="document-entries-grid__list__item">
        <document-card-grid
          v-model:selected="selectionValues[entry.id]"
          class="h-100"
          :document="entry"
          :select-mode="selectMode"
          :properties="properties"
        />
      </div>
    </div>
    <app-modal
      :model-value="showDocument"
      body-class="py-0 px-5"
      no-footer
      no-header
      fullscreen
      lazy
      @hide="refreshSearchRoute"
    >
      <document-floating class="my-3">
        <slot name="carousel" />
        <slot />
      </document-floating>
    </app-modal>
  </div>
</template>

<style lang="scss" scoped>
.document-entries-grid {
  position: relative;

  &__header {
    background: var(--bs-body-bg);
    position: sticky;
    top: 0;
    z-index: 100;
    min-width: 0;
    max-width: 100%;
    width: 100%;
  }

  &__list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: $spacer-xl;
    min-width: 0;
  }
}
</style>
