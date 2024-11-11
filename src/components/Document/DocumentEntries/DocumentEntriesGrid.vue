<script setup>
import { computed } from 'vue'

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
    <div class="document-entries-grid__header py-3">
      <slot name="header" />
    </div>
    <div class="document-entries-grid__list row g-3 px-0">
      <div v-for="entry in entries" :key="entry.id" class="col-lg-3 col-md-4 col-sm-6">
        <document-card-grid
          v-model:selected="selectionValues[entry.id]"
          :document="entry"
          :select-mode="selectMode"
          :properties="properties"
        />
      </div>
    </div>
    <app-modal
      :model-value="showDocument"
      hide-footer
      body-class="py-0 px-5"
      hide-header
      fullscreen
      @hide="refreshSearchRoute"
    >
      <document-floating class="my-3">
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
    z-index: 10;
    min-width: 0;
    max-width: 100%;
    width: 100%;
  }
}
</style>
