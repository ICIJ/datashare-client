<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import AppModal from '@/components/AppModal/AppModal'
import humanSize from '@/utils/humanSize'
import image from '@/assets/images/illustrations/app-modal-alert-naming-light.svg'
import imageDark from '@/assets/images/illustrations/app-modal-alert-naming-dark.svg'

const props = defineProps({
  maxNbFiles: { type: Number, required: true },
  maxSizeBytes: { type: Number, required: true },
  estimatedCount: { type: Number, default: null },
  estimatedSize: { type: Number, default: null }
})

const { t, tm, n } = useI18n()

const isKnown = computed(() => props.estimatedCount !== null && props.estimatedSize !== null)
const formattedEstimatedSize = computed(() => humanSize(props.estimatedSize, false, tm('human.size')))
const formattedMaxSize = computed(() => humanSize(props.maxSizeBytes, false, tm('human.size')))
</script>

<template>
  <app-modal
    class="batch-download-confirm-modal"
    :image="image"
    :image-dark="imageDark"
    :image-width="110"
    :title="t('batchDownloadConfirmModal.title')"
  >
    <div class="batch-download-confirm-modal__content text-center text-secondary">
      <p
        v-if="isKnown"
        class="batch-download-confirm-modal__content__message"
      >
        {{ t('batchDownloadConfirmModal.knownTruncation', {
          estimatedCount: n(estimatedCount),
          estimatedSize: formattedEstimatedSize,
          maxFiles: n(maxNbFiles),
          maxSize: formattedMaxSize
        }) }}
      </p>
      <p
        v-else
        class="batch-download-confirm-modal__content__message"
      >
        {{ t('batchDownloadConfirmModal.unknownTruncation', {
          maxFiles: n(maxNbFiles),
          maxSize: formattedMaxSize
        }) }}
      </p>
      <p class="batch-download-confirm-modal__content__message">
        {{ t('batchDownloadConfirmModal.question') }}
      </p>
    </div>
  </app-modal>
</template>
