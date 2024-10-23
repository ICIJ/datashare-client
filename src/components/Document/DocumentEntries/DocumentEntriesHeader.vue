<script setup>
import { computed, useTemplateRef } from 'vue'
import { TinyPagination } from '@icij/murmur-next'

import useResizeObserver from '@/composables/resize-observer'
import ButtonToggleBatchMode from '@/components/Button/ButtonToggleBatchMode'
import ButtonDownloadDocuments from '@/components/Button/ButtonDownloadDocuments'

const selectMode = defineModel('selectMode', { type: Boolean, default: false })
const page = defineModel('page', { type: Number, default: 1 })

const props = defineProps({
  perPage: {
    type: Number,
    default: 25
  },
  total: {
    type: Number,
    default: 0
  },
  compactThreshold: {
    type: Number,
    default: 430
  },
  loading: {
    type: Boolean
  }
})

const elementRef = useTemplateRef('element')
const { state: elementState } = useResizeObserver(elementRef)
const elementWidth = computed(() => elementState.offsetWidth)
const compact = computed(() => elementWidth.value <= props.compactThreshold)
</script>

<template>
  <div ref="element" class="document-entries-header d-flex align-items-center justify-content-start gap-1 py-3">
    <button-toggle-batch-mode v-model:active="selectMode" :loading="loading" />
    <tiny-pagination :key="total" v-model="page" row :total-rows="total" :per-page="perPage" :compact="compact">
      <template #number-of-rows="{ lastRangeRow: to }">
        <template v-if="compact">
          {{ $tc('documentEntriesHeader.tinyPagination.rowRangeCompact', total, { total: $n(total) }) }}
        </template>
        <template v-else>
          {{ $tc('documentEntriesHeader.tinyPagination.rowRange', total, { to: $n(to), total: $n(total) }) }}
        </template>
      </template>
    </tiny-pagination>
    <button-download-documents />
  </div>
</template>

<style lang="scss" scoped>
.document-entries-header {
  overflow: hidden;

  & > * {
    flex-shrink: 0;
  }
}
</style>
