<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import AppModal from '@/components/AppModal/AppModal'
import humanSize from '@/utils/humanSize'
import image from '@/assets/images/illustrations/app-modal-default-light.svg'
import imageDark from '@/assets/images/illustrations/app-modal-default-dark.svg'

const props = defineProps({
  estimatedCount: { type: Number, required: true },
  estimatedSize: { type: Number, required: true },
  maxNbFiles: { type: Number, required: true },
  maxSizeBytes: { type: Number, required: true }
})

const { t, tm, n } = useI18n()

const exceedsFileLimit = computed(() => props.estimatedCount > props.maxNbFiles)
const exceedsSizeLimit = computed(() => props.estimatedSize > props.maxSizeBytes)
const formattedEstimatedSize = computed(() => humanSize(props.estimatedSize, false, tm('human.size')))
const formattedMaxSize = computed(() => humanSize(props.maxSizeBytes, false, tm('human.size')))
</script>

<template>
  <app-modal
    :image="image"
    :image-dark="imageDark"
    :title="t('batchDownloadConfirmModal.title')"
  >
    <div class="text-center text-secondary">
      <p v-if="exceedsFileLimit">
        {{ t('batchDownloadConfirmModal.exceedsFileLimit', { estimated: n(estimatedCount), limit: n(maxNbFiles) }) }}
      </p>
      <p v-if="exceedsSizeLimit">
        {{ t('batchDownloadConfirmModal.exceedsSizeLimit', { estimated: formattedEstimatedSize, limit: formattedMaxSize }) }}
      </p>
    </div>
  </app-modal>
</template>
