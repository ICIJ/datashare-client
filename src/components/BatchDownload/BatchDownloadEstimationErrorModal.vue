<script setup>
import { useI18n } from 'vue-i18n'

import AppModal from '@/components/AppModal/AppModal'
import image from '@/assets/images/illustrations/app-modal-default-light.svg'
import imageDark from '@/assets/images/illustrations/app-modal-default-dark.svg'

const { t } = useI18n()
</script>

<template>
  <app-modal
    :image="image"
    :image-dark="imageDark"
    :title="t('batchDownloadEstimationErrorModal.title')"
  >
    <div class="text-center text-secondary">
      {{ t('batchDownloadEstimationErrorModal.description') }}
    </div>
  </app-modal>
</template>
