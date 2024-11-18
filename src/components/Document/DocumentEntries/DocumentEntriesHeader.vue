<script setup>
import { computed, toRef, useTemplateRef, watch } from 'vue'
import { TinyPagination } from '@icij/murmur-next'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

import { useCompact } from '@/composables/compact'
import { useCore } from '@/composables/core'
import ButtonToggleBatchMode from '@/components/Button/ButtonToggleBatchMode'
import ButtonDownloadDocuments from '@/components/Button/ButtonDownloadDocuments'
import byteSize from '@/utils/byteSize'
import humanSize from '@/utils/humanSize'

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
    default: 660
  },
  loading: {
    type: Boolean
  }
})

const elementRef = useTemplateRef('element')
const { compact } = useCompact(elementRef, { threshold: toRef(props, 'compactThreshold') })
const { core, toast } = useCore()
const { t, tm, n } = useI18n()
const { dispatch, getters } = useStore()
const router = useRouter()

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
  const query = { ...getters['search/toRouteQuery'](), from }
  const { fullPath } = router.resolve({ name: 'search', query })
  return fullPath
})

const runBatchDownload = async () => {
  try {
    await dispatch('search/runBatchDownload', batchDownloadDocumentsUri.value)
    const { href } = router.resolve({ name: 'task.batch-download.list' })
    const body = t('documentEntriesHeader.batchDownloadCreated')
    const linkLabel = t('documentEntriesHeader.batchDownloadLink')
    toast.success(body, { href, linkLabel })
  } catch (_) {
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
watch(toRef(props, 'total'), (total) => (selectMode.value = selectMode.value && total > 0))
</script>

<template>
  <div ref="element" class="document-entries-header" :class="classList">
    <button-toggle-batch-mode v-model:active="selectMode" :loading="loading" :disabled="total === 0" />
    <slot v-bind="{ compact }">
      <div>
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
        <button-download-documents :label="batchDownloadDocumentsLabel" @click="runBatchDownload" />
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
  gap: $spacer-xs;
  padding: $spacer 0;

  &--compact {
    flex-direction: row-reverse;
    justify-content: space-between;
  }

  & > * {
    flex-shrink: 0;
  }
}
</style>
