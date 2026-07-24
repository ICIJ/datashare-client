<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { useCore } from '@/composables/useCore'
import { BATCH_DOWNLOAD_TRUNCATION_REASON } from '@/enums/batchDownload'
import byteSize from '@/utils/byteSize'
import humanSize from '@/utils/humanSize'

const REASON_I18N_KEY = Object.freeze({
  [BATCH_DOWNLOAD_TRUNCATION_REASON.SIZE_LIMIT]: 'sizeLimit',
  [BATCH_DOWNLOAD_TRUNCATION_REASON.FILE_COUNT_LIMIT]: 'fileCountLimit'
})

const props = defineProps({
  truncationReason: {
    type: String,
    default: null
  }
})

const core = useCore()
const { t, tm, n } = useI18n()

const reasonKey = computed(() => REASON_I18N_KEY[props.truncationReason])

const batchDownloadMaxSize = core.config.get('batchDownloadMaxSize')
const batchDownloadMaxNbFiles = core.config.get('batchDownloadMaxNbFiles')

const isSizeLimit = computed(() => props.truncationReason === BATCH_DOWNLOAD_TRUNCATION_REASON.SIZE_LIMIT)
const isFileCountLimit = computed(() => props.truncationReason === BATCH_DOWNLOAD_TRUNCATION_REASON.FILE_COUNT_LIMIT)

const formattedMaxSize = computed(() => humanSize(byteSize(batchDownloadMaxSize), false, tm('human.size')))
const formattedMaxNbFiles = computed(() => n(parseInt(batchDownloadMaxNbFiles)))

const formattedLimit = computed(() => {
  if (isSizeLimit.value) {
    return formattedMaxSize.value
  }
  if (isFileCountLimit.value) {
    return formattedMaxNbFiles.value
  }
  return ''
})
</script>

<template>
  <p
    v-if="reasonKey"
    class="batch-download-truncated-alert text-muted small mb-0"
  >
    <i18n-t :keypath="`task.batch-download.list.truncatedAlert.${reasonKey}`">
      <template #reason>
        <strong>{{ t(`task.batch-download.list.truncatedAlert.reasons.${reasonKey}`) }}</strong>
      </template>
      <template #limit>
        {{ formattedLimit }}
      </template>
    </i18n-t>
  </p>
</template>
