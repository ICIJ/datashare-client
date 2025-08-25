<script setup>
import { computed, toRef, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { useCompact } from '@/composables/useCompact'
import { useCore } from '@/composables/useCore'
import ButtonToggleBatchMode from '@/components/Button/ButtonToggleBatchMode'
import ButtonDownloadDocuments from '@/components/Button/ButtonDownloadDocuments'
import RowPaginationDocuments from '@/components/RowPagination/RowPaginationDocuments'
import byteSize from '@/utils/byteSize'
import humanSize from '@/utils/humanSize'
import { useSearchStore } from '@/store/modules'

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
    default: 580
  },
  loading: {
    type: Boolean
  }
})

const elementRef = useTemplateRef('element')
const { compact } = useCompact(elementRef, { threshold: toRef(props, 'compactThreshold') })
const { core, toast } = useCore()
const { t, tm, n } = useI18n()
const searchStore = useSearchStore.inject()
const router = useRouter()

// We limit pagination below 10,000 results
const noNextPage = computed(() => props.perPage * page.value >= 1e4)
const noLastPage = computed(() => props.total >= 1e4)

const batchDownloadDocumentsLabel = computed(() => {
  const maxFiles = parseInt(core.config.get('batchDownloadMaxNbFiles'))
  const maxSize = core.config.get('batchDownloadMaxSize')
  const maxSizeBytes = byteSize(maxSize)
  const locales = { maxFiles: n(maxFiles), maxSize: humanSize(maxSizeBytes, false, tm('human.size')) }

  if (props.total > maxFiles) {
    return t('documentEntriesHeader.batchDownloadDocumentsWarning', locales)
  }

  return t('documentEntriesHeader.batchDownloadDocuments', locales)
})

const batchDownloadDocumentsUri = computed(() => {
  const from = 0
  const query = { ...searchStore.toRouteQuery, from }
  const { fullPath } = router.resolve({ name: 'search', query })
  return fullPath
})

const runBatchDownload = async () => {
  try {
    await searchStore.runBatchDownload(batchDownloadDocumentsUri.value)
    const { href } = router.resolve({ name: 'task.batch-download.list' })
    const body = t('documentEntriesHeader.batchDownloadCreated')
    const linkLabel = t('documentEntriesHeader.batchDownloadLink')
    toast.success(body, { href, linkLabel })
  }
  catch {
    const body = t('documentEntriesHeader.batchDownloadError')
    toast.error(body)
  }
}

const classList = computed(() => {
  return {
    'document-entries-header--compact': compact.value
  }
})

// Hide the batch mode toggle if there are no items to select
watch(toRef(props, 'total'), total => (selectMode.value = selectMode.value && total > 0))
</script>

<template>
  <div
    ref="element"
    class="document-entries-header"
    :class="classList"
  >
    <button-toggle-batch-mode
      v-model:active="selectMode"
      :loading="loading"
      :disabled="total === 0"
    />
    <slot v-bind="{ compact }">
      <div>
        <row-pagination-documents
          v-model="page"
          :no-next="noNextPage"
          :no-last="noLastPage"
          :total-rows="total"
          :per-page="perPage"
          :compact="compact"
        />
        <button-download-documents
          :label="batchDownloadDocumentsLabel"
          @click="runBatchDownload"
        />
      </div>
    </slot>
  </div>
</template>

<style lang="scss" scoped>
.document-entries-header {
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: $spacer;
  padding: 0;
  height: calc(2.875rem + #{$spacer * 2});

  &--compact {
    justify-content: space-between;
  }

  & > * {
    flex-shrink: 0;
  }
}
</style>
