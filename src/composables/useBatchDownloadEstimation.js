import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useCore } from '@/composables/useCore'
import { useSearchStore } from '@/store/modules'
import byteSize from '@/utils/byteSize'
import humanSize from '@/utils/humanSize'

export function useBatchDownloadEstimation() {
  const core = useCore()
  const searchStore = useSearchStore.inject()
  const { tm } = useI18n()

  const loading = ref(false)
  const estimatedCount = ref(0)
  const estimatedSize = ref(0)

  const maxNbFiles = computed(() => parseInt(core.config.get('batchDownloadMaxNbFiles'), 10))
  const maxSizeBytes = computed(() => byteSize(core.config.get('batchDownloadMaxSize')))
  const exceedsFileLimit = computed(() => estimatedCount.value > maxNbFiles.value)
  const exceedsSizeLimit = computed(() => estimatedSize.value > maxSizeBytes.value)
  const exceedsLimit = computed(() => exceedsFileLimit.value || exceedsSizeLimit.value)
  const formattedEstimatedSize = computed(() => humanSize(estimatedSize.value, false, tm('human.size')))
  const formattedMaxSize = computed(() => humanSize(maxSizeBytes.value, false, tm('human.size')))

  async function estimate() {
    loading.value = true
    try {
      const { estimatedCount: c, estimatedSize: s } = await searchStore.estimateDownloadSize()
      estimatedCount.value = c
      estimatedSize.value = s
      return { estimatedCount: c, estimatedSize: s }
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    estimatedCount,
    estimatedSize,
    maxNbFiles,
    maxSizeBytes,
    exceedsFileLimit,
    exceedsSizeLimit,
    exceedsLimit,
    formattedEstimatedSize,
    formattedMaxSize,
    estimate
  }
}
