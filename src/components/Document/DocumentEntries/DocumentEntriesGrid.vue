<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import DocumentCardGrid from '@/components/Document/DocumentCard/DocumentCardGrid'
import DocumentCardGridPlaceholder from '@/components/Document/DocumentCard/DocumentCardGridPlaceholder'
import { useSelection } from '@/composables/useSelection'

const selection = defineModel('selection', { type: Array, default: () => [] })
const { selectionValues } = useSelection(selection)

const { loading, entries } = defineProps({
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
  }
})
const { t } = useI18n()

const noMatches = computed(() => !loading && !entries.length)
</script>

<template>
  <div class="document-entries-grid">
    <div class="document-entries-grid__header">
      <slot name="header" />
    </div>
    <div class="document-entries-grid__list">
      <template v-if="loading">
        <document-card-grid-placeholder :properties="properties" :repeat="5" />
      </template>
      <template v-else>
        <div v-for="entry in entries" :key="entry.id" class="document-entries-grid__list__item">
          <document-card-grid
            v-model:selected="selectionValues[entry.id]"
            class="h-100"
            :document="entry"
            :select-mode="selectMode"
            :properties="properties"
          />
        </div>
      </template>
    </div>
    <div v-if="noMatches" class="p-3 text-secondary text-center">
      {{ t('documentEntries.noMatches') }}
    </div>
    <slot />
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
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: $spacer-xl;
    min-width: 0;
  }
}
</style>
